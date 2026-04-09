import { createServerSupabaseClient } from '@/lib/db/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  return NextResponse.json({ message: 'Logged out successfully' })
}
