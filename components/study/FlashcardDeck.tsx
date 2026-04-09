'use client'

import { useState } from 'react'
import type { Flashcard } from '@/lib/db/types'

interface Props {
  flashcards: Flashcard[]
}

export default function FlashcardDeck({ flashcards }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = flashcards[index]
  const total = flashcards.length

  function next() {
    setFlipped(false)
    setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), 150)
  }

  function prev() {
    setFlipped(false)
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <p className="text-sm text-gray-500">
        {index + 1} / {total}
      </p>

      {/* Card */}
      <div
        onClick={() => setFlipped((f) => !f)}
        className="w-full max-w-xl min-h-48 bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow select-none"
      >
        <div className="text-center">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            {flipped ? 'Answer' : 'Question'}
          </p>
          <p className="text-gray-900 text-base leading-relaxed">
            {flipped ? card.back : card.front}
          </p>
          {!flipped && (
            <p className="text-xs text-gray-400 mt-4">Click to reveal answer</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={prev}
          disabled={index === 0}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={next}
          disabled={index === total - 1}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}
