import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../config/db'
import { env } from '../config/env'

export const register = async (req: Request, res: Response) => {
  const { email, password, display_name } = req.body
  if (!email || !password || !display_name)
    return res.status(400).json({ error: 'Missing fields' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'Email already in use' })

  const password_hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password_hash, display_name }
  })

  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' })
  return res.status(201).json({ token, user: { id: user.id, email: user.email, display_name: user.display_name } })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' })
  return res.json({ token, user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role } })
}

export const me = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: (req as any).userId },
    select: { id: true, email: true, display_name: true, wallet_balance: true, role: true }
  })
  return res.json(user)
}

export const refresh = async (_req: Request, res: Response) => {
  // Refresh token with Redis blacklist — stub for academic scope
  return res.status(501).json({ error: 'Not implemented' })
}
