import { createServerSupabaseClient } from '@/lib/db/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import type { Document } from '@/lib/db/types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function DocumentCard({ doc }: { doc: Document }) {
  return (
    <Link
      href={`/document/${doc.id}`}
      className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all block"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* File type badge */}
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
            doc.file_type === 'pdf'
              ? 'bg-red-50 text-red-600'
              : 'bg-blue-50 text-blue-600'
          }`}>
            {doc.file_type.toUpperCase()}
          </span>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {doc.title}
          </h3>

          {/* Meta */}
          <p className="text-xs text-gray-400 mt-1">
            {doc.char_count.toLocaleString()} chars · {timeAgo(doc.created_at)}
          </p>
        </div>

        {/* Arrow */}
        <span className="text-gray-300 group-hover:text-blue-400 transition-colors text-lg shrink-0 mt-0.5">
          →
        </span>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch documents + aggregate quiz stats in parallel
  const [{ data: documents }, { data: attempts }] = await Promise.all([
    supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('quiz_attempts')
      .select('score, total')
      .eq('user_id', user.id),
  ])

  const docs = documents ?? []
  const allAttempts = attempts ?? []

  // Stats
  const totalDocs   = docs.length
  const totalQuizzes = allAttempts.length
  const avgScore = totalQuizzes > 0
    ? Math.round(
        allAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / totalQuizzes
      )
    : null

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Notes</h1>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
          <Link
            href="/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Upload Notes
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalDocs}</p>
            <p className="text-xs text-gray-500 mt-1">Documents</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalQuizzes}</p>
            <p className="text-xs text-gray-500 mt-1">Quizzes Taken</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {avgScore !== null ? `${avgScore}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Avg Quiz Score</p>
          </div>
        </div>

        {/* Documents list */}
        {docs.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
            <p className="text-3xl mb-3">📚</p>
            <p className="text-sm font-medium text-gray-700 mb-1">No notes yet</p>
            <p className="text-xs text-gray-400 mb-5">Upload your first document to get started</p>
            <Link
              href="/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Upload Notes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
