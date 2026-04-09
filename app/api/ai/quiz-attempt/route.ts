import { createServerSupabaseClient } from '@/lib/db/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { documentId, score, total } = await request.json()
  if (!documentId || score == null || !total) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await supabase.from('quiz_attempts').insert({
    document_id: documentId,
    user_id: user.id,
    score,
    total,
  })

  if (error) return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
