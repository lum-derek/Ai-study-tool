'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden">
        {/* Subtle Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] -z-10 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[20%] left-[-10%] -z-10 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/60 p-8 text-center opacity-0 animate-fade-in-up">
          <div className="text-5xl mb-6">📬</div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-3">Check your email</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="text-indigo-600 hover:underline text-sm font-medium">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* Subtle Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] -z-10 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] -z-10 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/60 p-8 opacity-0 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-2">Create an account</h1>
        <p className="text-sm text-gray-500 mb-8">Start studying smarter with AI</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 pr-14"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none text-white font-medium py-3 rounded-xl transition-all"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
