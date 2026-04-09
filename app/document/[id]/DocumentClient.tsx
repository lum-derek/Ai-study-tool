'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import SummaryView from '@/components/study/SummaryView'
import FlashcardDeck from '@/components/study/FlashcardDeck'
import QuizView from '@/components/study/QuizView'
import ChatView from '@/components/study/ChatView'
import VideoGrid from '@/components/study/VideoGrid'
import ProgressView from '@/components/study/ProgressView'
import type { Document, StudyResult, VideoRecommendation } from '@/lib/db/types'

type Tab = 'summary' | 'flashcards' | 'quiz' | 'chat' | 'videos' | 'progress'

interface Props {
  document: Document
  initialResults: StudyResult | null
  initialVideos: VideoRecommendation[]
}

export default function DocumentClient({ document, initialResults, initialVideos }: Props) {
  const [results, setResults] = useState<StudyResult | null>(initialResults)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  async function handleGenerate() {
    setError('')
    setGenerating(true)

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: document.id }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setGenerating(false)
      return
    }

    setResults(data.results)
    setGenerating(false)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'summary',    label: 'Summary' },
    { key: 'flashcards', label: 'Flashcards' },
    { key: 'quiz',       label: 'Quiz' },
    { key: 'chat',       label: 'Chat' },
    { key: 'videos',     label: 'Videos' },
    { key: 'progress',   label: 'Progress' },
  ]

  const standaloneTab = activeTab === 'chat' || activeTab === 'videos' || activeTab === 'progress'
  const showGeneratePrompt = !results && !standaloneTab

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">My Notes</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium truncate">{document.title}</span>
        <span className="ml-auto text-xs text-gray-400">{document.char_count.toLocaleString()} chars</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Generate prompt — only for study material tabs when not yet generated */}
        {showGeneratePrompt && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-6">
            <p className="text-gray-600 text-sm mb-4">
              Ready to generate your study materials?
            </p>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Generating — this takes ~15 seconds...
                </span>
              ) : (
                'Generate Study Materials'
              )}
            </button>
          </div>
        )}

        {/* Tabs — always visible */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-fit py-3 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'chat' && (
              <ChatView documentId={document.id} />
            )}

            {activeTab === 'videos' && (
              <VideoGrid documentId={document.id} initialVideos={initialVideos} />
            )}

            {activeTab === 'progress' && (
              <ProgressView documentId={document.id} />
            )}

            {activeTab !== 'chat' && activeTab !== 'videos' && activeTab !== 'progress' && results && (
              <>
                {activeTab === 'summary' && results.summary && (
                  <SummaryView summary={results.summary} />
                )}
                {activeTab === 'flashcards' && results.flashcards && (
                  <FlashcardDeck flashcards={results.flashcards} />
                )}
                {activeTab === 'quiz' && results.quiz && (
                  <QuizView quiz={results.quiz} documentId={document.id} />
                )}
              </>
            )}

            {!standaloneTab && !results && !generating && (
              <p className="text-sm text-gray-400 text-center py-8">
                Generate your study materials to see content here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
