import { Router, Request, Response } from 'express'
import prisma from '../config/db'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userIdParsed = parseInt(String((req as any).userId), 10)
    if (isNaN(userIdParsed)) {
      return res.status(401).json({ error: 'Invalid user session' })
    }

    // 1. Fetch affiliate commissions
    const commissions = await prisma.commission.findMany({
      where: { referrer_id: userIdParsed },
      include: {
        order: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // 2. Fetch purchases (Orders)
    const orders = await prisma.order.findMany({
      where: { user_id: userIdParsed },
      include: {
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // 3. Map commissions to Frontend Transaction structure
    const mappedCommissions = commissions.map(c => ({
      id: `comm-${c.id}`,
      type: 'COMMISSION' as const,
      amount: c.amount,
      currency: 'USD',
      description: `10% Affiliate Commission on purchase by ${c.order?.user?.name || 'Customer'}`,
      status: c.status === 'paid' ? ('COMPLETED' as const) : ('PENDING' as const),
      created_at: c.created_at.toISOString()
    }))

    // 4. Map orders to Frontend Transaction structure
    const mappedOrders = orders.map(o => {
      const itemsList = o.items.map(i => i.product?.name).filter(Boolean).join(', ')
      return {
        id: `order-${o.id}`,
        type: 'PURCHASE' as const,
        amount: o.total_amount,
        currency: 'USD',
        description: itemsList ? `Purchased outfit(s): ${itemsList}` : `Store purchase #${o.id}`,
        status: o.status === 'paid' ? ('COMPLETED' as const) : ('PENDING' as const),
        created_at: o.created_at.toISOString()
      }
    })

    // 5. Combine and sort
    const allTransactions = [...mappedCommissions, ...mappedOrders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return res.json(allTransactions)
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
