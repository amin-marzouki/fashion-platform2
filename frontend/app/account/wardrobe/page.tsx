'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import WardrobeGrid from '@/components/WardrobeGrid'
import TryOnPopup from '@/components/TryOnPopup'
import { useAuth } from '@/lib/auth-context'
import {
  Sparkles,
  Share2,
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  HelpCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

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

interface Transaction {
  id: string
  type: 'COMMISSION' | 'PAYOUT' | 'PURCHASE'
  amount: number
  currency: string
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  created_at: string
}

export default function MyWardrobePage() {
  const { user } = useAuth()
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)
  const [tryOnOutfit, setTryOnOutfit] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch own wardrobe
  useEffect(() => {
    if (user) {
      api.get<WardrobeItem[]>('/api/wardrobe/me')
        .then(res => setItems(res))
        .catch(err => console.error('Error fetching own wardrobe:', err))
        .finally(() => setLoading(false))
    }
  }, [user])

  // Fetch own financial transactions
  useEffect(() => {
    if (user) {
      api.get<Transaction[]>('/api/transactions/me')
        .then(res => setTransactions(res))
        .catch(err => console.error('Error fetching transactions:', err))
        .finally(() => setTxLoading(false))
    }
  }, [user])

  const copyShareLink = () => {
    if (typeof window !== 'undefined' && user) {
      const link = `${window.location.origin}/wardrobe/${user.id}`
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please sign in to view your wardrobe</h2>
        <Link href="/login" className="btn-primary inline-flex">Sign In</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12 page-enter">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Creator Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">Manage your wardrobe collection, view referrals, and track financial earnings</p>
      </div>

      {/* Wallet / Commission metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 flex items-center justify-between border-white/5 bg-gradient-to-r from-brand-500/10 to-transparent">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Wallet Balance</p>
            <p className="text-2xl font-black text-white">${(user.wallet_balance ?? 0).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-brand-500/20 rounded-2xl">
            <Wallet className="w-6 h-6 text-brand-400" />
          </div>
        </div>

        <div className="glass p-6 flex items-center justify-between border-white/5">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Social Referrals</p>
            <p className="text-2xl font-black text-white">10% Commission</p>
          </div>
          <div className="p-3 bg-brand-500/20 rounded-2xl">
            <Coins className="w-6 h-6 text-brand-400" />
          </div>
        </div>

        <div className="glass p-6 flex flex-col justify-center gap-2 border-white/5">
          <p className="text-xs font-semibold text-white/45 uppercase tracking-wider">Share & Earn</p>
          <button
            onClick={copyShareLink}
            className="btn-primary py-2.5 px-4 text-xs flex items-center justify-center gap-2 w-full"
          >
            <Share2 className="w-4 h-4" /> {copied ? 'Copied link!' : 'Copy Referral Showcase'}
          </button>
        </div>
      </div>

      {/* Wardrobe listing */}
      <div className="space-y-6">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white">Curated Wardrobe</h2>
          <p className="text-xs text-white/40 mt-1">Manage your purchased items, style showcases, and direct try-ons</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass h-64 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <WardrobeGrid
            items={items}
            isOwner={true}
            onTryOn={id => {
              const matched = items.find(i => i.outfit_id === id)
              if (matched) setTryOnOutfit(matched.outfit)
            }}
          />
        )}
      </div>

      {/* Financial Ledger & Commissions Workflow Table */}
      <div className="space-y-6">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white">Financial Ledger & Commissions</h2>
          <p className="text-xs text-white/40 mt-1">Real-time breakdown of affiliate commissions, store purchases, and payouts</p>
        </div>

        {txLoading ? (
          <div className="glass p-8 rounded-2xl animate-pulse space-y-4">
            <div className="h-6 bg-white/5 rounded w-1/3" />
            <div className="h-24 bg-white/5 rounded" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center border-white/5 text-white/30 space-y-3">
            <Coins className="w-10 h-10 mx-auto text-white/20" />
            <p className="text-xs">No transactions recorded yet. Share your profile link to earn commissions!</p>
          </div>
        ) : (
          <div className="glass rounded-3xl border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map(tx => {
                    const isEarning = tx.type === 'COMMISSION'
                    const isPurchase = tx.type === 'PURCHASE'
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.01] transition-all">
                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-white/60 font-medium">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-white/30" />
                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        {/* Type Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tx.type === 'COMMISSION' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 border border-green-500/20 text-green-400">
                              <ArrowUpRight className="w-3 h-3" /> Commission
                            </span>
                          )}
                          {tx.type === 'PURCHASE' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/70">
                              <ArrowDownLeft className="w-3 h-3" /> Purchase
                            </span>
                          )}
                          {tx.type === 'PAYOUT' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 border border-brand-400/20 text-brand-300">
                              <Coins className="w-3 h-3" /> Payout
                            </span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4 text-xs text-white/80 max-w-xs md:max-w-md truncate">
                          {tx.description}
                        </td>

                        {/* Amount */}
                        <td className={`px-6 py-4 whitespace-nowrap text-xs font-black`}>
                          <span className={isEarning ? 'text-green-400' : isPurchase ? 'text-white/60' : 'text-brand-300'}>
                            {isEarning ? '+' : ''}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: tx.currency
                            }).format(tx.amount)}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tx.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-green-500/10 text-green-400">
                              <CheckCircle className="w-3 h-3" /> Done
                            </span>
                          )}
                          {tx.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-yellow-500/10 text-yellow-400">
                              <Clock className="w-3 h-3 animate-spin" /> Pending
                            </span>
                          )}
                          {tx.status === 'FAILED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-red-500/10 text-red-400">
                              <AlertTriangle className="w-3 h-3" /> Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {tryOnOutfit && (
        <TryOnPopup outfit={tryOnOutfit} onClose={() => setTryOnOutfit(null)} />
      )}
    </div>
  )
}
