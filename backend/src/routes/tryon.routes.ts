import { Router } from 'express'
import { startTryOn, switchOutfit } from '../services/tryon.service'
import { optionalAuth } from '../middleware/auth'

const router = Router()
router.post('/', optionalAuth, startTryOn)
router.post('/switch', optionalAuth, switchOutfit)
export default router
