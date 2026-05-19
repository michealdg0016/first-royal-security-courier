import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDb, STATUSES, generateTrackingCode } from '../db/setup.js'
import { adminMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(adminMiddleware)

router.get('/stats', (req, res) => {
  const db = getDb()
  const total = db.query('SELECT COUNT(*) as c FROM shipments').get().c
  const delivered = db.query("SELECT COUNT(*) as c FROM shipments WHERE status_index = 9").get().c
  const inTransit = db.query("SELECT COUNT(*) as c FROM shipments WHERE status_index > 0 AND status_index < 9 AND is_frozen = 0").get().c
  const frozen = db.query("SELECT COUNT(*) as c FROM shipments WHERE is_frozen = 1").get().c
  const pending = db.query("SELECT COUNT(*) as c FROM shipments WHERE status_index = 0").get().c
  const totalUsers = db.query("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get().c
  const frozenUsers = db.query("SELECT COUNT(*) as c FROM users WHERE is_frozen = 1").get().c
  const recentShipments = db.query('SELECT * FROM shipments ORDER BY created_at DESC LIMIT 8').all()
  res.json({ total, delivered, inTransit, frozen, pending, totalUsers, frozenUsers, recentShipments })
})

router.get('/shipments', (req, res) => {
  const db = getDb()
  const { search, status, frozen } = req.query
  let q = 'SELECT * FROM shipments WHERE 1=1'
  const p = []
  if (search) { q += ' AND (tracking_code LIKE ? OR sender_name LIKE ? OR recipient_name LIKE ? OR origin_country LIKE ? OR destination_country LIKE ?)'; const s = `%${search}%`; p.push(s, s, s, s, s) }
  if (status) { q += ' AND status = ?'; p.push(status) }
  if (frozen !== undefined) { q += ' AND is_frozen = ?'; p.push(frozen === 'true' ? 1 : 0) }
  q += ' ORDER BY created_at DESC'
  res.json({ shipments: db.query(q).all(...p) })
})

router.get('/shipments/:id', (req, res) => {
  const db = getDb()
  const shipment = db.query('SELECT * FROM shipments WHERE id = ?').get(req.params.id)
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' })
  const history = db.query('SELECT * FROM status_history WHERE shipment_id = ? ORDER BY created_at ASC').all(shipment.id)
  res.json({ shipment, history })
})

router.post('/shipments', (req, res) => {
  const db = getDb()
  const { sender_name, sender_email, recipient_name, recipient_email, recipient_phone, origin_country, destination_country, package_description, weight, service_type, notes, estimated_delivery } = req.body
  if (!sender_name || !sender_email || !recipient_name || !origin_country || !destination_country || !package_description) {
    return res.status(400).json({ error: 'Please fill in all required fields' })
  }
  const id = uuidv4()
  const tracking_code = generateTrackingCode()
  const est = estimated_delivery || new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0]
  db.run(`INSERT INTO shipments (id, tracking_code, sender_name, sender_email, recipient_name, recipient_email, recipient_phone, origin_country, destination_country, package_description, weight, status, status_index, service_type, notes, estimated_delivery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed', 0, ?, ?, ?)`,
    [id, tracking_code, sender_name, sender_email, recipient_name, recipient_email, recipient_phone || null, origin_country, destination_country, package_description, parseFloat(weight) || 1.0, service_type || 'International Express', notes || null, est])
  db.run(`INSERT INTO status_history (id, shipment_id, status, note, location, updated_by) VALUES (?, ?, 'Order Placed', 'Shipment registered in system', ?, ?)`,
    [uuidv4(), id, origin_country, req.user.id])
  res.json({ shipment: db.query('SELECT * FROM shipments WHERE id = ?').get(id) })
})

router.patch('/shipments/:id/progress', (req, res) => {
  const db = getDb()
  const s = db.query('SELECT * FROM shipments WHERE id = ?').get(req.params.id)
  if (!s) return res.status(404).json({ error: 'Shipment not found' })
  if (s.is_frozen) return res.status(400).json({ error: 'Cannot progress a frozen shipment. Unfreeze it first.' })
  if (s.status_index >= 9) return res.status(400).json({ error: 'Package already delivered' })
  const next = s.status_index + 1
  const status = STATUSES[next]
  const { note, location } = req.body
  db.run("UPDATE shipments SET status = ?, status_index = ?, updated_at = datetime('now') WHERE id = ?", [status, next, s.id])
  db.run(`INSERT INTO status_history (id, shipment_id, status, note, location, updated_by) VALUES (?, ?, ?, ?, ?, ?)`, [uuidv4(), s.id, status, note || `Package status: ${status}`, location || '', req.user.id])
  res.json({ shipment: db.query('SELECT * FROM shipments WHERE id = ?').get(s.id) })
})

router.patch('/shipments/:id/regress', (req, res) => {
  const db = getDb()
  const s = db.query('SELECT * FROM shipments WHERE id = ?').get(req.params.id)
  if (!s) return res.status(404).json({ error: 'Shipment not found' })
  if (s.status_index <= 0) return res.status(400).json({ error: 'Already at initial status' })
  const prev = s.status_index - 1
  const status = STATUSES[prev]
  db.run("UPDATE shipments SET status = ?, status_index = ?, updated_at = datetime('now') WHERE id = ?", [status, prev, s.id])
  db.run(`INSERT INTO status_history (id, shipment_id, status, note, location, updated_by) VALUES (?, ?, ?, ?, '', ?)`, [uuidv4(), s.id, status, `Status corrected to: ${status}`, req.user.id])
  res.json({ shipment: db.query('SELECT * FROM shipments WHERE id = ?').get(s.id) })
})

router.patch('/shipments/:id/set-status', (req, res) => {
  const db = getDb()
  const { status_index, note, location } = req.body
  if (status_index === undefined || status_index < 0 || status_index >= STATUSES.length) return res.status(400).json({ error: 'Invalid status' })
  const s = db.query('SELECT * FROM shipments WHERE id = ?').get(req.params.id)
  if (!s) return res.status(404).json({ error: 'Shipment not found' })
  const status = STATUSES[status_index]
  db.run("UPDATE shipments SET status = ?, status_index = ?, updated_at = datetime('now') WHERE id = ?", [status, status_index, s.id])
  db.run(`INSERT INTO status_history (id, shipment_id, status, note, location, updated_by) VALUES (?, ?, ?, ?, ?, ?)`, [uuidv4(), s.id, status, note || `Status manually set to: ${status}`, location || '', req.user.id])
  res.json({ shipment: db.query('SELECT * FROM shipments WHERE id = ?').get(s.id) })
})

router.patch('/shipments/:id/freeze', (req, res) => {
  const db = getDb()
  const s = db.query('SELECT * FROM shipments WHERE id = ?').get(req.params.id)
  if (!s) return res.status(404).json({ error: 'Shipment not found' })
  db.run("UPDATE shipments SET is_frozen = 1, updated_at = datetime('now') WHERE id = ?", [s.id])
  db.run(`INSERT INTO status_history (id, shipment_id, status, note, location, updated_by) VALUES (?, ?, 'On Hold', ?, '', ?)`, [uuidv4(), s.id, req.body.reason || 'Shipment placed on hold by administrator', req.user.id])
  res.json({ shipment: db.query('SELECT * FROM shipments WHERE id = ?').get(s.id) })
})

router.patch('/shipments/:id/unfreeze', (req, res) => {
  const db = getDb()
  const s = db.query('SELECT * FROM shipments WHERE id = ?').get(req.params.id)
  if (!s) return res.status(404).json({ error: 'Shipment not found' })
  db.run("UPDATE shipments SET is_frozen = 0, updated_at = datetime('now') WHERE id = ?", [s.id])
  db.run(`INSERT INTO status_history (id, shipment_id, status, note, location, updated_by) VALUES (?, ?, ?, 'Shipment unfrozen — processing resumed', '', ?)`, [uuidv4(), s.id, STATUSES[s.status_index], req.user.id])
  res.json({ shipment: db.query('SELECT * FROM shipments WHERE id = ?').get(s.id) })
})

router.patch('/shipments/:id/update-delivery', (req, res) => {
  const db = getDb()
  db.run("UPDATE shipments SET estimated_delivery = ?, updated_at = datetime('now') WHERE id = ?", [req.body.estimated_delivery, req.params.id])
  res.json({ shipment: db.query('SELECT * FROM shipments WHERE id = ?').get(req.params.id) })
})

router.delete('/shipments/:id', (req, res) => {
  const db = getDb()
  const s = db.query('SELECT * FROM shipments WHERE id = ?').get(req.params.id)
  if (!s) return res.status(404).json({ error: 'Shipment not found' })
  db.run('DELETE FROM status_history WHERE shipment_id = ?', [s.id])
  db.run('DELETE FROM shipments WHERE id = ?', [s.id])
  res.json({ message: 'Shipment deleted' })
})

router.get('/users', (req, res) => {
  const db = getDb()
  const { search } = req.query
  let q = 'SELECT id, email, name, phone, role, is_frozen, created_at FROM users WHERE 1=1'
  const p = []
  if (search) { q += ' AND (name LIKE ? OR email LIKE ?)'; const s = `%${search}%`; p.push(s, s) }
  q += ' ORDER BY created_at DESC'
  res.json({ users: db.query(q).all(...p) })
})

router.patch('/users/:id/toggle-freeze', (req, res) => {
  const db = getDb()
  const u = db.query('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!u) return res.status(404).json({ error: 'User not found' })
  if (u.role === 'superadmin') return res.status(400).json({ error: 'Cannot freeze the Super Administrator' })
  db.run('UPDATE users SET is_frozen = ? WHERE id = ?', [u.is_frozen ? 0 : 1, u.id])
  res.json({ user: db.query('SELECT id, email, name, phone, role, is_frozen, created_at FROM users WHERE id = ?').get(u.id) })
})

router.get('/statuses', (req, res) => res.json({ statuses: STATUSES }))

export default router
