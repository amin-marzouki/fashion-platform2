import { Request, Response } from 'express'
import prisma from '../config/db'
import { mapProductToOutfit } from '../utils/mapper'

export const getMyWardrobe = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(String((req as any).userId), 10)
  if (isNaN(userIdParsed)) return res.status(401).json({ error: 'Invalid user session' })

  const items = await prisma.wardrobe.findMany({
    where: { user_id: userIdParsed },
    include: { product: { include: { market: { select: { id: true, name: true } } } } }
  })

  const mapped = items.map(item => ({
    id: String(item.id),
    user_id: String(item.user_id),
    outfit_id: String(item.product_id),
    is_public: true,
    outfit: mapProductToOutfit(item.product)
  }))

  return res.json(mapped)
}

export const getPublicWardrobe = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(req.params.userId, 10)
  if (isNaN(userIdParsed)) return res.status(400).json({ error: 'Invalid user ID' })

  const user = await prisma.user.findUnique({
    where: { id: userIdParsed },
    select: { id: true, name: true, avatar: true }
  })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const items = await prisma.wardrobe.findMany({
    where: { user_id: userIdParsed },
    include: { product: true }
  })

  const mappedItems = items.map(item => ({
    id: String(item.id),
    user_id: String(item.user_id),
    outfit_id: String(item.product_id),
    is_public: true,
    outfit: mapProductToOutfit(item.product)
  }))

  return res.json({ user, items: mappedItems })
}

export const addToWardrobe = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(String((req as any).userId), 10)
  const { outfit_id } = req.body
  if (!outfit_id) return res.status(400).json({ error: 'outfit_id required' })

  const productIdx = parseInt(String(outfit_id), 10)
  if (isNaN(userIdParsed) || isNaN(productIdx)) {
    return res.status(400).json({ error: 'Invalid user or product ID' })
  }

  const item = await prisma.wardrobe.upsert({
    where: { user_id_product_id: { user_id: userIdParsed, product_id: productIdx } },
    create: { user_id: userIdParsed, product_id: productIdx },
    update: {}
  })
  return res.status(201).json(item)
}

export const removeFromWardrobe = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(String((req as any).userId), 10)
  const productIdx = parseInt(req.params.outfitId, 10)
  if (isNaN(userIdParsed) || isNaN(productIdx)) {
    return res.status(400).json({ error: 'Invalid user or product ID' })
  }

  await prisma.wardrobe.deleteMany({ where: { user_id: userIdParsed, product_id: productIdx } })
  return res.json({ ok: true })
}
