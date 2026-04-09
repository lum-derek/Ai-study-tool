import { createServerSupabaseClient } from '@/lib/db/supabase'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Handles the Supabase email confirmation redirect.
 * When a user clicks the confirmation link in their email,
 * Supabase redirects to /api/auth/callback?code=xxx
 * This route exchanges the code for a session and redirects to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
