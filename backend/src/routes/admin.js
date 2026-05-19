import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { User, Shipment, StatusHistory, STATUSES, generateTrackingCode } from '../models/index.js'
import { adminMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(adminMiddleware)

// Helper: lean shipment with id
const leanS = s => ({ ...s, id: s._id })
const leanMany = arr => arr.map(leanS)

// ── Stats ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [total, delivered, inTransit, frozen, pending, totalUsers, frozenUsers, recentShipments] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.countDocuments({ status_index: 9 }),
      Shipment.countDocuments({ status_index: { $gt: 0, $lt: 9 }, is_frozen: false }),
      Shipment.countDocuments({ is_frozen: true }),
      Shipment.countDocuments({ status_index: 0 }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ is_frozen: true }),
      Shipment.find().sort({ created_at: -1 }).limit(8).lean({ virtuals: true }),
    ])
    res.json({ total, delivered, inTransit, frozen, pending, totalUsers, frozenUsers, recentShipments: leanMany(recentShipments) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── List shipments ─────────────────────────────────────────────────
router.get('/shipments', async (req, res) => {
  try {
    const { search, status, frozen } = req.query
    const filter = {}
    if (search) {
      const re = new RegExp(search, 'i')
      filter.$or = [{ tracking_code: re }, { sender_name: re }, { recipient_name: re }, { origin_country: re }, { destination_country: re }]
    }
    if (status) filter.status = status
    if (frozen !== undefined) filter.is_frozen = frozen === 'true'
    const shipments = await Shipment.find(filter).sort({ created_at: -1 }).lean({ virtuals: true })
    res.json({ shipments: leanMany(shipments) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Single shipment ────────────────────────────────────────────────
router.get('/shipments/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).lean({ virtuals: true })
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' })
    const history = await StatusHistory.find({ shipment_id: req.params.id }).sort({ created_at: 1 }).lean({ virtuals: true })
    res.json({ shipment: leanS(shipment), history: history.map(h => ({ ...h, id: h._id })) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Create shipment ────────────────────────────────────────────────
router.post('/shipments', async (req, res) => {
  try {
    const { sender_name, sender_email, recipient_name, recipient_email, recipient_phone,
      origin_country, destination_country, package_description, weight, service_type, notes, estimated_delivery } = req.body

    if (!sender_name || !sender_email || !recipient_name || !origin_country || !destination_country || !package_description) {
      return res.status(400).json({ error: 'Please fill in all required fields' })
    }

    const tracking_code = generateTrackingCode()
    const est = estimated_delivery || new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0]

    const shipment = await Shipment.create({
      tracking_code, sender_name, sender_email, recipient_name, recipient_email,
      recipient_phone: recipient_phone || null, origin_country, destination_country,
      package_description, weight: parseFloat(weight) || 1.0,
      service_type: service_type || 'International Express',
      notes: notes || null, estimated_delivery: est,
    })

    await StatusHistory.create({
      shipment_id: shipment._id, status: 'Order Placed',
      note: 'Shipment registered in system', location: origin_country, updated_by: req.user._id,
    })

    res.json({ shipment: leanS(shipment.toObject({ virtuals: true })) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Progress (next status) ─────────────────────────────────────────
router.patch('/shipments/:id/progress', async (req, res) => {
  try {
    const s = await Shipment.findById(req.params.id)
    if (!s) return res.status(404).json({ error: 'Shipment not found' })
    if (s.is_frozen) return res.status(400).json({ error: 'Cannot progress a frozen shipment. Unfreeze it first.' })
    if (s.status_index >= 9) return res.status(400).json({ error: 'Package already delivered' })

    const next = s.status_index + 1
    const status = STATUSES[next]
    const { note, location } = req.body

    s.status = status; s.status_index = next; s.updated_at = new Date()
    await s.save()

    await StatusHistory.create({ shipment_id: s._id, status, note: note || `Package status: ${status}`, location: location || '', updated_by: req.user._id })

    res.json({ shipment: leanS((await Shipment.findById(s._id).lean({ virtuals: true }))) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Regress (previous status) ──────────────────────────────────────
router.patch('/shipments/:id/regress', async (req, res) => {
  try {
    const s = await Shipment.findById(req.params.id)
    if (!s) return res.status(404).json({ error: 'Shipment not found' })
    if (s.status_index <= 0) return res.status(400).json({ error: 'Already at initial status' })

    const prev = s.status_index - 1
    const status = STATUSES[prev]
    s.status = status; s.status_index = prev; s.updated_at = new Date()
    await s.save()

    await StatusHistory.create({ shipment_id: s._id, status, note: `Status corrected to: ${status}`, location: '', updated_by: req.user._id })
    res.json({ shipment: leanS((await Shipment.findById(s._id).lean({ virtuals: true }))) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Set status directly ────────────────────────────────────────────
router.patch('/shipments/:id/set-status', async (req, res) => {
  try {
    const { status_index, note, location } = req.body
    if (status_index === undefined || status_index < 0 || status_index >= STATUSES.length) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const s = await Shipment.findById(req.params.id)
    if (!s) return res.status(404).json({ error: 'Shipment not found' })

    const status = STATUSES[status_index]
    s.status = status; s.status_index = status_index; s.updated_at = new Date()
    await s.save()

    await StatusHistory.create({ shipment_id: s._id, status, note: note || `Status manually set to: ${status}`, location: location || '', updated_by: req.user._id })
    res.json({ shipment: leanS((await Shipment.findById(s._id).lean({ virtuals: true }))) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Freeze ─────────────────────────────────────────────────────────
router.patch('/shipments/:id/freeze', async (req, res) => {
  try {
    const s = await Shipment.findById(req.params.id)
    if (!s) return res.status(404).json({ error: 'Shipment not found' })

    s.is_frozen = true; s.updated_at = new Date()
    await s.save()

    await StatusHistory.create({ shipment_id: s._id, status: 'On Hold', note: req.body.reason || 'Shipment placed on hold by administrator', location: '', updated_by: req.user._id })
    res.json({ shipment: leanS((await Shipment.findById(s._id).lean({ virtuals: true }))) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Unfreeze ───────────────────────────────────────────────────────
router.patch('/shipments/:id/unfreeze', async (req, res) => {
  try {
    const s = await Shipment.findById(req.params.id)
    if (!s) return res.status(404).json({ error: 'Shipment not found' })

    s.is_frozen = false; s.updated_at = new Date()
    await s.save()

    await StatusHistory.create({ shipment_id: s._id, status: STATUSES[s.status_index], note: 'Shipment unfrozen — processing resumed', location: '', updated_by: req.user._id })
    res.json({ shipment: leanS((await Shipment.findById(s._id).lean({ virtuals: true }))) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Update delivery date ───────────────────────────────────────────
router.patch('/shipments/:id/update-delivery', async (req, res) => {
  try {
    const s = await Shipment.findByIdAndUpdate(req.params.id, { estimated_delivery: req.body.estimated_delivery, updated_at: new Date() }, { new: true }).lean({ virtuals: true })
    if (!s) return res.status(404).json({ error: 'Shipment not found' })
    res.json({ shipment: leanS(s) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Delete ─────────────────────────────────────────────────────────
router.delete('/shipments/:id', async (req, res) => {
  try {
    const s = await Shipment.findById(req.params.id)
    if (!s) return res.status(404).json({ error: 'Shipment not found' })
    await StatusHistory.deleteMany({ shipment_id: s._id })
    await s.deleteOne()
    res.json({ message: 'Shipment deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── List users ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query
    const filter = {}
    if (search) {
      const re = new RegExp(search, 'i')
      filter.$or = [{ name: re }, { email: re }]
    }
    const users = await User.find(filter).select('-password_hash').sort({ created_at: -1 }).lean({ virtuals: true })
    res.json({ users: users.map(u => ({ ...u, id: u._id })) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Toggle user freeze ─────────────────────────────────────────────
router.patch('/users/:id/toggle-freeze', async (req, res) => {
  try {
    const u = await User.findById(req.params.id)
    if (!u) return res.status(404).json({ error: 'User not found' })
    if (u.role === 'superadmin') return res.status(400).json({ error: 'Cannot freeze the Super Administrator' })

    u.is_frozen = !u.is_frozen
    await u.save()

    const plain = u.toObject({ virtuals: true })
    delete plain.password_hash
    res.json({ user: { ...plain, id: u._id } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Statuses list ──────────────────────────────────────────────────
router.get('/statuses', (req, res) => res.json({ statuses: STATUSES }))

export default router
