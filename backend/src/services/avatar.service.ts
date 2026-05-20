import { Request, Response } from 'express'
import prisma from '../config/db'
import { avatarQueue } from '../workers/avatarWorker'
import { uploadToS3 } from '../middleware/upload'

export const createAvatar = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(String((req as any).userId), 10)
  if (isNaN(userIdParsed)) {
    return res.status(401).json({ error: 'Invalid user session' })
  }

  const { body_height, body_weight, body_chest, body_waist, body_hips } = req.body
  const files = req.files as Express.Multer.File[]

  if (!files || files.length !== 6)
    return res.status(400).json({ error: 'Exactly 6 face photos required' })

  const photos_urls = await Promise.all(files.map(f => uploadToS3(f, `avatars/${userIdParsed}`)))

  const avatar = await prisma.avatar.upsert({
    where: { user_id: userIdParsed },
    create: {
      user_id: userIdParsed,
      metahuman_id: '',
      status: 'PENDING',
      photos_urls,
      body_height: parseFloat(body_height),
      body_weight: parseFloat(body_weight),
      body_chest:  parseFloat(body_chest),
      body_waist:  parseFloat(body_waist),
      body_hips:   parseFloat(body_hips),
      estimated_ready: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    update: {
      status: 'PENDING',
      photos_urls,
      body_height: parseFloat(body_height),
      body_weight: parseFloat(body_weight),
      body_chest:  parseFloat(body_chest),
      body_waist:  parseFloat(body_waist),
      body_hips:   parseFloat(body_hips),
      estimated_ready: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
  })

  await avatarQueue.add('process-avatar', { avatarId: avatar.id })

  return res.status(202).json({
    message: 'Avatar creation started',
    avatar_id: avatar.id,
    status: avatar.status,
    estimated_ready: avatar.estimated_ready,
  })
}

export const getMyAvatar = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(String((req as any).userId), 10)
  if (isNaN(userIdParsed)) {
    return res.status(401).json({ error: 'Invalid user session' })
  }

  const avatar = await prisma.avatar.findUnique({ where: { user_id: userIdParsed } })
  return res.json(avatar ?? { status: 'NONE' })
}

export const getAvatarById = async (req: Request, res: Response) => {
  const avatarIdParsed = parseInt(req.params.id, 10)
  if (isNaN(avatarIdParsed)) {
    return res.status(400).json({ error: 'Invalid avatar ID' })
  }

  const avatar = await prisma.avatar.findUnique({
    where: { id: avatarIdParsed },
    select: { id: true, metahuman_id: true, status: true, body_height: true, body_weight: true, created_at: true }
  })
  if (!avatar) return res.status(404).json({ error: 'Not found' })
  return res.json(avatar)
}
