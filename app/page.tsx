import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/db/supabase'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between max-w-5xl mx-auto w-full">
        <span className="font-bold text-gray-900">StudyAI</span>
        <div className="flex gap-2">
          <Link href="/login"  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Sign in</Link>
          <Link href="/signup" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Study smarter with AI
          </h1>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Upload your notes or PDFs and instantly get summaries, flashcards,
            quizzes, and relevant YouTube videos — all powered by AI.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-16">
            {[
              { icon: '📝', label: 'Summaries' },
              { icon: '🃏', label: 'Flashcards' },
              { icon: '✅', label: 'Quizzes' },
              { icon: '💬', label: 'Chat with notes' },
              { icon: '🎬', label: 'YouTube videos' },
              { icon: '📊', label: 'Progress tracking' },
              { icon: '📄', label: 'PDF support' },
              { icon: '⚡', label: 'Instant results' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-xs text-gray-600 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
