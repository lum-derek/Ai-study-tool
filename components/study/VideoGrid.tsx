'use client'

import { useState } from 'react'
import VideoCard from './VideoCard'
import type { VideoRecommendation } from '@/lib/db/types'

interface Props {
  documentId: string
  initialVideos: VideoRecommendation[]
}

export default function VideoGrid({ documentId, initialVideos }: Props) {
  const [videos, setVideos] = useState<VideoRecommendation[]>(initialVideos)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetched, setFetched] = useState(initialVideos.length > 0)

  async function handleFetch() {
    setError('')
    setLoading(true)

    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    setVideos(data.videos ?? [])
    setFetched(true)
    setLoading(false)
  }

  // Not yet fetched — show prompt
  if (!fetched) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-3">🎬</p>
        <p className="text-sm font-medium text-gray-700 mb-1">Find relevant YouTube videos</p>
        <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto">
          Claude will generate search queries from your notes and find the best educational videos.
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 max-w-sm mx-auto">
            {error}
          </p>
        )}
        <button
          onClick={handleFetch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Finding videos...
            </span>
          ) : (
            'Find Videos'
          )}
        </button>
      </div>
    )
  }

  // Fetched but no results
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-2">🔍</p>
        <p className="text-sm font-medium text-gray-700">No videos found</p>
        <p className="text-xs text-gray-400 mt-1">
          Try adding more detail to your notes and searching again.
        </p>
      </div>
    )
  }

  // Show results
  return (
    <div>
      <p className="text-xs text-gray-400 mb-4">{videos.length} videos found based on your notes</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((v) => (
          <VideoCard
            key={v.video_id}
            title={v.title}
            channel={v.channel}
            thumbnailUrl={v.thumbnail_url}
            youtubeUrl={v.youtube_url}
            duration={v.duration}
            viewCount={v.view_count}
          />
        ))}
      </div>
    </div>
  )
}
