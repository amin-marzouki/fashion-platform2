import { Request, Response } from 'express'
import prisma from '../config/db'

export const getMyWardrobe = async (req: Request, res: Response) => {
  const items = await prisma.wardrobeItem.findMany({
    where: { user_id: (req as any).userId },
    include: { outfit: { include: { market: { select: { id: true, name: true } } } } }
  })
  return res.json(items)
}

export const getPublicWardrobe = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
    select: { id: true, display_name: true, avatar: true }
  })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const items = await prisma.wardrobeItem.findMany({
    where: { user_id: req.params.userId, is_public: true },
    include: { outfit: true }
  })
  return res.json({ user, items })
}

export const addToWardrobe = async (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { outfit_id, is_public } = req.body
  if (!outfit_id) return res.status(400).json({ error: 'outfit_id required' })

  const item = await prisma.wardrobeItem.upsert({
    where: { user_id_outfit_id: { user_id: userId, outfit_id } },
    create: { user_id: userId, outfit_id, is_public: is_public ?? true },
    update: { is_public: is_public ?? true }
  })
  return res.status(201).json(item)
}

export const removeFromWardrobe = async (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { outfitId } = req.params
  await prisma.wardrobeItem.deleteMany({ where: { user_id: userId, outfit_id: outfitId } })
  return res.json({ ok: true })
}
