import { Router } from 'express'
import { Shipment, StatusHistory } from '../models/index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Public tracking
router.get('/track/:code', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ tracking_code: req.params.code.toUpperCase() }).lean({ virtuals: true })
    if (!shipment) return res.status(404).json({ error: 'No shipment found with that tracking code. Please check and try again.' })

    const history = await StatusHistory.find({ shipment_id: shipment._id }).sort({ created_at: 1 }).lean({ virtuals: true })

    // Remove internal sender_id for public response
    const { sender_id, _id, __v, ...pub } = shipment
    pub.id = shipment._id

    res.json({ shipment: pub, history: history.map(h => ({ ...h, id: h._id })) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// User's own shipments (auth required)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const shipments = await Shipment.find({
      $or: [{ sender_id: req.user._id }, { sender_email: req.user.email }]
    }).sort({ created_at: -1 }).lean({ virtuals: true })

    res.json({ shipments: shipments.map(s => ({ ...s, id: s._id })) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
