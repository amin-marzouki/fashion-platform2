import { Request, Response } from 'express'
import prisma from '../config/db'

export const createOrder = async (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { items, referrer_id } = req.body
  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'items array required' })

  const outfitIds = items.map((i: any) => i.outfit_id)
  const outfits = await prisma.outfit.findMany({ where: { id: { in: outfitIds } } })

  if (outfits.length !== outfitIds.length)
    return res.status(404).json({ error: 'One or more outfits not found' })

  let total_amount = 0
  const orderItems = items.map((item: any) => {
    const outfit = outfits.find(o => o.id === item.outfit_id)!
    total_amount += outfit.price * item.quantity
    return { outfit_id: item.outfit_id, quantity: item.quantity, price: outfit.price }
  })

  const order = await prisma.order.create({
    data: {
      user_id: userId,
      referrer_id: referrer_id ?? null,
      total_amount,
      items: { create: orderItems },
      status: 'CONFIRMED',
    },
    include: { items: true }
  })

  // Credit commission to referrer
  if (referrer_id && referrer_id !== userId) {
    const commission = total_amount * order.commission_rate
    await prisma.user.update({
      where: { id: referrer_id },
      data: { wallet_balance: { increment: commission } }
    })

    const buyer = await prisma.user.findUnique({
      where: { id: userId },
      select: { display_name: true }
    })

    // Create COMMISSION transaction for referrer
    await prisma.transaction.create({
      data: {
        user_id: referrer_id,
        type: 'COMMISSION',
        amount: commission,
        description: `10% Affiliate Commission on purchase by ${buyer?.display_name || 'Customer'}`,
        status: 'COMPLETED'
      }
    })
  }

  // Create PURCHASE transaction for buyer
  await prisma.transaction.create({
    data: {
      user_id: userId,
      type: 'PURCHASE',
      amount: total_amount,
      description: `Purchased outfit(s): ${outfits.map(o => o.name).join(', ')}`,
      status: 'COMPLETED'
    }
  })

  // Auto-add purchased outfits to buyer's wardrobe
  for (const item of orderItems) {
    await prisma.wardrobeItem.upsert({
      where: { user_id_outfit_id: { user_id: userId, outfit_id: item.outfit_id } },
      create: { user_id: userId, outfit_id: item.outfit_id },
      update: {}
    })
  }

  return res.status(201).json(order)
}

export const listOrders = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { user_id: (req as any).userId },
    include: { items: { include: { outfit: { select: { id: true, name: true, price: true } } } } },
    orderBy: { created_at: 'desc' }
  })
  return res.json(orders)
}

export const getOrder = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, user_id: (req as any).userId },
    include: { items: { include: { outfit: true } } }
  })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  return res.json(order)
}
