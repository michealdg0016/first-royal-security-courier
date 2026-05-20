import { Router } from 'express'
import { ChatMessage, ChatSession } from '../models/index.js'
import { adminMiddleware } from '../middleware/auth.js'

const router = Router()

// User: get message history for a session
router.get('/session/:sessionId/messages', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ session_id: req.params.sessionId })
      .sort({ created_at: 1 }).lean({ virtuals: true })
    res.json({ messages: messages.map(m => ({ ...m, id: m._id })) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: list all sessions
router.get('/admin/sessions', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query
    const filter = status && status !== 'all' ? { status } : {}
    const sessions = await ChatSession.find(filter)
      .sort({ last_activity: -1 }).lean({ virtuals: true })
    res.json({ sessions: sessions.map(s => ({ ...s, id: s._id })) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: get session messages
router.get('/admin/sessions/:sessionId/messages', adminMiddleware, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ session_id: req.params.sessionId })
      .sort({ created_at: 1 }).lean({ virtuals: true })
    res.json({ messages: messages.map(m => ({ ...m, id: m._id })) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: unread count
router.get('/admin/unread', adminMiddleware, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ status: 'open', unread_admin: { $gt: 0 } })
    const total = sessions.reduce((sum, s) => sum + (s.unread_admin || 0), 0)
    res.json({ total, sessions: sessions.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
