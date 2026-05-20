'use client'
import Link from 'next/link'
import { ShoppingBag, Sparkles, Share2 } from 'lucide-react'

interface WardrobeItem {
  id: string
  outfit_id: string
  is_public: boolean
  outfit: {
    id: string
    name: string
    price: number
    currency: string
    images: string[]
    has_3d_model: boolean
    tags: string[]
  }
}

interface Props {
  items: WardrobeItem[]
  isOwner?: boolean
  onTryOn?: (outfitId: string) => void
}

export default function WardrobeGrid({ items, isOwner, onTryOn }: Props) {
  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center space-y-3">
        <ShoppingBag className="w-12 h-12 text-white/10 mx-auto" />
        <p className="text-white/40">No items in this wardrobe yet.</p>
        {isOwner && (
          <Link href="/markets" className="btn-primary inline-flex text-sm">Browse Markets</Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.id} className="glass glass-hover group flex flex-col overflow-hidden rounded-2xl animate-fade-in">
          <div className="relative h-44 bg-surface-700 overflow-hidden">
            {item.outfit.images?.[0] ? (
              <img src={item.outfit.images[0]} alt={item.outfit.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-white/10" />
              </div>
            )}
            {item.outfit.has_3d_model && (
              <div className="absolute top-2 left-2 badge-3d text-xs">
                <Sparkles className="w-2.5 h-2.5" /> 3D
              </div>
            )}
          </div>
          <div className="p-3 space-y-2 flex-1">
            <p className="text-sm font-medium text-white line-clamp-1">{item.outfit.name}</p>
            <p className="text-brand-300 text-sm font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.outfit.currency || 'USD' }).format(item.outfit.price)}
            </p>
            <div className="flex gap-2 pt-1">
              {item.outfit.has_3d_model && onTryOn && (
                <button id={`wardrobe-tryon-${item.outfit_id}`}
                  onClick={() => onTryOn(item.outfit_id)}
                  className="flex-1 btn-primary text-xs py-1.5">
                  Try On
                </button>
              )}
              <Link href={`/products/${item.outfit_id}`}
                className="flex-1 btn-ghost text-xs py-1.5 text-center">View</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
