import { Router } from 'express'
import { register, login, refresh, me } from '../services/auth.service'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.get('/me', authMiddleware, me)
export default router
