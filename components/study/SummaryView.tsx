'use client'

interface Props {
  summary: string
}

export default function SummaryView({ summary }: Props) {
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {summary.split('\n\n').map((para, i) => (
        <p key={i} className="mb-4 leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  )
}
