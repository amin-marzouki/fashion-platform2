import { Router } from 'express'
import { smartSearch } from '../services/search.service'

const router = Router()
router.post('/', smartSearch)
export default router
