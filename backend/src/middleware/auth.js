import jwt from 'jsonwebtoken'
import { getDb } from '../db/setup.js'

export const JWT_SECRET = process.env.JWT_SECRET || 'frsc-royal-jwt-secret-2024-secure'

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = getDb().query('SELECT * FROM users WHERE id = ?').get(decoded.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.is_frozen) return res.status(403).json({ error: 'Your account has been suspended. Contact support.' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Administrator access required' })
    }
    next()
  })
}
