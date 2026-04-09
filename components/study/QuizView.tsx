'use client'

import { useState } from 'react'
import type { QuizQuestion } from '@/lib/db/types'

interface Props {
  quiz: QuizQuestion[]
  documentId: string
}

type AnswerMap = Record<number, string>

export default function QuizView({ quiz, documentId }: Props) {
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  function selectAnswer(index: number, option: string) {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [index]: option }))
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < quiz.length) return
    setSaving(true)

    const score = quiz.filter((q, i) => answers[i] === q.answer).length

    await fetch('/api/ai/quiz-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, score, total: quiz.length }),
    })

    setSubmitted(true)
    setSaving(false)
  }

  function handleRetry() {
    setAnswers({})
    setSubmitted(false)
  }

  const score = quiz.filter((q, i) => answers[i] === q.answer).length
  const allAnswered = Object.keys(answers).length === quiz.length

  if (submitted) {
    const pct = Math.round((score / quiz.length) * 100)
    return (
      <div className="text-center py-8">
        <div className="text-5xl font-bold text-gray-900 mb-2">{pct}%</div>
        <p className="text-gray-500 mb-1">{score} / {quiz.length} correct</p>
        <p className="text-sm text-gray-400 mb-8">
          {pct >= 80 ? 'Great work!' : pct >= 60 ? 'Keep studying!' : 'Review your notes and try again.'}
        </p>

        {/* Review answers */}
        <div className="text-left space-y-4 mb-8">
          {quiz.map((q, i) => {
            const isCorrect = answers[i] === q.answer
            return (
              <div key={i} className={`rounded-xl border p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <p className="text-sm font-medium text-gray-900 mb-2">{q.question}</p>
                <p className="text-sm text-gray-600">
                  Your answer: <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{answers[i]}</span>
                </p>
                {!isCorrect && (
                  <p className="text-sm text-gray-600">Correct: <span className="text-green-700 font-medium">{q.answer}</span></p>
                )}
                <p className="text-xs text-gray-500 mt-2">{q.explanation}</p>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleRetry}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {quiz.map((q, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium text-gray-900 mb-3">
            <span className="text-gray-400 mr-2">{i + 1}.</span>{q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((option) => (
              <button
                key={option}
                onClick={() => selectAnswer(i, option)}
                className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  answers[i] === option
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || saving}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : `Submit (${Object.keys(answers).length}/${quiz.length} answered)`}
      </button>
    </div>
  )
}
