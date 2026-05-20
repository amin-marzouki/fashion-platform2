import { Router } from 'express'
import { createAvatar, getMyAvatar, getAvatarById } from '../services/avatar.service'
import { authMiddleware } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()
router.post('/', authMiddleware, upload.array('photos', 6), createAvatar)
router.get('/me', authMiddleware, getMyAvatar)
router.get('/:id', getAvatarById)
export default router
