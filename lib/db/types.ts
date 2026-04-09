export type FileType = 'text' | 'pdf'

export interface Document {
  id: string
  user_id: string
  title: string
  raw_text: string
  file_url: string | null
  file_type: FileType
  char_count: number
  created_at: string
}

export interface Flashcard {
  front: string
  back: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  answer: string
  explanation: string
}

export interface StudyResult {
  id: string
  document_id: string
  user_id: string
  summary: string | null
  flashcards: Flashcard[] | null
  quiz: QuizQuestion[] | null
  created_at: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  user_id: string
  content: string
  chunk_index: number
  created_at: string
}

export interface VideoRecommendation {
  id: string
  document_id: string
  user_id: string
  video_id: string
  title: string
  channel: string
  thumbnail_url: string
  youtube_url: string
  duration: string | null
  view_count: number | null
  ai_summary: string | null
  relevance_score: number | null
  created_at: string
}

export interface QuizAttempt {
  id: string
  document_id: string
  user_id: string
  score: number
  total: number
  created_at: string
}
