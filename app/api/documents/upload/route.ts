import { createServerSupabaseClient } from '@/lib/db/supabase'
import { deriveTitleFromText, stripMarkdown, chunkText } from '@/lib/utils/text'
import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const pastedText = formData.get('text') as string | null

  if (!file && !pastedText) {
    return NextResponse.json({ error: 'No file or text provided' }, { status: 400 })
  }

  let rawText = ''
  let fileUrl: string | null = null
  let fileType: 'text' | 'pdf' = 'text'

  // --- Handle PDF upload ---
  if (file && file.type === 'application/pdf') {
    fileType = 'pdf'

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF must be under 10MB' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const fileName = `${user.id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('study-files')
      .upload(fileName, fileBuffer, { contentType: 'application/pdf' })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('study-files')
      .getPublicUrl(fileName)
    fileUrl = urlData.publicUrl

    // Extract text from PDF
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse/dist/pdf-parse/cjs/index.cjs')
      const parsed = await pdfParse(Buffer.from(fileBuffer))
      rawText = parsed.text
    } catch {
      return NextResponse.json({ error: 'Could not extract text from PDF. Try copying and pasting the text directly.' }, { status: 422 })
    }
  }

  // --- Handle plain text or .txt file ---
  else if (file && file.type === 'text/plain') {
    rawText = await file.text()
  } else if (pastedText) {
    rawText = pastedText
  } else {
    return NextResponse.json(
      { error: 'Unsupported file type. Upload a PDF or .txt file, or paste text directly.' },
      { status: 400 }
    )
  }

  rawText = rawText.trim()

  if (rawText.length < 50) {
    return NextResponse.json(
      { error: 'Not enough text to process. Add at least a few sentences.' },
      { status: 400 }
    )
  }

  const cleanedText = stripMarkdown(rawText)
  const title = deriveTitleFromText(cleanedText)

  // Save document to database
  const { data: document, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title,
      raw_text: cleanedText,
      file_url: fileUrl,
      file_type: fileType,
      char_count: cleanedText.length,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
  }

  // Store chunks for RAG
  const chunks = chunkText(cleanedText)
  const chunkRows = chunks.map((content, index) => ({
    document_id: document.id,
    user_id: user.id,
    content,
    chunk_index: index,
  }))

  await supabase.from('document_chunks').insert(chunkRows)

  return NextResponse.json({
    documentId: document.id,
    title: document.title,
    charCount: document.char_count,
  }, { status: 201 })
}
