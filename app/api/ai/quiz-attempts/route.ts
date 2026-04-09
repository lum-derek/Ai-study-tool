import { createServerSupabaseClient } from '@/lib/db/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('documentId')
  if (!documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 })

  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select('id, score, total, created_at')
    .eq('document_id', documentId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })

  return NextResponse.json({ attempts: attempts ?? [] })
}
