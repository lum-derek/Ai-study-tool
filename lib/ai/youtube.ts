export interface YouTubeVideo {
  videoId: string
  title: string
  channel: string
  thumbnailUrl: string
  youtubeUrl: string
  duration: string | null
  viewCount: number | null
  publishedAt: string
  description: string
}

const BASE_URL = 'https://www.googleapis.com/youtube/v3'

/**
 * Searches YouTube for videos matching the query.
 * Returns up to maxResults video IDs + snippet data.
 */
async function searchVideos(query: string, maxResults = 5): Promise<YouTubeVideo[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    relevanceLanguage: 'en',
    maxResults: String(maxResults),
    key: process.env.YOUTUBE_API_KEY!,
  })

  const res = await fetch(`${BASE_URL}/search?${params}`)
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`)

  const data = await res.json()
  if (!data.items?.length) return []

  return data.items.map((item: Record<string, unknown>) => {
    const id = item.id as Record<string, string>
    const snippet = item.snippet as Record<string, unknown>
    const thumbnails = snippet.thumbnails as Record<string, Record<string, string>>
    return {
      videoId: id.videoId,
      title: snippet.title as string,
      channel: snippet.channelTitle as string,
      thumbnailUrl: thumbnails?.high?.url ?? thumbnails?.default?.url ?? '',
      youtubeUrl: `https://www.youtube.com/watch?v=${id.videoId}`,
      duration: null,
      viewCount: null,
      publishedAt: snippet.publishedAt as string,
      description: snippet.description as string,
    }
  })
}

/**
 * Fetches duration and view count for a list of video IDs in one API call.
 */
async function enrichVideos(videos: YouTubeVideo[]): Promise<YouTubeVideo[]> {
  if (videos.length === 0) return []

  const ids = videos.map((v) => v.videoId).join(',')
  const params = new URLSearchParams({
    part: 'contentDetails,statistics',
    id: ids,
    key: process.env.YOUTUBE_API_KEY!,
  })

  const res = await fetch(`${BASE_URL}/videos?${params}`)
  if (!res.ok) return videos // Return unenriched if this fails

  const data = await res.json()
  const detailMap = new Map<string, { duration: string; viewCount: number }>()

  for (const item of data.items ?? []) {
    detailMap.set(item.id, {
      duration: item.contentDetails?.duration ?? null,
      viewCount: parseInt(item.statistics?.viewCount ?? '0', 10),
    })
  }

  return videos.map((v) => ({
    ...v,
    duration: detailMap.get(v.videoId)?.duration ?? null,
    viewCount: detailMap.get(v.videoId)?.viewCount ?? null,
  }))
}

/**
 * Runs multiple search queries in parallel and returns enriched, deduplicated results.
 */
export async function fetchVideosForQueries(queries: string[]): Promise<YouTubeVideo[]> {
  const results = await Promise.allSettled(
    queries.map((q) => searchVideos(q, 5))
  )

  // Collect successful results and deduplicate by videoId
  const seen = new Set<string>()
  const videos: YouTubeVideo[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const video of result.value) {
        if (!seen.has(video.videoId)) {
          seen.add(video.videoId)
          videos.push(video)
        }
      }
    }
  }

  return enrichVideos(videos)
}

/**
 * Parses ISO 8601 duration (e.g. PT8M42S) into total seconds.
 */
export function parseDurationSeconds(iso: string | null): number {
  if (!iso) return 0
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] ?? '0', 10)
  const mins = parseInt(match[2] ?? '0', 10)
  const secs = parseInt(match[3] ?? '0', 10)
  return hours * 3600 + mins * 60 + secs
}

/**
 * Formats seconds into a human-readable string e.g. "8:42" or "1:02:15"
 */
export function formatDuration(iso: string | null): string {
  const total = parseDurationSeconds(iso)
  if (total === 0) return ''
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
