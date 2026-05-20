import { Request, Response, NextFunction } from 'express'
import { redis } from '../config/redis'

// Simple Redis-based sliding window rate limiter
export const rateLimiter = (limit = 60, windowSec = 60) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown'
    const key = `rl:${ip}`

    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, windowSec)
    }

    if (current > limit) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' })
    }

    next()
  }
}

export default rateLimiter
