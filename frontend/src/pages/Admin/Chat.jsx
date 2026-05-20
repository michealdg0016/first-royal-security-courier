import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import AdminLayout from './AdminLayout'
import { useAuth } from '../../context/AuthContext'

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const today = now.toDateString() === date.toDateString()
  if (today) return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' +
    date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function timeAgo(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

export default function AdminChat() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState({})   // { sessionId: [msgs] }
  const [reply, setReply] = useState('')
  const [userTyping, setUserTyping] = useState({}) // { sessionId: bool }
  const [connected, setConnected] = useState(false)
  const [filter, setFilter] = useState('open')

  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('frsc_token')
    if (!token) return

    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('admin:init', { token })
    })

    socket.on('disconnect', () => setConnected(false))

    // Receive all open sessions on init
    socket.on('admin:sessions', (list) => {
      setSessions(list)
    })

    // New session started by a user
    socket.on('admin:new_session', (session) => {
      setSessions(prev => {
        const exists = prev.find(s => s.id === session.id)
        if (exists) return prev
        return [session, ...prev]
      })
    })

    // New message in any session
    socket.on('admin:new_message', ({ sessionId, message, session }) => {
      setMessages(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), message],
      }))
      // Update session in list
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, ...session } : s
      ))
    })

    // Session update (e.g. unread cleared)
    socket.on('admin:session_update', ({ sessionId, ...updates }) => {
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, ...updates } : s
      ))
    })

    // Session closed
    socket.on('admin:session_closed', ({ sessionId }) => {
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, status: 'closed' } : s
      ))
    })

    // User typing
    socket.on('admin:user_typing', ({ sessionId, typing }) => {
      setUserTyping(prev => ({ ...prev, [sessionId]: typing }))
    })

    return () => socket.disconnect()
  }, [user])

  // Load messages when opening a session
  const openSession = useCallback((session) => {
    setActiveId(session.id)
    setReply('')

    // Mark as read
    socketRef.current?.emit('admin:read_session', { sessionId: session.id })
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, unread_admin: 0 } : s))

    // Fetch messages from REST if not already loaded
    if (!messages[session.id]) {
      fetch(`/api/chat/admin/sessions/${session.id}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('frsc_token')}` },
      })
        .then(r => r.json())
        .then(data => {
          setMessages(prev => ({ ...prev, [session.id]: data.messages || [] }))
        })
    }
  }, [messages])

  // Scroll to bottom when messages change for active session
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeId, userTyping])

  const sendReply = useCallback(() => {
    const trimmed = reply.trim()
    if (!trimmed || !activeId || !socketRef.current) return
    socketRef.current.emit('admin:reply', { sessionId: activeId, message: trimmed })
    setReply('')
    socketRef.current.emit('admin:typing', { sessionId: activeId, typing: false })
    clearTimeout(typingTimer.current)
  }, [reply, activeId])

  const handleReplyChange = (e) => {
    setReply(e.target.value)
    if (!activeId || !socketRef.current) return
    socketRef.current.emit('admin:typing', { sessionId: activeId, typing: true })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('admin:typing', { sessionId: activeId, typing: false })
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendReply()
    }
  }

  const closeSession = (sessionId) => {
    socketRef.current?.emit('admin:close_session', { sessionId })
  }

  const displayedSessions = sessions.filter(s =>
    filter === 'all' ? true : s.status === filter
  )

  const activeSession = sessions.find(s => s.id === activeId)
  const activeMsgs = (messages[activeId] || [])
  const totalUnread = sessions.reduce((sum, s) => sum + (s.unread_admin || 0), 0)

  return (
    <AdminLayout
      title={`Live Chat ${totalUnread > 0 ? `(${totalUnread})` : ''}`}
      subtitle="Respond to customer messages in real-time"
    >
      <div className="admin-chat-wrap">
        {/* Session list */}
        <div className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div className={`admin-chat-conn-dot ${connected ? 'online' : 'offline'}`} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['open', 'closed', 'all'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`admin-chat-filter-btn ${filter === f ? 'active' : ''}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-chat-session-list">
            {displayedSessions.length === 0 && (
              <div className="admin-chat-empty">
                <div style={{ fontSize: 28, opacity: 0.4, marginBottom: 8 }}>💬</div>
                <p>No {filter} chats</p>
              </div>
            )}
            {displayedSessions.map(s => (
              <div
                key={s.id}
                className={`admin-chat-session-item ${activeId === s.id ? 'active' : ''} ${s.unread_admin > 0 ? 'has-unread' : ''}`}
                onClick={() => openSession(s)}
              >
                <div className="admin-chat-session-avatar">
                  {(s.user_name || 'G')[0].toUpperCase()}
                </div>
                <div className="admin-chat-session-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                    <span className="admin-chat-session-name">{s.user_name || 'Guest'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {timeAgo(s.last_activity)}
                    </span>
                  </div>
                  {s.tracking_code && (
                    <span style={{ fontSize: 11, color: 'var(--gold-400)', fontFamily: 'monospace' }}>
                      📦 {s.tracking_code}
                    </span>
                  )}
                  <p className="admin-chat-session-preview">
                    {userTyping[s.id] ? <em style={{ color: 'var(--gold-400)' }}>typing...</em> : (s.last_message || 'No messages yet')}
                  </p>
                </div>
                {s.unread_admin > 0 && (
                  <span className="admin-chat-unread-badge">{s.unread_admin}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conversation panel */}
        <div className="admin-chat-main">
          {!activeSession ? (
            <div className="admin-chat-placeholder">
              <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }}>💬</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-secondary)', marginBottom: 8 }}>
                Select a conversation
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Choose a chat session from the left to respond.
              </p>
              {totalUnread > 0 && (
                <p style={{ marginTop: 12, color: 'var(--gold-400)', fontSize: 13 }}>
                  {totalUnread} unread message{totalUnread > 1 ? 's' : ''} waiting
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Conv header */}
              <div className="admin-chat-conv-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="admin-chat-conv-avatar">
                    {(activeSession.user_name || 'G')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--cream)', fontSize: 15 }}>
                      {activeSession.user_name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {activeSession.user_email || 'Guest user'}
                      {activeSession.tracking_code && (
                        <span style={{ color: 'var(--gold-400)', marginLeft: 8, fontFamily: 'monospace' }}>
                          · 📦 {activeSession.tracking_code}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`badge ${activeSession.status === 'open' ? 'badge-green' : 'badge-grey'}`}>
                    {activeSession.status}
                  </span>
                  {activeSession.status === 'open' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => closeSession(activeSession.id)}
                      style={{ fontSize: 12 }}
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="admin-chat-messages">
                {activeMsgs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 14 }}>
                    No messages yet — waiting for customer.
                  </div>
                )}
                {activeMsgs.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={`admin-chat-msg ${msg.sender === 'admin' ? 'msg-admin' : 'msg-user'}`}
                  >
                    {msg.sender === 'user' && (
                      <div className="admin-chat-msg-label">{msg.sender_name || activeSession.user_name}</div>
                    )}
                    <div className="admin-chat-bubble">{msg.message}</div>
                    <div className="admin-chat-msg-time">{formatTime(msg.created_at)}</div>
                  </div>
                ))}
                {userTyping[activeId] && (
                  <div className="admin-chat-msg msg-user">
                    <div className="admin-chat-msg-label">{activeSession.user_name} is typing</div>
                    <div className="admin-chat-bubble live-chat-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Reply input */}
              {activeSession.status === 'open' ? (
                <div className="admin-chat-reply-row">
                  <textarea
                    className="admin-chat-reply-input"
                    value={reply}
                    onChange={handleReplyChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your reply... (Enter to send)"
                    rows={2}
                  />
                  <button
                    className="btn btn-gold"
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    style={{ padding: '10px 20px', fontSize: 14, flexShrink: 0 }}
                  >
                    Send ➤
                  </button>
                </div>
              ) : (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, borderTop: '1px solid var(--border-light)' }}>
                  This session is closed.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
