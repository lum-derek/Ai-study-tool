export function videoSearchQueriesPrompt(notes: string): string {
  return `You are an educational search assistant.

A student has the following study notes:
"""
${notes}
"""

Generate exactly 4 YouTube search queries to find high-quality educational videos on the key concepts in these notes.

Rules:
- Each query targets one specific concept, not all of the notes
- Prefer queries that return lecture or explainer videos (e.g. "explained", "tutorial", "how does X work")
- 4 to 8 words each
- No course names or school names

Return ONLY a valid JSON array of strings. No extra text:
["query one", "query two", "query three", "query four"]
`
}

export function summaryPrompt(notes: string): string {
  return `You are an expert study assistant.

Summarize the following study notes into clear, concise paragraphs.
Focus on the most important concepts, definitions, and relationships.
Write at a level appropriate for a student reviewing before an exam.
Do not use bullet points. Write in flowing prose. Aim for 3-5 paragraphs.

Notes:
"""
${notes}
"""
`
}

export function flashcardsPrompt(notes: string, count = 10): string {
  return `You are an expert study assistant.

Create exactly ${count} flashcards from the following study notes.
Each flashcard should test one specific concept, definition, or fact.
Vary the question types: definitions, cause-and-effect, comparisons, applications.

Return ONLY a valid JSON array. No extra text. Format:
[
  { "front": "question here", "back": "answer here" }
]

Notes:
"""
${notes}
"""
`
}

export function chatPrompt(context: string, question: string, history: { role: string; content: string }[]): string {
  const historyText = history.length > 0
    ? history.map((m) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`).join('\n')
    : 'None'

  return `You are a helpful study assistant. Answer the student's question using ONLY the context provided from their notes.
If the answer is not in the context, say "I don't see that covered in your notes" and suggest they check other sources.
Be concise and clear. Use bullet points only when listing multiple items.

Context from notes:
"""
${context}
"""

Conversation so far:
${historyText}

Student's question: ${question}

Answer:`
}

export function quizPrompt(notes: string, count = 5): string {
  return `You are an expert study assistant.

Create exactly ${count} multiple-choice quiz questions from the following study notes.
Each question must have exactly 4 options with one correct answer.
Include a brief explanation for why the correct answer is right.

Return ONLY a valid JSON array. No extra text. Format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explanation": "..."
  }
]

Notes:
"""
${notes}
"""
`
}
