import express from 'express'
import cors from 'cors'
import { env } from './config/env'

// Routes
import authRoutes from './routes/auth.routes'
import catalogRoutes from './routes/catalog.routes'
import tryonRoutes from './routes/tryon.routes'
import avatarRoutes from './routes/avatar.routes'
import wardrobeRoutes from './routes/wardrobe.routes'
import orderRoutes from './routes/order.routes'
import searchRoutes from './routes/search.routes'
import transactionRoutes from './routes/transaction.routes'

// Rate limiter
import rateLimiter from './middleware/rateLimiter'

const app = express()

// ── Global middleware ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  process.env.FRONTEND_URL
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, true) // Keep it lenient for local development to avoid blocking requests
    }
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Global rate limit: 120 req/min per IP
app.use(rateLimiter(120, 60))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api', catalogRoutes)         // /api/markets, /api/outfits
app.use('/api/tryon', tryonRoutes)
app.use('/api/avatars', avatarRoutes)
app.use('/api/wardrobe', wardrobeRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/transactions', transactionRoutes)

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = parseInt(env.PORT, 10)
app.listen(PORT, () => {
  console.log(`🚀 Fashion Platform API running on http://localhost:${PORT}`)
})

export default app
