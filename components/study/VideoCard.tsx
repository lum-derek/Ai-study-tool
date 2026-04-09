import { formatDuration } from '@/lib/ai/youtube'

interface Props {
  title: string
  channel: string
  thumbnailUrl: string
  youtubeUrl: string
  duration: string | null
  viewCount: number | null
}

function formatViews(count: number | null): string {
  if (!count) return ''
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K views`
  return `${count} views`
}

export default function VideoCard({ title, channel, thumbnailUrl, youtubeUrl, duration, viewCount }: Props) {
  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">▶</div>
        )}
        {/* Duration badge */}
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-500 truncate">{channel}</span>
          {viewCount && (
            <>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-400 shrink-0">{formatViews(viewCount)}</span>
            </>
          )}
        </div>
      </div>
    </a>
  )
}
