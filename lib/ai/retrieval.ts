import type { DocumentChunk } from '@/lib/db/types'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'at', 'to', 'for',
  'of', 'and', 'or', 'but', 'with', 'this', 'that', 'are', 'was',
  'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'what', 'how',
  'why', 'when', 'where', 'who', 'which', 'can', 'its', 'their',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

function scoreChunk(chunk: string, queryTokens: string[]): number {
  const chunkTokens = new Set(tokenize(chunk))
  let score = 0
  for (const token of queryTokens) {
    if (chunkTokens.has(token)) score++
    // Partial match — token appears as substring in any chunk token
    else if ([...chunkTokens].some((t) => t.includes(token))) score += 0.5
  }
  return score
}

/**
 * Returns the top K most relevant chunks for a given query.
 * Uses keyword overlap scoring — no embeddings required.
 */
export function retrieveRelevantChunks(
  chunks: DocumentChunk[],
  query: string,
  topK = 4
): DocumentChunk[] {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return chunks.slice(0, topK)

  const scored = chunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk.content, queryTokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  // Always include at least one chunk even if score is 0
  if (scored.length === 0) return chunks.slice(0, topK)

  return scored.slice(0, topK).map(({ chunk }) => chunk)
}
