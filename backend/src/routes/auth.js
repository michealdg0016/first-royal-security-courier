import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and full name are required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' })

    const user = await User.create({
      email: email.toLowerCase(),
      password_hash: await bcrypt.hash(password, 10),
      name,
      phone: phone || null,
      role: 'customer',
    })

    const token = jwt.sign({ id: user._id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, phone: user.phone, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    if (user.is_frozen) return res.status(403).json({ error: 'Your account has been suspended. Contact support@firstroyalsecurity.com' })

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, phone: user.phone, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', authMiddleware, (req, res) => {
  const { _id: id, email, name, phone, role } = req.user
  res.json({ id, email, name, phone, role })
})

export default router
