import { Router } from 'express'
import { getMyWardrobe, getPublicWardrobe, addToWardrobe, removeFromWardrobe } from '../services/wardrobe.service'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.get('/me', authMiddleware, getMyWardrobe)
router.get('/:userId', getPublicWardrobe)
router.post('/items', authMiddleware, addToWardrobe)
router.delete('/items/:outfitId', authMiddleware, removeFromWardrobe)
export default router
