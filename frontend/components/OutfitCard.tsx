'use client'
import Link from 'next/link'
import { Tag, Sparkles, ShoppingBag } from 'lucide-react'
import clsx from 'clsx'

interface Outfit {
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

interface OutfitCardProps {
  outfit: Outfit
  onTryOn?: (outfit: Outfit) => void
  referrerId?: string
}

export default function OutfitCard({ outfit, onTryOn }: OutfitCardProps) {
  const displayPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: outfit.currency || 'USD'
  }).format(outfit.price)

  return (
    <div className="glass glass-hover group relative flex flex-col overflow-hidden animate-fade-in">
      {/* Image / placeholder */}
      <div className="relative h-56 bg-gradient-to-br from-surface-700 to-surface-800 overflow-hidden">
        {outfit.images?.[0] ? (
          <img
            src={outfit.images[0]}
            alt={outfit.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-white/10" />
          </div>
        )}

        {/* 3D badge */}
        {outfit.has_3d_model && (
          <div className="absolute top-3 left-3 badge-3d">
            <Sparkles className="w-3 h-3" /> 3D Try-On
          </div>
        )}

        {/* Hover overlay */}
        {outfit.has_3d_model && onTryOn && (
          <div className="absolute inset-0 bg-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              id={`tryon-btn-${outfit.id}`}
              onClick={() => onTryOn(outfit)}
              className="btn-primary text-sm scale-95 group-hover:scale-100 transition-transform duration-300"
            >
              <Sparkles className="w-4 h-4 inline mr-1" /> Try On
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{outfit.name}</h3>
          <p className="text-brand-300 font-bold text-base mt-1">{displayPrice}</p>
        </div>

        {/* Tags */}
        {outfit.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {outfit.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/products/${outfit.id}`}
            className="flex-1 btn-ghost text-sm text-center py-2 px-3"
          >
            View
          </Link>
          {onTryOn && outfit.has_3d_model && (
            <button
              id={`tryon-card-btn-${outfit.id}`}
              onClick={() => onTryOn(outfit)}
              className="flex-1 btn-primary text-sm py-2 px-3"
            >
              Try On
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
