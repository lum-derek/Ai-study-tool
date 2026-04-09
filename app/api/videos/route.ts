import { createServerSupabaseClient } from '@/lib/db/supabase'
import { callClaudeJSON } from '@/lib/ai/claude'
import { videoSearchQueriesPrompt } from '@/lib/ai/prompts'
import { fetchVideosForQueries } from '@/lib/ai/youtube'
import { rankVideos } from '@/lib/ai/ranking'
import { truncateText } from '@/lib/utils/text'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { documentId } = await request.json()
  if (!documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 })

  // Verify document belongs to user
  const { data: document } = await supabase
    .from('documents')
    .select('id, raw_text')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  // Return cached results if they exist
  const { data: cached } = await supabase
    .from('video_recommendations')
    .select('*')
    .eq('document_id', documentId)
    .order('relevance_score', { ascending: false })

  if (cached && cached.length > 0) {
    return NextResponse.json({ videos: cached, cached: true })
  }

  // No YouTube API key configured
  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'YouTube API is not configured.' }, { status: 503 })
  }

  // Generate search queries with Claude
  const truncatedNotes = truncateText(document.raw_text, 8000)
  let queries: string[]

  try {
    queries = await callClaudeJSON<string[]>(videoSearchQueriesPrompt(truncatedNotes), 200)
    if (!Array.isArray(queries) || queries.length === 0) throw new Error('Invalid queries')
  } catch {
    return NextResponse.json({ error: 'Failed to generate search queries.' }, { status: 500 })
  }

  // Fetch and rank videos
  let videos
  try {
    const raw = await fetchVideosForQueries(queries)
    videos = rankVideos(raw, document.raw_text, 8)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos. Check your YouTube API key.' }, { status: 500 })
  }

  if (videos.length === 0) {
    return NextResponse.json({ videos: [], cached: false })
  }

  // Save to database
  const rows = videos.map((v, i) => ({
    document_id: documentId,
    user_id: user.id,
    video_id: v.videoId,
    title: v.title,
    channel: v.channel,
    thumbnail_url: v.thumbnailUrl,
    youtube_url: v.youtubeUrl,
    duration: v.duration,
    view_count: v.viewCount,
    ai_summary: null,
    relevance_score: 1 - i * 0.1, // Simple descending rank score
  }))

  const { data: saved } = await supabase
    .from('video_recommendations')
    .insert(rows)
    .select()

  return NextResponse.json({ videos: saved ?? rows, cached: false })
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('documentId')
  if (!documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 })

  const { data: videos } = await supabase
    .from('video_recommendations')
    .select('*')
    .eq('document_id', documentId)
    .eq('user_id', user.id)
    .order('relevance_score', { ascending: false })

  return NextResponse.json({ videos: videos ?? [] })
}
