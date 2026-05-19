import { Router } from 'express'
import { getDb } from '../db/setup.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/track/:code', (req, res) => {
  const db = getDb()
  const shipment = db.query('SELECT * FROM shipments WHERE tracking_code = ?').get(req.params.code.toUpperCase())
  if (!shipment) return res.status(404).json({ error: 'No shipment found with that tracking code. Please check and try again.' })
  const history = db.query('SELECT * FROM status_history WHERE shipment_id = ? ORDER BY created_at ASC').all(shipment.id)
  const { sender_id, ...pub } = shipment
  res.json({ shipment: pub, history })
})

router.get('/my', authMiddleware, (req, res) => {
  const db = getDb()
  const shipments = db.query(`SELECT * FROM shipments WHERE sender_id = ? OR sender_email = ? ORDER BY created_at DESC`).all(req.user.id, req.user.email)
  res.json({ shipments })
})

export default router
