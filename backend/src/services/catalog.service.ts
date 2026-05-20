import { Request, Response } from 'express'
import prisma from '../config/db'
import { mapProductToOutfit } from '../utils/mapper'

export const listMarkets = async (_req: Request, res: Response) => {
  const markets = await prisma.market.findMany({
    include: { _count: { select: { products: true } } }
  })
  return res.json(markets)
}

export const getMarketOutfits = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { market_id: req.params.id, stock: { gt: 0 } }
  })
  const outfits = products.map(mapProductToOutfit)
  return res.json(outfits)
}

export const getOutfit = async (req: Request, res: Response) => {
  const productIdx = parseInt(req.params.id, 10)
  if (isNaN(productIdx)) return res.status(400).json({ error: 'Invalid product ID' })

  const product = await prisma.product.findUnique({ where: { id: productIdx } })
  if (!product) return res.status(404).json({ error: 'Not found' })
  return res.json(mapProductToOutfit(product))
}

export const listOutfits = async (req: Request, res: Response) => {
  const { category, product_type } = req.query
  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category: String(category) } : {}),
      ...(product_type ? { product_type: String(product_type) } : {}),
    },
    include: { market: { select: { id: true, name: true } } }
  })
  const outfits = products.map(mapProductToOutfit)
  return res.json(outfits)
}

export const listModels = async (_req: Request, res: Response) => {
  const models = await prisma.user.findMany({
    where: { isModel: true },
    select: {
      id: true,
      name: true,
      photo: true,
      bodyDescription: true,
      clothesTaste: true
    }
  })
  return res.json(models)
}
