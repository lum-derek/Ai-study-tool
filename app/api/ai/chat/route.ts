import { createServerSupabaseClient } from '@/lib/db/supabase'
import { retrieveRelevantChunks } from '@/lib/ai/retrieval'
import { chatPrompt } from '@/lib/ai/prompts'
import { callClaude } from '@/lib/ai/claude'
import { NextResponse } from 'next/server'

export const maxDuration = 30

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { documentId, question, history = [] } = await request.json() as {
    documentId: string
    question: string
    history: Message[]
  }

  if (!documentId || !question?.trim()) {
    return NextResponse.json({ error: 'documentId and question are required' }, { status: 400 })
  }

  // Fetch all chunks for this document
  const { data: chunks, error: chunksError } = await supabase
    .from('document_chunks')
    .select('*')
    .eq('document_id', documentId)
    .eq('user_id', user.id)
    .order('chunk_index')

  if (chunksError || !chunks || chunks.length === 0) {
    return NextResponse.json({ error: 'No content found for this document' }, { status: 404 })
  }

  // Retrieve the most relevant chunks for the question
  const relevant = retrieveRelevantChunks(chunks, question, 4)
  const context = relevant.map((c) => c.content).join('\n\n---\n\n')

  // Keep last 6 messages of history to stay within token limits
  const trimmedHistory = history.slice(-6)

  const prompt = chatPrompt(context, question, trimmedHistory)

  let answer: string
  try {
    answer = await callClaude(prompt, 800)
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Failed to get a response. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ answer })
}
