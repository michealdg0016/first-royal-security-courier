import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../db/setup.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

router.post('/signup', async (req, res) => {
  const { email, password, name, phone } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and full name are required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  const db = getDb()
  if (db.query('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }
  const id = uuidv4()
  const hash = await bcrypt.hash(password, 10)
  db.run(`INSERT INTO users (id, email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?, 'customer')`,
    [id, email.toLowerCase(), hash, name, phone || null])
  const token = jwt.sign({ id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id, email: email.toLowerCase(), name, phone: phone || null, role: 'customer' } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  const db = getDb()
  const user = db.query('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  if (user.is_frozen) return res.status(403).json({ error: 'Your account has been suspended. Contact support@firstroyalsecurity.com' })
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } })
})

router.get('/me', authMiddleware, (req, res) => {
  const { id, email, name, phone, role } = req.user
  res.json({ id, email, name, phone, role })
})

export default router
