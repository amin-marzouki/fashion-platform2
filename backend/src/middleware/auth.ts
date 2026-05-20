import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string }
    ;(req as any).userId = payload.userId
    ;(req as any).userRole = payload.role
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string }
      ;(req as any).userId = payload.userId
      ;(req as any).userRole = payload.role
    } catch {}
  }
  next()
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).userRole !== 'ADMIN') return res.status(403).json({ error: 'Admin only' })
  next()
}
