import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

// Generate or retrieve a persistent session ID for this browser
function getOrCreateSessionId() {
  let id = localStorage.getItem('frsc_chat_session')
  if (!id) {
    id = 'cs-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)
    localStorage.setItem('frsc_chat_session', id)
  }
  return id
}

function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function LiveChat({ autoOpenReason = null, trackingCode = null }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [adminTyping, setAdminTyping] = useState(false)
  const [sessionClosed, setSessionClosed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [sessionReady, setSessionReady] = useState(false)

  const socketRef  = useRef(null)
  const bottomRef  = useRef(null)
  const typingTimer= useRef(null)
  const sessionId  = useRef(getOrCreateSessionId())

  // Auto-open if a reason is passed (e.g. frozen package)
  useEffect(() => {
    if (autoOpenReason) {
      setOpen(true)
    }
  }, [autoOpenReason])

  // Count unread when closed
  useEffect(() => {
    if (!open) {
      const adminMsgs = messages.filter(m => m.sender === 'admin')
      setUnreadCount(prev => {
        // Reset to 0 when panel is open; increment when closed and new admin msg arrives
        return prev
      })
    } else {
      setUnreadCount(0)
    }
  }, [open])

  // Connect socket
  useEffect(() => {
    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('chat:init', {
        sessionId:    sessionId.current,
        userName:     user ? user.name : 'Guest',
        userEmail:    user ? user.email : null,
        userId:       user ? user.id : null,
        trackingCode: trackingCode || null,
      })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('chat:session', ({ messages: msgs }) => {
      setMessages(msgs || [])
      setSessionReady(true)
    })

    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg])
      if (msg.sender === 'admin' && !open) {
        setUnreadCount(c => c + 1)
      }
    })

    socket.on('chat:admin_typing', ({ typing }) => {
      setAdminTyping(typing)
    })

    socket.on('chat:session_closed', () => {
      setSessionClosed(true)
    })

    return () => socket.disconnect()
  }, [user, trackingCode]) // eslint-disable-line

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, adminTyping])

  const sendMessage = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || !socketRef.current || sessionClosed) return

    socketRef.current.emit('chat:send', {
      sessionId: sessionId.current,
      message:   trimmed,
      userName:  user ? user.name : 'Guest',
    })
    setInput('')

    // Stop typing
    socketRef.current.emit('chat:typing', { sessionId: sessionId.current, typing: false })
    clearTimeout(typingTimer.current)
  }, [input, user, sessionClosed])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (!socketRef.current) return
    socketRef.current.emit('chat:typing', { sessionId: sessionId.current, typing: true })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('chat:typing', { sessionId: sessionId.current, typing: false })
    }, 2000)
  }

  const handleOpen = () => {
    setOpen(true)
    setUnreadCount(0)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button className="live-chat-fab" onClick={handleOpen} aria-label="Open live chat">
          <span className="live-chat-fab-icon">💬</span>
          <span className="live-chat-fab-label">Live Chat</span>
          {unreadCount > 0 && (
            <span className="live-chat-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="live-chat-panel">
          {/* Header */}
          <div className="live-chat-header">
            <div className="live-chat-header-left">
              <div className="live-chat-avatar">👑</div>
              <div>
                <p className="live-chat-title">Royal Support</p>
                <p className="live-chat-status">
                  <span className={`live-chat-dot ${connected ? 'online' : 'offline'}`} />
                  {connected ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>
            <button className="live-chat-close" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>

          {/* Auto-open reason banner */}
          {autoOpenReason && (
            <div className="live-chat-reason-banner">
              ❄️ {autoOpenReason}
            </div>
          )}

          {/* Messages */}
          <div className="live-chat-messages">
            {!sessionReady && (
              <div className="live-chat-connecting">
                <div className="live-chat-spinner" />
                <span>Connecting to support...</span>
              </div>
            )}

            {sessionReady && messages.length === 0 && (
              <div className="live-chat-welcome">
                <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Welcome to Royal Support</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Send a message and our team will respond shortly.
                </p>
                {trackingCode && (
                  <p style={{ fontSize: 12, marginTop: 8, color: 'var(--gold-400)', fontFamily: 'monospace' }}>
                    Re: {trackingCode}
                  </p>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`live-chat-msg ${msg.sender === 'user' ? 'msg-user' : 'msg-admin'}`}
              >
                {msg.sender === 'admin' && (
                  <div className="live-chat-msg-name">{msg.sender_name || 'Royal Support'}</div>
                )}
                <div className="live-chat-bubble">{msg.message}</div>
                <div className="live-chat-msg-time">{formatTime(msg.created_at)}</div>
              </div>
            ))}

            {adminTyping && (
              <div className="live-chat-msg msg-admin">
                <div className="live-chat-msg-name">Royal Support</div>
                <div className="live-chat-bubble live-chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {sessionClosed && (
              <div className="live-chat-closed-notice">
                Session closed by support. <button onClick={() => {
                  setSessionClosed(false)
                  localStorage.removeItem('frsc_chat_session')
                  sessionId.current = getOrCreateSessionId()
                  socketRef.current?.emit('chat:init', {
                    sessionId: sessionId.current,
                    userName: user ? user.name : 'Guest',
                    userEmail: user ? user.email : null,
                    userId: user ? user.id : null,
                    trackingCode: trackingCode || null,
                  })
                  setMessages([])
                }}>Start new chat</button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!sessionClosed && (
            <div className="live-chat-input-row">
              <textarea
                className="live-chat-input"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                disabled={!connected}
              />
              <button
                className="live-chat-send"
                onClick={sendMessage}
                disabled={!input.trim() || !connected}
                aria-label="Send message"
              >
                ➤
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
