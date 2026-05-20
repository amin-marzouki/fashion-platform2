import { Router, Request, Response } from 'express'
import prisma from '../config/db'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    })
    return res.json(transactions)
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
