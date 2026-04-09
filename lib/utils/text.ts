/**
 * Truncates text to a maximum number of characters.
 * Cuts at the nearest word boundary to avoid splitting mid-word.
 */
export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const truncated = text.slice(0, maxChars)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated
}

/**
 * Strips markdown formatting for cleaner AI prompt input.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*_]{3,}$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Splits text into chunks of approximately chunkSize characters.
 * Splits on paragraph boundaries where possible.
 */
export function chunkText(text: string, chunkSize = 1500): string[] {
  const paragraphs = text.split(/\n\n+/)
  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current.length > 0) {
      chunks.push(current.trim())
      current = para
    } else {
      current += (current ? '\n\n' : '') + para
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks
}

/**
 * Derives a document title from the first non-empty line of text.
 */
export function deriveTitleFromText(text: string): string {
  const firstLine = text.split('\n').find((line) => line.trim().length > 0) ?? 'Untitled'
  return firstLine.replace(/^#+\s*/, '').slice(0, 80).trim()
}
