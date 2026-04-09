import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function callClaude(prompt: string, maxTokens = 2000): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text.trim()
}

/**
 * Calls Claude and parses the response as JSON.
 * Retries once if the first parse fails.
 */
export async function callClaudeJSON<T>(prompt: string, maxTokens = 2000): Promise<T> {
  const raw = await callClaude(prompt, maxTokens)

  // Strip markdown code fences if Claude wraps the JSON
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(cleaned) as T
  } catch {
    throw new Error(`Claude returned invalid JSON: ${cleaned.slice(0, 200)}`)
  }
}
