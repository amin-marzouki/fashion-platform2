import { Request, Response } from 'express'
import prisma from '../config/db'
import { sendToUE } from '../ws/psbridge'
import { env } from '../config/env'

const DEFAULT_METAHUMAN = 'BP_Avatar_01'

export const startTryOn = async (req: Request, res: Response) => {
  const { outfit_id, avatar_id, use_default } = req.body

  const outfitIdx = parseInt(String(outfit_id), 10)
  if (isNaN(outfitIdx)) return res.status(400).json({ error: 'Invalid product ID' })

  const outfit = await prisma.product.findUnique({ where: { id: outfitIdx } })
  if (!outfit) return res.status(404).json({ error: 'Product not found' })

  if (!outfit.model_3d_url) {
    return res.json({ mode: '2d', images: [outfit.image_url] })
  }

  let metahuman_id = DEFAULT_METAHUMAN

  if (!use_default && avatar_id) {
    const avatarIdx = parseInt(String(avatar_id), 10)
    if (!isNaN(avatarIdx)) {
      const avatar = await prisma.avatar.findUnique({ where: { id: avatarIdx } })
      if (avatar && avatar.status === 'READY') {
        metahuman_id = avatar.metahuman_id
      }
    }
  }

  await sendToUE({
    action: 'SWITCH_OUTFIT',
    metahuman_id,
    skm_asset_key: outfit.model_3d_url,
  })

  return res.json({
    mode: '3d',
    stream_url: env.PIXEL_STREAMING_URL,
    metahuman_id,
    skm_asset_key: outfit.model_3d_url,
  })
}

export const switchOutfit = async (req: Request, res: Response) => {
  const { outfit_id, metahuman_id } = req.body

  const outfitIdx = parseInt(String(outfit_id), 10)
  if (isNaN(outfitIdx)) return res.status(400).json({ error: 'Invalid product ID' })

  const outfit = await prisma.product.findUnique({ where: { id: outfitIdx } })
  if (!outfit || !outfit.model_3d_url) return res.status(400).json({ error: 'No 3D model' })

  await sendToUE({ action: 'SWITCH_OUTFIT', metahuman_id, skm_asset_key: outfit.model_3d_url })
  return res.json({ ok: true })
}
