import { createServerSupabaseClient } from '@/lib/db/supabase'
import { generateAll } from '@/lib/ai/generate'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { documentId } = await request.json()
  if (!documentId) {
    return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
  }

  // Fetch document — RLS ensures user can only access their own
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('id, raw_text')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (docError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Check if results already exist — return cached if so
  const { data: existing } = await supabase
    .from('study_results')
    .select('*')
    .eq('document_id', documentId)
    .single()

  if (existing) {
    return NextResponse.json({ results: existing, cached: true })
  }

  // Generate summary, flashcards, and quiz in parallel
  let generated
  try {
    generated = await generateAll(document.raw_text)
  } catch (err) {
    console.error('AI generation error:', err)
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
  }

  // Save results to database
  const { data: results, error: saveError } = await supabase
    .from('study_results')
    .insert({
      document_id: documentId,
      user_id: user.id,
      summary: generated.summary,
      flashcards: generated.flashcards,
      quiz: generated.quiz,
    })
    .select()
    .single()

  if (saveError) {
    return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
  }

  return NextResponse.json({ results, cached: false }, { status: 201 })
}
