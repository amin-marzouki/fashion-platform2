'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { getReferrer, clearReferrer } from '@/lib/referral'
import { Sparkles, ShoppingBag, ShoppingCart, ArrowLeft, Tag, ShieldCheck, CheckCircle, Heart } from 'lucide-react'
import Link from 'next/link'

interface Outfit {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  has_3d_model: boolean
  skm_asset_key?: string
  tags: string[]
  occasion?: string
  style_type?: string
  market?: { id: string; name: string }
}

function StudioContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [activeOutfit, setActiveOutfit] = useState<Outfit | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>(['[System] Studio initialized on port 90'])
  const [myWishlist, setMyWishlist] = useState<string[]>([])

  // Checkout states
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [error, setError] = useState('')

  const streamUrl = process.env.NEXT_PUBLIC_PS_STREAM_URL || 'http://localhost:90'

  // Fetch user's wishlist
  useEffect(() => {
    if (user) {
      api.get<any[]>('/api/wardrobe/me')
        .then(res => {
          setMyWishlist(res.map(item => item.outfit_id))
        })
        .catch(err => console.error('Error fetching user wishlist:', err))
    }
  }, [user])

  const handleWishlistToggle = async () => {
    if (!activeOutfit) return
    if (!user) {
      router.push(`/login?redirect=/studio?outfitId=${activeOutfit.id}`)
      return
    }

    const isInWishlist = myWishlist.includes(activeOutfit.id)
    try {
      if (isInWishlist) {
        await api.delete(`/api/wardrobe/items/${activeOutfit.id}`)
        setMyWishlist(prev => prev.filter(id => id !== activeOutfit.id))
      } else {
        await api.post('/api/wardrobe/items', { outfit_id: activeOutfit.id })
        setMyWishlist(prev => [...prev, activeOutfit.id])
      }
    } catch (e: any) {
      console.error('Error toggling wishlist:', e)
    }
  }

  // Fetch all 3D supported outfits
  useEffect(() => {
    api.get<Outfit[]>('/api/outfits')
      .then(res => {
        const supported = res.filter(o => o.has_3d_model)
        setOutfits(supported)

        // Select initial outfit based on query parameter or fallback to first item
        const initialId = searchParams.get('outfitId')
        const found = supported.find(o => o.id === initialId) || supported[0]
        if (found) {
          setActiveOutfit(found)
        }
      })
      .catch(err => console.error('Error fetching outfits in studio:', err))
      .finally(() => setLoading(false))
  }, [searchParams])

  // Direct switch logic matching avatarfit-web
  const switchOutfit = (outfit: Outfit) => {
    setActiveOutfit(outfit)
    setPurchaseSuccess(false)
    setError('')

    const logMsg = `[WebRTC] Sent ID: "${outfit.id}"`
    console.log(`[PixelStreaming] Direct WebRTC Switch: ${outfit.id}`)
    setLogs(prev => [...prev, logMsg])

    const iframe = document.querySelector('iframe')
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'ui_interaction',
        descriptor: outfit.id
      }, '*')
      console.log('[PixelStreaming] postMessage sent successfully ✅')
    } else {
      console.error('[PixelStreaming] Stream iframe not found ❌')
      setLogs(prev => [...prev, '[Error] Stream iframe not found ❌'])
    }
  }

  // Trigger default switch on stream page load (3.5s delay to allow player ready state)
  useEffect(() => {
    if (activeOutfit) {
      const timer = setTimeout(() => {
        switchOutfit(activeOutfit)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [activeOutfit?.id])

  const handleBuy = async () => {
    if (!activeOutfit) return
    if (!user) {
      router.push(`/login?redirect=/studio?outfitId=${activeOutfit.id}`)
      return
    }

    setPurchasing(true)
    setError('')
    try {
      const referrer_id = getReferrer()
      await api.post('/api/orders', {
        items: [{ outfit_id: activeOutfit.id, quantity: 1 }],
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
      <div className="flex h-screen bg-[#050505] text-white flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-lg font-bold tracking-wider animate-pulse">BOOTING 3D STUDIO...</h2>
      </div>
    )
  }

  return (
    <main className="h-screen bg-[#06070d] text-white flex overflow-hidden">
      {/* Sidebar - Outfits Catalog */}
      <aside className="w-80 border-r border-white/10 flex flex-col bg-surface-900/40 backdrop-blur-md z-20 shrink-0">
        <div className="p-6 border-b border-white/10 space-y-4">
          <Link href="/markets" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Brands
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              Fashion<span className="text-brand-400">Studio</span>
            </h1>
            <p className="text-xs text-white/40 mt-1">Try on products live on your virtual avatar</p>
          </div>
        </div>

        {/* Scrollable Outfits List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {outfits.map(o => {
            const isActive = activeOutfit?.id === o.id
            return (
              <div
                key={o.id}
                onClick={() => switchOutfit(o)}
                className={`glass p-3 rounded-2xl cursor-pointer border transition-all duration-300 ${
                  isActive ? 'border-brand-500 bg-brand-500/5 glow-brand' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-2.5 relative bg-surface-800">
                  {o.images?.[0] ? (
                    <img src={o.images[0]} alt={o.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-white/10" />
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-2 left-2 badge-3d">
                      Active
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-brand-300">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency', currency: o.currency || 'USD'
                    }).format(o.price)}
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-white/90 truncate">{o.name}</h4>
                <p className="text-[10px] text-white/40 mt-0.5">{o.market?.name || 'Global Collection'}</p>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Main Viewport - Unreal Engine 5 Stream */}
      <section className="flex-1 relative bg-black overflow-hidden">
        <iframe
          src={`${streamUrl}${streamUrl.includes('?') ? '&' : '?'}AutoConnect=true&AutoPlayVideo=true&StartVideoMuted=true&unattended=true`}
          className="absolute inset-y-0 -left-[120px] w-[calc(100%+120px)] h-full border-none"
          title="UE5 Pixel Stream"
          allow="autoplay; fullscreen"
        />

        {/* Floating Debug Console Log Overlay */}
        <div className="absolute bottom-6 left-6 max-w-sm w-[300px] glass p-3.5 rounded-2xl border-white/10 backdrop-blur-md shadow-2xl space-y-2 pointer-events-none z-30">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live stream console
            </span>
            <span className="text-[8px] text-white/30 font-mono">POST_MESSAGE</span>
          </div>
          <div className="font-mono text-[9px] text-white/70 space-y-1 max-h-[85px] overflow-y-auto">
            {logs.slice(-4).map((log, index) => (
              <div key={index} className="truncate select-all pointer-events-auto hover:text-white transition-colors">
                {log}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Sidebar - Active Outfit Details & Checkout */}
      <aside className="w-80 border-l border-white/10 flex flex-col bg-surface-900/40 backdrop-blur-md z-20 shrink-0 p-6">
        {activeOutfit ? (
          <div className="flex flex-col h-full space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400">Current Try-On</span>
              <h2 className="text-lg font-bold text-white tracking-tight mt-1 leading-snug">{activeOutfit.name}</h2>
              <p className="text-xl font-black text-brand-300 mt-2">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency', currency: activeOutfit.currency || 'USD'
                }).format(activeOutfit.price)}
              </p>
            </div>

            <div className="glass p-4 rounded-2xl space-y-2 border-white/5">
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider block">Occasion</span>
              <p className="text-white/80 text-xs">{activeOutfit.occasion || 'Everyday wear'}</p>
            </div>

            <div className="glass p-4 rounded-2xl space-y-2.5 border-white/5 flex-1 overflow-y-auto">
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider block">Description</span>
              <p className="text-white/70 text-xs leading-relaxed">{activeOutfit.description}</p>

              {activeOutfit.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {activeOutfit.tags.map(t => (
                    <span key={t} className="tag text-[9px] py-1 px-2 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Area */}
            <div className="space-y-3 pt-4 border-t border-white/10 mt-auto shrink-0">
              {typeof window !== 'undefined' && getReferrer() && (
                <div className="bg-brand-500/10 border border-brand-400/20 p-3 rounded-xl flex items-center gap-2 text-[10px] text-brand-300">
                  <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                  Referral active! Support your friend's balance.
                </div>
              )}

              {purchaseSuccess ? (
                <div className="glass border-green-500/30 bg-green-500/5 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                  <p className="text-green-400 font-bold text-xs">Purchase Complete!</p>
                  <p className="text-white/50 text-[10px]">Successfully added to your private wardrobe.</p>
                  <Link href="/account/wardrobe" className="btn-ghost py-1.5 px-3 text-[10px] w-full block rounded-xl">
                    Go to Wardrobe
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleBuy}
                    disabled={purchasing}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 shadow-xl shadow-brand-500/20 rounded-2xl text-xs font-bold uppercase tracking-wider"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {purchasing ? 'Processing...' : user ? 'Buy Outfit' : 'Sign in to Buy'}
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    disabled={myWishlist.includes(activeOutfit.id)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all duration-300 ${
                      myWishlist.includes(activeOutfit.id)
                        ? 'bg-green-500/10 border-green-500/30 text-green-400 cursor-not-allowed opacity-80'
                        : 'glass border-white/10 hover:border-brand-500/30 text-white/80 hover:text-white'
                    }`}
                  >
                    {myWishlist.includes(activeOutfit.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        In My Wardrobe
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Add to My Wardrobe
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-3">
            <ShoppingBag className="w-10 h-10" />
            <p className="text-xs text-center">Select an outfit from the catalog to load details</p>
          </div>
        )}
      </aside>
    </main>
  )
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="flex h-screen bg-[#050505] text-white flex-col items-center justify-center">Loading Studio...</div>}>
      <StudioContent />
    </Suspense>
  )
}
