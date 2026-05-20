import jwt from 'jsonwebtoken'
import { ChatMessage, ChatSession } from './models/index.js'
import { JWT_SECRET } from './middleware/auth.js'

const ADMIN_ROOM = 'admin-live-chat'

function lean(doc) {
  if (!doc) return null
  const obj = typeof doc.toJSON === 'function' ? doc.toJSON() : doc
  return obj
}

export function setupSocketIO(io) {
  io.on('connection', (socket) => {

    // ── User: init or resume a chat session ──────────────────────
    socket.on('chat:init', async ({ sessionId, userName, userEmail, userId, trackingCode }) => {
      if (!sessionId) return
      socket.join(`session:${sessionId}`)

      let session = await ChatSession.findById(sessionId)
      if (!session) {
        session = await ChatSession.create({
          _id: sessionId,
          user_id:       userId      || null,
          user_name:     userName    || 'Guest',
          user_email:    userEmail   || null,
          tracking_code: trackingCode|| null,
        })
        // Tell all admins a new chat started
        io.to(ADMIN_ROOM).emit('admin:new_session', lean(session))
      }

      const messages = await ChatMessage.find({ session_id: sessionId })
        .sort({ created_at: 1 }).lean({ virtuals: true })

      socket.emit('chat:session', {
        session:  lean(session),
        messages: messages.map(m => ({ ...m, id: m._id })),
      })
    })

    // ── User: send message ────────────────────────────────────────
    socket.on('chat:send', async ({ sessionId, message, userName }) => {
      if (!sessionId || !message?.trim()) return
      const session = await ChatSession.findById(sessionId)
      if (!session) return

      const msg = await ChatMessage.create({
        session_id:  sessionId,
        sender:      'user',
        message:     message.trim(),
        sender_name: userName || session.user_name,
      })

      session.last_message  = message.trim()
      session.last_activity = new Date()
      session.unread_admin  = (session.unread_admin || 0) + 1
      session.status        = 'open'
      await session.save()

      const msgData = lean(msg)
      io.to(`session:${sessionId}`).emit('chat:message', msgData)
      io.to(ADMIN_ROOM).emit('admin:new_message', { sessionId, message: msgData, session: lean(session) })
    })

    // ── User: typing indicator ────────────────────────────────────
    socket.on('chat:typing', ({ sessionId, typing }) => {
      io.to(ADMIN_ROOM).emit('admin:user_typing', { sessionId, typing })
    })

    // ── Admin: join admin room ────────────────────────────────────
    socket.on('admin:init', async ({ token }) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if (!['admin', 'superadmin'].includes(decoded.role)) {
          return socket.emit('admin:error', 'Unauthorized')
        }
        socket.data.adminId   = decoded.id
        socket.data.adminName = decoded.name
        socket.join(ADMIN_ROOM)

        const sessions = await ChatSession.find({ status: 'open' })
          .sort({ last_activity: -1 }).lean({ virtuals: true })
        socket.emit('admin:sessions', sessions.map(s => ({ ...s, id: s._id })))
      } catch {
        socket.emit('admin:error', 'Invalid token')
      }
    })

    // ── Admin: reply ──────────────────────────────────────────────
    socket.on('admin:reply', async ({ sessionId, message }) => {
      if (!socket.data.adminId || !sessionId || !message?.trim()) return
      const session = await ChatSession.findById(sessionId)
      if (!session) return

      const msg = await ChatMessage.create({
        session_id:  sessionId,
        sender:      'admin',
        message:     message.trim(),
        sender_name: socket.data.adminName || 'Royal Support',
      })

      session.last_message  = message.trim()
      session.last_activity = new Date()
      await session.save()

      const msgData = lean(msg)
      io.to(`session:${sessionId}`).emit('chat:message', msgData)
      io.to(ADMIN_ROOM).emit('admin:new_message', { sessionId, message: msgData, session: lean(session) })
    })

    // ── Admin: typing indicator ───────────────────────────────────
    socket.on('admin:typing', ({ sessionId, typing }) => {
      if (!socket.data.adminId) return
      io.to(`session:${sessionId}`).emit('chat:admin_typing', {
        typing,
        adminName: socket.data.adminName || 'Royal Support',
      })
    })

    // ── Admin: close session ──────────────────────────────────────
    socket.on('admin:close_session', async ({ sessionId }) => {
      if (!socket.data.adminId) return
      await ChatSession.findByIdAndUpdate(sessionId, { status: 'closed' })
      io.to(ADMIN_ROOM).emit('admin:session_closed', { sessionId })
      io.to(`session:${sessionId}`).emit('chat:session_closed')
    })

    // ── Admin: mark session as read ───────────────────────────────
    socket.on('admin:read_session', async ({ sessionId }) => {
      if (!socket.data.adminId) return
      await ChatSession.findByIdAndUpdate(sessionId, { unread_admin: 0 })
      io.to(ADMIN_ROOM).emit('admin:session_update', { sessionId, unread_admin: 0 })
    })
  })
}
