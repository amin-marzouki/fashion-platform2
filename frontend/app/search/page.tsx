'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SmartSearchBar from '@/components/SmartSearchBar'
import OutfitCard from '@/components/OutfitCard'
import { api } from '@/lib/api'
import { Search } from 'lucide-react'

interface SearchResult {
  id: string
  name: string
  price: number
  currency: string
  images: string[]
  has_3d_model: boolean
  tags: string[]
  occasion?: string
  style_type?: string
}

interface SearchResponse {
  intent: { occasion: string | null; style_type: string | null; keywords: string[] }
  results: SearchResult[]
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      setLoading(true)
      api.post<SearchResponse>('/api/search', { query: initialQuery })
        .then(res => setResults(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [initialQuery])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8 page-enter">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Smart Assistant</h1>
        <p className="text-white/40 mb-6 text-sm">Ask in plain words for outfits tailored to a theme or event</p>
        <SmartSearchBar
          onResults={data => setResults(data)}
          autoNavigate={false}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass h-80 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : results ? (
        <div className="space-y-6 pt-6">
          <div>
            <h2 className="text-xl font-bold text-white">Matching Outfits</h2>
            <p className="text-sm text-white/40">Highly correlated outfits matches based on search criteria</p>
          </div>

          {results.results.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center text-white/40">
              No matching collection pieces found. Try a different query style!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.results.map(o => (
                <OutfitCard
                  key={o.id}
                  outfit={o}
                  onTryOn={() => router.push(`/studio?outfitId=${o.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-3xl p-16 text-center space-y-4 max-w-2xl mx-auto border-white/5 bg-white/[0.02]">
          <Search className="w-12 h-12 text-white/10 mx-auto" />
          <p className="text-white/50 text-sm">Enter a search query or click one of the preset shortcuts above to discover amazing outfit fits!</p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-white/40">Loading smart assistant...</div>}>
      <SearchContent />
    </Suspense>
  )
}
