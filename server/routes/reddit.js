import { Router } from 'express'
import cache from '../cache.js'

const router = Router()

router.get('/', (req, res) => {
  const entry = cache.get('reddit')
  if (!entry) return res.json([])
  res.json(entry.data)
})

export default router
