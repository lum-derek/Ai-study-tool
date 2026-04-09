'use client'

import { useState, useRef, DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'

type UploadState = 'idle' | 'dragging' | 'uploading' | 'error'

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setState('dragging')
  }

  function handleDragLeave() {
    setState('idle')
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setState('idle')
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

  function validateAndSetFile(file: File) {
    setError('')
    const allowed = ['application/pdf', 'text/plain']
    if (!allowed.includes(file.type)) {
      setError('Only PDF or .txt files are supported.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.')
      return
    }
    setSelectedFile(file)
  }

  async function handleSubmit() {
    setError('')

    if (activeTab === 'file' && !selectedFile) {
      setError('Please select a file.')
      return
    }
    if (activeTab === 'text' && pastedText.trim().length < 50) {
      setError('Please enter at least a few sentences of text.')
      return
    }

    setState('uploading')

    const formData = new FormData()
    if (activeTab === 'file' && selectedFile) {
      formData.append('file', selectedFile)
    } else {
      formData.append('text', pastedText.trim())
    }

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setState('error')
      return
    }

    router.push(`/document/${data.documentId}`)
  }

  const isDragging = state === 'dragging'
  const isUploading = state === 'uploading'

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Upload Study Material</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload a PDF or paste your notes to generate summaries, flashcards, and quizzes.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('file')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'file'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'text'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Paste Text
            </button>
          </div>

          {/* File upload tab */}
          {activeTab === 'file' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div>
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(0)} KB — click to change
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📂</div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Drop it here' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF or .txt — max 10MB</p>
                </div>
              )}
            </div>
          )}

          {/* Paste text tab */}
          {activeTab === 'text' && (
            <div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your study notes here..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {pastedText.length} characters
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {isUploading ? 'Processing...' : 'Generate Study Materials'}
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
