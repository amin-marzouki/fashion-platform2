'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ShoppingBag, User, Search, Sparkles, Wallet, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/markets', label: 'Markets' },
    { href: '/models', label: 'Models' },
    { href: '/search', label: 'Search' },
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 px-4 md:px-8">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Fashion<span className="text-brand-400">Verse</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === l.href
                  ? 'bg-brand-500/20 text-brand-300'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link href="/search" className="md:hidden p-2 text-white/60 hover:text-white">
            <Search className="w-5 h-5" />
          </Link>

          {user ? (
            <div className="relative">
              <button
                id="profile-menu-btn"
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 glass glass-hover px-3 py-2 rounded-xl"
              >
                <div className="w-7 h-7 rounded-full bg-brand-500/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-300" />
                </div>
                <span className="hidden md:block text-sm font-medium text-white/80 max-w-[120px] truncate">
                  {user.display_name}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 glass rounded-2xl p-2 shadow-2xl z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs text-white/40">Wallet</p>
                    <p className="font-semibold text-brand-300 flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> ${(user.wallet_balance ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <Link
                    href="/account/wardrobe"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" /> My Wardrobe
                  </Link>
                  <Link
                    href="/account/avatar"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <User className="w-4 h-4" /> My Avatar
                  </Link>
                  <button
                    id="logout-btn"
                    onClick={() => { logout(); setProfileOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost py-2 px-4 text-sm">Sign In</Link>
              <Link href="/register" className="btn-primary py-2 px-4 text-sm hidden md:flex">Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 py-3 flex flex-col gap-1 animate-fade-in">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                pathname === l.href ? 'bg-brand-500/20 text-brand-300' : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
