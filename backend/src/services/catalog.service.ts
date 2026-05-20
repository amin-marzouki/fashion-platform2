import { Request, Response } from 'express'
import prisma from '../config/db'

export const listMarkets = async (_req: Request, res: Response) => {
  const markets = await prisma.market.findMany({
    include: { _count: { select: { outfits: true } } }
  })
  return res.json(markets)
}

export const getMarketOutfits = async (req: Request, res: Response) => {
  const outfits = await prisma.outfit.findMany({
    where: { market_id: req.params.id, in_stock: true },
    select: {
      id: true, name: true, price: true, currency: true,
      images: true, has_3d_model: true, tags: true,
      occasion: true, style_type: true
    }
  })
  return res.json(outfits)
}

export const getOutfit = async (req: Request, res: Response) => {
  const outfit = await prisma.outfit.findUnique({ where: { id: req.params.id } })
  if (!outfit) return res.status(404).json({ error: 'Not found' })
  return res.json(outfit)
}

export const listOutfits = async (req: Request, res: Response) => {
  const { occasion, style_type, in_stock } = req.query
  const outfits = await prisma.outfit.findMany({
    where: {
      ...(occasion ? { occasion: String(occasion) } : {}),
      ...(style_type ? { style_type: String(style_type) } : {}),
      ...(in_stock !== undefined ? { in_stock: in_stock === 'true' } : { in_stock: true }),
    },
    include: { market: { select: { id: true, name: true } } }
  })
  return res.json(outfits)
}

export const listModels = async (_req: Request, res: Response) => {
  const models = await prisma.user.findMany({
    where: { isModel: true },
    select: {
      id: true,
      display_name: true,
      photo: true,
      bodyDescription: true,
      clothesTaste: true
    }
  })
  return res.json(models)
}
