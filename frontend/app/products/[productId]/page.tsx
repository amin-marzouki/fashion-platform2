'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, ShoppingBag, ShoppingCart, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getReferrer, clearReferrer } from '@/lib/referral'

interface Outfit {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  has_3d_model: boolean
  tags: string[]
  occasion?: string
  style_type?: string
  skm_asset_key?: string
}

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Outfit>(`/api/outfits/${params.productId}`)
      .then(res => setOutfit(res))
      .catch(err => console.error('Error loading outfit details:', err))
      .finally(() => setLoading(false))
  }, [params.productId])

  const handleBuy = async () => {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }
    setPurchasing(true)
    setError('')
    try {
      const referrer_id = getReferrer()
      await api.post('/api/orders', {
        items: [{ outfit_id: params.productId, quantity: 1 }],
        referrer_id: referrer_id || undefined
      })
      setPurchaseSuccess(true)
      clearReferrer()
    } catch (e: any) {
      setError(e.message || 'Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
        <div className="glass aspect-square rounded-3xl" />
        <div className="space-y-6">
          <div className="h-6 w-32 bg-white/10 rounded" />
          <div className="h-10 w-3/4 bg-white/10 rounded" />
          <div className="h-8 w-24 bg-white/10 rounded" />
          <div className="h-32 bg-white/10 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!outfit) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Item Not Found</h2>
        <Link href="/markets" className="btn-primary inline-flex">Explore Catalog</Link>
      </div>
    )
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: outfit.currency || 'USD'
  }).format(outfit.price)

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-8 page-enter">
      <Link href="/markets" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="glass rounded-3xl overflow-hidden bg-surface-800 flex items-center justify-center p-6 aspect-square relative min-h-[300px]">
          {outfit.images?.[0] ? (
            <img src={outfit.images[0]} alt={outfit.name} className="max-h-full max-w-full rounded-2xl object-cover" />
          ) : (
            <ShoppingBag className="w-24 h-24 text-white/10" />
          )}

          {outfit.has_3d_model && (
            <div className="absolute top-4 left-4 badge-3d">
              <Sparkles className="w-4 h-4 inline mr-1.5" /> 3D Try-On Supported
            </div>
          )}
        </div>

        {/* Product specs / actions */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">{outfit.name}</h1>
            <p className="text-2xl font-black text-brand-300">{formattedPrice}</p>
          </div>

          <div className="glass p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Description</h3>
            <p className="text-white/70 text-sm leading-relaxed">{outfit.description}</p>
          </div>

          {/* Tag specs */}
          <div className="flex flex-wrap gap-2">
            {outfit.occasion && (
              <span className="tag py-1.5 px-3">Occasion: {outfit.occasion}</span>
            )}
            {outfit.style_type && (
              <span className="tag py-1.5 px-3">Style: {outfit.style_type}</span>
            )}
            {outfit.tags?.map(t => (
              <span key={t} className="tag py-1.5 px-3">{t}</span>
            ))}
          </div>

          {/* Referral message if applied */}
          {typeof window !== 'undefined' && getReferrer() && (
            <div className="bg-brand-500/10 border border-brand-400/20 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-brand-300">
              <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
              Referral active! Support your friend's wardrobe with this purchase.
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-4">
            {outfit.has_3d_model && (
              <button
                id="pdp-tryon-btn"
                onClick={() => router.push(`/studio?outfitId=${outfit.id}`)}
                className="btn-primary flex items-center justify-center gap-2 py-4 shadow-xl shadow-brand-500/20"
              >
                <Sparkles className="w-5 h-5 text-white" /> Try On in 3D Live
              </button>
            )}

            {purchaseSuccess ? (
              <div className="glass border-green-500/30 bg-green-500/5 p-4 rounded-xl text-center space-y-2">
                <p className="text-green-400 font-bold text-sm">Purchase Complete!</p>
                <p className="text-white/60 text-xs">This item has been successfully added to your private wardrobe.</p>
                <Link href="/account/wardrobe" className="btn-ghost py-1.5 px-3 text-xs inline-flex mt-1">My Wardrobe</Link>
              </div>
            ) : (
              <button
                id="pdp-buy-btn"
                onClick={handleBuy}
                disabled={purchasing}
                className="btn-ghost flex items-center justify-center gap-2 py-4"
              >
                <ShoppingCart className="w-5 h-5 text-brand-300" />
                {purchasing ? 'Processing Order...' : user ? 'Buy & Add to Wardrobe' : 'Sign in to Buy'}
              </button>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
