'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Sparkles, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    setLoading(true)
    try {
      const data: any = await api.post('/api/auth/login', { email, password })
      login(data.token, data.user)
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBypassLogin = async (bypassEmail: string) => {
    setError('')
    setLoading(true)
    try {
      const data: any = await api.post('/api/auth/login', { email: bypassEmail, password: 'demo1234' })
      login(data.token, data.user)
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || 'Bypass login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 page-enter">
      <div className="glass w-full max-w-md p-8 rounded-3xl space-y-6 shadow-2xl border-white/5 glow-brand">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-white/40">Sign in to manage your wardrobe and personal 3D avatar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-white/50">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. ali@demo.com"
              className="input-field"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-white/50">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Quick Test Login Bypass for Models */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-400 block">
              ⚡ Test Model Bypass Shortcuts
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Ali (Model)', email: 'ali@demo.com' },
              { name: 'Sara (Model)', email: 'sara@demo.com' },
              { name: 'Lina (Model)', email: 'lina@demo.com' },
            ].map(m => (
              <button
                key={m.email}
                type="button"
                onClick={() => handleBypassLogin(m.email)}
                disabled={loading}
                className="glass glass-hover py-2.5 rounded-xl text-[10px] font-bold text-white/80 hover:text-white text-center truncate"
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-white/30 space-y-1">
          <p>
            Don't have an account? <Link href="/register" className="text-brand-400 hover:underline">Register now</Link>
          </p>
          <p className="text-[10px] text-white/20">Demo account: ali@demo.com • Password: demo1234</p>
        </div>
      </div>
    </div>
  )
}
