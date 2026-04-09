import { createServerSupabaseClient } from '@/lib/db/supabase'
import { redirect } from 'next/navigation'
import DocumentClient from './DocumentClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DocumentPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!document) redirect('/dashboard')

  const [{ data: studyResults }, { data: videos }] = await Promise.all([
    supabase.from('study_results').select('*').eq('document_id', id).single(),
    supabase.from('video_recommendations').select('*').eq('document_id', id).order('relevance_score', { ascending: false }),
  ])

  return (
    <DocumentClient
      document={document}
      initialResults={studyResults ?? null}
      initialVideos={videos ?? []}
    />
  )
}
