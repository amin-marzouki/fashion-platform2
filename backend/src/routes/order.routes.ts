import { Router } from 'express'
import { createOrder, listOrders, getOrder } from '../services/order.service'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.post('/', authMiddleware, createOrder)
router.get('/', authMiddleware, listOrders)
router.get('/:id', authMiddleware, getOrder)
export default router
