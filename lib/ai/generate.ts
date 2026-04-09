import { callClaude, callClaudeJSON } from './claude'
import { summaryPrompt, flashcardsPrompt, quizPrompt } from './prompts'
import { truncateText } from '@/lib/utils/text'
import type { Flashcard, QuizQuestion } from '@/lib/db/types'

const MAX_CHARS = 24000 // ~6000 tokens — safe limit for Haiku

export async function generateSummary(notes: string): Promise<string> {
  const text = truncateText(notes, MAX_CHARS)
  return callClaude(summaryPrompt(text), 1000)
}

export async function generateFlashcards(notes: string, count = 10): Promise<Flashcard[]> {
  const text = truncateText(notes, MAX_CHARS)
  return callClaudeJSON<Flashcard[]>(flashcardsPrompt(text, count), 2000)
}

export async function generateQuiz(notes: string, count = 5): Promise<QuizQuestion[]> {
  const text = truncateText(notes, MAX_CHARS)
  return callClaudeJSON<QuizQuestion[]>(quizPrompt(text, count), 2000)
}

export async function generateAll(notes: string) {
  const [summary, flashcards, quiz] = await Promise.all([
    generateSummary(notes),
    generateFlashcards(notes),
    generateQuiz(notes),
  ])
  return { summary, flashcards, quiz }
}
