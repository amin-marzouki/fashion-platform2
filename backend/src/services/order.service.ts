import { Request, Response } from 'express'
import prisma from '../config/db'

export const createOrder = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(String((req as any).userId), 10)
  if (isNaN(userIdParsed)) {
    return res.status(401).json({ error: 'Invalid user session' })
  }

  const { items, referrer_id } = req.body
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array required' })
  }

  const productIds = items.map((i: any) => parseInt(String(i.outfit_id || i.product_id), 10)).filter(id => !isNaN(id))
  if (productIds.length !== items.length) {
    return res.status(400).json({ error: 'All items must have valid outfit_id/product_id' })
  }

  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

  if (products.length !== productIds.length) {
    return res.status(404).json({ error: 'One or more products not found' })
  }

  let total_amount = 0
  const orderItems = items.map((item: any) => {
    const productIdx = parseInt(String(item.outfit_id || item.product_id), 10)
    const product = products.find(p => p.id === productIdx)!
    total_amount += product.price * item.quantity
    return {
      product_id: productIdx,
      quantity: item.quantity,
      unit_price: product.price,
      size: item.size || 'M'
    }
  })

  const referrerIdParsed = referrer_id ? parseInt(String(referrer_id), 10) : null

  const order = await prisma.order.create({
    data: {
      user_id: userIdParsed,
      referred_by: referrerIdParsed && !isNaN(referrerIdParsed) ? referrerIdParsed : null,
      total_amount,
      status: 'paid',
      items: { create: orderItems }
    },
    include: { items: true }
  })

  // Credit 10% commission to referrer
  if (referrerIdParsed && !isNaN(referrerIdParsed) && referrerIdParsed !== userIdParsed) {
    const referrer = await prisma.user.findUnique({ where: { id: referrerIdParsed } })
    if (referrer) {
      const commissionAmount = total_amount * 0.10
      await prisma.user.update({
        where: { id: referrerIdParsed },
        data: {
          wallet_balance: { increment: commissionAmount },
          total_commission: { increment: commissionAmount }
        }
      })

      // Create Commission record
      await prisma.commission.create({
        data: {
          referrer_id: referrerIdParsed,
          order_id: order.id,
          amount: commissionAmount,
          status: 'paid'
        }
      })
    }
  }

  // Update user stats
  await prisma.user.update({
    where: { id: userIdParsed },
    data: {
      total_orders: { increment: 1 },
      days_since_last_order: 0,
      last_category: products[0]?.category || null,
      last_product_type: products[0]?.product_type || null
    }
  })

  // Auto-add purchased outfits to buyer's wardrobe
  for (const item of orderItems) {
    await prisma.wardrobe.upsert({
      where: { user_id_product_id: { user_id: userIdParsed, product_id: item.product_id } },
      create: { user_id: userIdParsed, product_id: item.product_id },
      update: {}
    })
  }

  return res.status(201).json(order)
}

export const listOrders = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(String((req as any).userId), 10)
  if (isNaN(userIdParsed)) {
    return res.status(401).json({ error: 'Invalid user session' })
  }

  const orders = await prisma.order.findMany({
    where: { user_id: userIdParsed },
    include: { items: { include: { product: { select: { id: true, name: true, price: true, image_url: true } } } } },
    orderBy: { id: 'desc' }
  })
  return res.json(orders)
}

export const getOrder = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(String((req as any).userId), 10)
  const orderIdParsed = parseInt(req.params.id, 10)
  if (isNaN(userIdParsed) || isNaN(orderIdParsed)) {
    return res.status(400).json({ error: 'Invalid request parameters' })
  }

  const order = await prisma.order.findFirst({
    where: { id: orderIdParsed, user_id: userIdParsed },
    include: { items: { include: { product: true } } }
  })
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  return res.json(order)
}
