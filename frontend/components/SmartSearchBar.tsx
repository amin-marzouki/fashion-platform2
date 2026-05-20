'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, X, Tag, Zap } from 'lucide-react'
import { api } from '@/lib/api'

interface SearchResult {
  id: string
  name: string
  price: number
  currency: string
  has_3d_model: boolean
  tags: string[]
  occasion?: string
  style_type?: string
}

interface SearchResponse {
  intent: { occasion: string | null; style_type: string | null; keywords: string[] }
  results: SearchResult[]
}

interface Props {
  onResults?: (data: SearchResponse) => void
  autoNavigate?: boolean
}

export default function SmartSearchBar({ onResults, autoNavigate = false }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const router = useRouter()

  const handleSearch = useCallback(async (q = query) => {
    if (!q.trim()) return
    if (autoNavigate) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      return
    }
    setLoading(true)
    try {
      const data = await api.post<SearchResponse>('/api/search', { query: q })
      setResults(data)
      onResults?.(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [query, autoNavigate, router, onResults])

  const suggestions = [
    'something fancy for a wedding',
    'sporty streetwear look',
    'luxury casual outfit',
  ]

  return (
    <div className="w-full space-y-4">
      <div className="relative flex items-center">
        <div className="absolute left-4 flex items-center pointer-events-none">
          {loading
            ? <Sparkles className="w-5 h-5 text-brand-400 animate-pulse" />
            : <Search className="w-5 h-5 text-white/30" />}
        </div>
        <input
          id="smart-search-input"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder='Try "something fancy for a wedding"...'
          className="input-field pl-12 pr-24 py-4 text-base rounded-2xl"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null) }}
            className="absolute right-24 text-white/30 hover:text-white/70 transition-colors mr-2">
            <X className="w-4 h-4" />
          </button>
        )}
        <button id="smart-search-btn" onClick={() => handleSearch()} disabled={loading}
          className="absolute right-2 btn-primary py-2 px-4 text-sm rounded-xl">
          Search
        </button>
      </div>

      {!results && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => { setQuery(s); handleSearch(s) }}
              className="tag hover:bg-brand-500/10 hover:border-brand-400/30 hover:text-brand-300 transition-all cursor-pointer text-xs px-3 py-1.5">
              <Zap className="w-3 h-3 inline mr-1" />{s}
            </button>
          ))}
        </div>
      )}

      {results?.intent && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {results.intent.occasion && (
            <span className="badge-3d"><Tag className="w-3 h-3" /> Occasion: {results.intent.occasion}</span>
          )}
          {results.intent.style_type && (
            <span className="badge-3d"><Tag className="w-3 h-3" /> Style: {results.intent.style_type}</span>
          )}
          {results.intent.keywords?.map((kw: string) => (
            <span key={kw} className="tag text-xs">{kw}</span>
          ))}
          <span className="text-white/30 text-xs self-center">{results.results.length} results</span>
        </div>
      )}
    </div>
  )
}
