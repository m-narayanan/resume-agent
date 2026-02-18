import { useState } from 'react'
import InputForm from './components/InputForm'
import ResultsPanel from './components/ResultsPanel'
import { Sparkles } from 'lucide-react'

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN
const API_BASE = import.meta.env.VITE_API_URL || ''
export default function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stage, setStage] = useState('')

  const STAGES = [
    'Researching company culture and tech stack...',
    'Mining interview experiences...',
    'Analyzing recent news and focus areas...',
    'Parsing job description for hidden keywords...',
    'Generating ATS-optimized skill recommendations...',
    'Crafting project ideas tailored to this company...',
    'Evaluating your existing resume content...',
    'Finalizing your edge strategy...',
  ]

  const handleAnalyze = async (formData) => {
    setLoading(true)
    setResults(null)
    setError(null)

    let stageIdx = 0
    setStage(STAGES[0])
    const stageTimer = setInterval(() => {
      stageIdx = (stageIdx + 1) % STAGES.length
      setStage(STAGES[stageIdx])
    }, 4000)

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': ACCESS_TOKEN,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setResults(data.data)
    } catch (e) {
      setError(e.message)
    } finally {
      clearInterval(stageTimer)
      setLoading(false)
      setStage('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Sparkles className="text-blue-400 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Resume Agent</h1>
            <p className="text-xs text-gray-400">AI-powered resume optimization for freshers</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
              Private Mode
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {!results ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-3">
                Stand Out.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                  Get Hired.
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Paste a job description. Get company-specific skills, projects, and ATS keywords.
              </p>
            </div>

            {loading && (
              <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-blue-400 font-medium">{stage}</p>
                <p className="text-gray-500 text-sm mt-1">This takes 30–60 seconds. Claude is doing deep research...</p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400">
                <strong>Error:</strong> {error}
              </div>
            )}

            <InputForm onSubmit={handleAnalyze} loading={loading} />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setResults(null)}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                ← New Analysis
              </button>
            </div>
            <ResultsPanel data={results} />
          </div>
        )}
      </div>
    </div>
  )
}