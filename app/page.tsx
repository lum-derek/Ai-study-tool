import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/db/supabase'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  const features = [
    { icon: '📝', title: 'Smart Summaries', desc: 'Instantly condense long PDFs or notes into key takeaways.' },
    { icon: '🃏', title: 'AI Flashcards', desc: 'Automatically generate flashcard decks to test your recall.' },
    { icon: '✅', title: 'Custom Quizzes', desc: 'Challenge yourself with interactive multiple-choice questions.' },
    { icon: '💬', title: 'Chat With Notes', desc: 'Ask questions and get answers directly from your documents.' },
    { icon: '🎬', title: 'Curated Videos', desc: 'Discover YouTube learning resources tailored to your topics.' },
    { icon: '📊', title: 'Insightful Tracking', desc: 'Monitor your study progress and knowledge gaps visually.' },
    { icon: '📄', title: 'Universal PDF', desc: 'Drag and drop standard lecture slides or heavy textbooks.' },
    { icon: '⚡', title: 'Instant Results', desc: 'Say goodbye to manual prep—everything is generated in seconds.' },
  ]

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Subtle Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] -z-10 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] -z-10 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Sticky Glass Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
            StudyAI
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"  
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="text-sm bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 text-white px-4 py-2 rounded-xl transition-all font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-20 w-full max-w-6xl mx-auto">
        <div className="text-center max-w-3xl opacity-0 animate-fade-in-up">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase">
            The future of learning
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-[1.15] tracking-tight">
            Stop studying harder.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Start learning smarter.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
            Upload your lecture notes or PDFs, and let AI instantly craft summaries, flashcards, interactive quizzes, and recommend curated YouTube videos. 
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/20 text-white font-medium px-8 py-3.5 rounded-2xl transition-all"
            >
              Start analyzing for free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md text-gray-700 font-medium px-8 py-3.5 rounded-2xl transition-all"
            >
              View a demo
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-28 w-full opacity-0 animate-fade-in-up delay-200">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className="group bg-white/60 backdrop-blur-md border border-gray-200/60 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
