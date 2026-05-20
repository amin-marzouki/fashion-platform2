import { Router } from 'express'
import { listMarkets, getMarketOutfits, getOutfit, listOutfits, listModels } from '../services/catalog.service'

const router = Router()
router.get('/markets', listMarkets)
router.get('/markets/:id/outfits', getMarketOutfits)
router.get('/outfits', listOutfits)
router.get('/outfits/:id', getOutfit)
router.get('/models', listModels)
export default router
