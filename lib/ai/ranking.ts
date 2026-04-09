import { YouTubeVideo, parseDurationSeconds } from './youtube'

const MIN_SECONDS = 3 * 60   // 3 minutes
const MAX_SECONDS = 3 * 3600 // 3 hours

/**
 * Removes videos that are too short (likely clips) or too long (likely full courses).
 */
function filterByDuration(videos: YouTubeVideo[]): YouTubeVideo[] {
  return videos.filter((v) => {
    const secs = parseDurationSeconds(v.duration)
    if (secs === 0) return true // Duration unknown — keep it
    return secs >= MIN_SECONDS && secs <= MAX_SECONDS
  })
}

/**
 * Scores a video on a 0–1 scale based on recency, views, and title relevance.
 */
function scoreVideo(video: YouTubeVideo, keywords: string[]): number {
  // Recency score
  const ageMs = Date.now() - new Date(video.publishedAt).getTime()
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365)
  const recencyScore = ageYears <= 2 ? 1.0 : ageYears <= 5 ? 0.6 : 0.2

  // View count score — log scale, 10M views = 1.0
  const views = video.viewCount ?? 0
  const viewScore = views > 0 ? Math.min(Math.log10(views) / 7, 1.0) : 0.1

  // Title keyword overlap
  const titleLower = video.title.toLowerCase()
  const matchCount = keywords.filter((kw) => titleLower.includes(kw)).length
  const keywordScore = keywords.length > 0 ? matchCount / keywords.length : 0

  return recencyScore * 0.25 + viewScore * 0.35 + keywordScore * 0.4
}

/**
 * Extracts meaningful keywords from notes for title matching.
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'and', 'or', 'of', 'in', 'to', 'for'])
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 20) // Top 20 keywords
}

/**
 * Filters by duration, scores by relevance, and returns the top N videos.
 */
export function rankVideos(videos: YouTubeVideo[], notes: string, topN = 8): YouTubeVideo[] {
  const filtered = filterByDuration(videos)
  const keywords = extractKeywords(notes)

  return filtered
    .map((v) => ({ video: v, score: scoreVideo(v, keywords) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ video }) => video)
}
