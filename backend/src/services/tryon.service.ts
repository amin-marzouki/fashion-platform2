import { Request, Response } from 'express'
import prisma from '../config/db'
import { sendToUE } from '../ws/psbridge'
import { env } from '../config/env'

const DEFAULT_METAHUMAN = 'BP_Avatar_01'

export const startTryOn = async (req: Request, res: Response) => {
  const { outfit_id, avatar_id, use_default } = req.body

  const outfit = await prisma.outfit.findUnique({ where: { id: outfit_id } })
  if (!outfit) return res.status(404).json({ error: 'Outfit not found' })

  if (!outfit.has_3d_model || !outfit.skm_asset_key) {
    return res.json({ mode: '2d', images: outfit.images })
  }

  let metahuman_id = DEFAULT_METAHUMAN

  if (!use_default && avatar_id) {
    const avatar = await prisma.avatar.findUnique({ where: { id: avatar_id } })
    if (avatar && avatar.status === 'READY') {
      metahuman_id = avatar.metahuman_id
    }
  }

  await sendToUE({
    action: 'SWITCH_OUTFIT',
    metahuman_id,
    skm_asset_key: outfit.skm_asset_key,
  })

  return res.json({
    mode: '3d',
    stream_url: env.PIXEL_STREAMING_URL,
    metahuman_id,
    skm_asset_key: outfit.skm_asset_key,
  })
}

export const switchOutfit = async (req: Request, res: Response) => {
  const { outfit_id, metahuman_id } = req.body
  const outfit = await prisma.outfit.findUnique({ where: { id: outfit_id } })
  if (!outfit || !outfit.skm_asset_key) return res.status(400).json({ error: 'No 3D model' })

  await sendToUE({ action: 'SWITCH_OUTFIT', metahuman_id, skm_asset_key: outfit.skm_asset_key })
  return res.json({ ok: true })
}
