import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../config/db'
import { env } from '../config/env'

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body
  if (!email || !password || !name)
    return res.status(400).json({ error: 'Missing fields' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'Email already in use' })

  const hashedPassword = await bcrypt.hash(password, 10)
  const referral_code = 'REF_' + Math.random().toString(36).substring(2, 9).toUpperCase()

  const user = await prisma.user.create({
    data: { 
      email, 
      password: hashedPassword, 
      name,
      referral_code
    }
  })

  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' })
  return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' })
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
}

export const me = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(String((req as any).userId), 10)
  if (isNaN(userIdParsed)) return res.status(401).json({ error: 'Invalid user session' })

  const user = await prisma.user.findUnique({
    where: { id: userIdParsed },
    select: { id: true, email: true, name: true, wallet_balance: true, role: true, isModel: true }
  })
  return res.json(user)
}

export const refresh = async (_req: Request, res: Response) => {
  // Refresh token with Redis blacklist — stub for academic scope
  return res.status(501).json({ error: 'Not implemented' })
}
