'use client'

import { useEffect, useState } from 'react'
import type { QuizAttempt } from '@/lib/db/types'

interface Props {
  documentId: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ScoreBar({ pct, isLatest, isBest }: { pct: number; isLatest: boolean; isBest: boolean }) {
  const color =
    pct >= 80 ? 'bg-green-500' :
    pct >= 60 ? 'bg-yellow-400' :
    'bg-red-400'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-800 w-10 text-right">{pct}%</span>
      <div className="flex gap-1 w-16">
        {isBest   && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Best</span>}
        {isLatest && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">Latest</span>}
      </div>
    </div>
  )
}

export default function ProgressView({ documentId }: Props) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    async function load() {
      const res  = await fetch(`/api/ai/quiz-attempts?documentId=${documentId}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      setAttempts(data.attempts)
      setLoading(false)
    }
    load()
  }, [documentId])

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <span className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-600 text-center py-8">{error}</p>
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-2">📊</p>
        <p className="text-sm font-medium text-gray-700">No quiz attempts yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Complete a quiz to start tracking your progress.
        </p>
      </div>
    )
  }

  const scores    = attempts.map((a) => Math.round((a.score / a.total) * 100))
  const bestScore = Math.max(...scores)
  const latestIdx = attempts.length - 1
  const avgScore  = Math.round(scores.reduce((s, p) => s + p, 0) / scores.length)

  // Trend: compare first half avg vs second half avg
  const half    = Math.floor(scores.length / 2)
  const early   = scores.slice(0, half || 1)
  const recent  = scores.slice(half)
  const earlyAvg  = early.reduce((s, p)  => s + p, 0) / early.length
  const recentAvg = recent.reduce((s, p) => s + p, 0) / recent.length
  const trend = scores.length < 2 ? null : recentAvg > earlyAvg ? 'up' : recentAvg < earlyAvg ? 'down' : 'flat'

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{attempts.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Attempts</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{bestScore}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Best Score</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{avgScore}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Average</p>
        </div>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
          trend === 'up'   ? 'bg-green-50 text-green-700 border border-green-100' :
          trend === 'down' ? 'bg-red-50 text-red-700 border border-red-100' :
                             'bg-gray-50 text-gray-600 border border-gray-200'
        }`}>
          <span>
            {trend === 'up'   ? '📈 You\'re improving!' :
             trend === 'down' ? '📉 Keep studying — you\'ve got this.' :
                               '➡️ Consistent performance.'}
          </span>
        </div>
      )}

      {/* Attempt list */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          All Attempts
        </h3>
        <div className="space-y-3">
          {attempts.map((attempt, i) => {
            const pct = scores[i]
            return (
              <div key={attempt.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{formatDate(attempt.created_at)}</span>
                  <span className="text-xs text-gray-500">{attempt.score}/{attempt.total} correct</span>
                </div>
                <ScoreBar
                  pct={pct}
                  isBest={pct === bestScore}
                  isLatest={i === latestIdx}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
