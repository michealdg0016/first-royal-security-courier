import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LiveChat from '../components/LiveChat'
import api from '../api/client'

const STATUSES = [
  'Order Placed','Package Picked Up','Processing at Origin Hub','Departed Origin Country',
  'In Transit (International)','Arrived at Destination Country','Customs Clearance',
  'At Delivery Hub','Out for Delivery','Delivered'
]

const STATUS_ICONS = ['📋','📦','🏭','✈️','🌍','🛬','🏛️','🏪','🚚','✅']
const STATUS_COLORS = ['badge-grey','badge-blue','badge-blue','badge-orange','badge-amber','badge-teal','badge-purple','badge-indigo','badge-green','badge-green']

function getStatusBadge(status, isFrozen) {
  if (isFrozen) return 'badge-red'
  const i = STATUSES.indexOf(status)
  return STATUS_COLORS[i] || 'badge-grey'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Track() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState(code || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatReason, setChatReason] = useState(null)

  useEffect(() => {
    if (code) search(code)
  }, [code])

  const search = async (tc) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.get(`/shipments/track/${tc.trim().toUpperCase()}`)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Tracking lookup failed. Please check your code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    navigate(`/track/${input.trim().toUpperCase()}`)
    search(input.trim())
  }

  const currentIdx = result ? STATUSES.indexOf(result.shipment.status) : -1

  return (
    <div>
      <Navbar />
      {/* Inline chat for tracking page - triggered by frozen/support actions */}
      {chatOpen && (
        <LiveChat
          autoOpenReason={chatReason}
          trackingCode={result?.shipment?.tracking_code || null}
        />
      )}
      <div className="track-page">
        <div className="container">

          {/* Search Box */}
          <div className="track-search-box">
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              <span style={{fontSize:32}}>📦</span>
              <div>
                <h2 className="track-search-title">Track Your Shipment</h2>
                <p className="track-search-sub">Enter your First Royal Security Company tracking code</p>
              </div>
            </div>
            <form className="track-input-row" onSubmit={handleSearch}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g. FRSC-A1B2-C3D4-E5F6"
                style={{textTransform:'uppercase',letterSpacing:'1px'}}
              />
              <button type="submit" className="btn btn-gold" disabled={loading}>
                {loading ? '...' : '🔍 Track'}
              </button>
            </form>
            <p style={{fontSize:12,color:'var(--text-muted)',marginTop:10}}>
              Try: <span style={{color:'var(--gold-400)',cursor:'pointer',fontFamily:'monospace'}} onClick={() => { setInput('FRSC-A1B2-C3D4-E5F6'); search('FRSC-A1B2-C3D4-E5F6') }}>FRSC-A1B2-C3D4-E5F6</span>
              {' · '}
              <span style={{color:'var(--gold-400)',cursor:'pointer',fontFamily:'monospace'}} onClick={() => { setInput('FRSC-P3Q4-R5S6-T7U8'); search('FRSC-P3Q4-R5S6-T7U8') }}>FRSC-P3Q4-R5S6-T7U8</span>
            </p>
          </div>

          {/* Loading */}
          {loading && <div className="loading-state"><div className="spinner" /><span>Locating your shipment...</span></div>}

          {/* Error */}
          {error && (
            <div style={{maxWidth:640,margin:'0 auto'}}>
              <div className="error-msg" style={{padding:20,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                <strong>Shipment Not Found</strong>
                <p style={{marginTop:6,fontSize:13}}>{error}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="track-result">
              {/* Header card */}
              <div className="track-header-card">
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                  <div>
                    <p className="track-code">👑 {result.shipment.tracking_code}</p>
                    <p className="track-status-main">{result.shipment.is_frozen ? '❄️ Shipment On Hold' : result.shipment.status}</p>
                    {result.shipment.is_frozen && (
                      <div className="track-frozen-tag">
                        ❄️ This shipment has been placed on hold. Contact support for details.
                        <button
                          className="track-frozen-chat-btn"
                          onClick={() => {
                            setChatReason(`Your shipment ${result.shipment.tracking_code} is on hold. How can we help?`)
                            setChatOpen(true)
                          }}
                        >
                          💬 Chat with Support
                        </button>
                      </div>
                    )}
                    <span className={`badge ${getStatusBadge(result.shipment.status, result.shipment.is_frozen)}`}>
                      {STATUS_ICONS[currentIdx] || '📦'} {result.shipment.is_frozen ? 'On Hold' : result.shipment.status}
                    </span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <p style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4}}>Service</p>
                    <p style={{fontWeight:600,color:'var(--gold-400)'}}>{result.shipment.service_type}</p>
                  </div>
                </div>

                <div className="track-meta">
                  <div>
                    <p className="track-meta-label">📍 From</p>
                    <p className="track-meta-value">{result.shipment.origin_country}</p>
                  </div>
                  <div>
                    <p className="track-meta-label">🎯 To</p>
                    <p className="track-meta-value">{result.shipment.destination_country}</p>
                  </div>
                  <div>
                    <p className="track-meta-label">📅 Est. Delivery</p>
                    <p className="track-meta-value">
                      {result.shipment.estimated_delivery
                        ? new Date(result.shipment.estimated_delivery).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="track-meta-label">📦 Description</p>
                    <p className="track-meta-value">{result.shipment.package_description}</p>
                  </div>
                  <div>
                    <p className="track-meta-label">⚖ Weight</p>
                    <p className="track-meta-value">{result.shipment.weight} kg</p>
                  </div>
                  <div>
                    <p className="track-meta-label">👤 Recipient</p>
                    <p className="track-meta-value">{result.shipment.recipient_name}</p>
                  </div>
                </div>
              </div>

              {/* Visual progress bar */}
              <div className="track-progress-bar">
                <p className="track-progress-title">Shipment Progress</p>
                <div className="progress-steps-wrap"><div className="progress-steps">
                  {STATUSES.map((s, i) => (
                    <div key={s} className="progress-step">
                      {i < STATUSES.length - 1 && (
                        <div className={`progress-line ${i < currentIdx ? 'filled' : ''}`} />
                      )}
                      <div className={`progress-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}>
                        {i < currentIdx ? '✓' : i === currentIdx ? STATUS_ICONS[i] : ''}
                      </div>
                      <p className="progress-label">{s}</p>
                    </div>
                  ))}
                </div></div>
              </div>

              {/* Timeline */}
              <div className="timeline-card">
                <h3 className="timeline-card-title">📋 Tracking History</h3>
                <div className="timeline-list">
                  {[...result.history].reverse().map((h, i) => {
                    const isFirst = i === 0
                    const isFrozenEvent = h.status === 'On Hold'
                    return (
                      <div key={h.id} className={`tl-item ${isFirst ? 'tl-active' : 'tl-done'}`}>
                        <div className="tl-track">
                          <div className="tl-dot" style={isFrozenEvent ? {background:'rgba(239,68,68,0.2)',borderColor:'#ef4444'} : {}}>
                            {isFrozenEvent ? '❄️' : isFirst ? STATUS_ICONS[STATUSES.indexOf(h.status)] || '📍' : '✓'}
                          </div>
                          {i < result.history.length - 1 && <div className="tl-line" />}
                        </div>
                        <div className="tl-body">
                          <p className="tl-status" style={isFrozenEvent ? {color:'#f87171'} : {}}>{h.status}</p>
                          {h.note && <p className="tl-note">{h.note}</p>}
                          {h.location && <p className="tl-loc">📍 {h.location}</p>}
                          <p className="tl-time">{formatDate(h.created_at)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Contact support */}
              <div style={{textAlign:'center',marginTop:24,padding:24,background:'rgba(201,162,39,0.05)',border:'1px solid rgba(201,162,39,0.15)',borderRadius:12}}>
                <p style={{color:'var(--text-secondary)',fontSize:15,marginBottom:12}}>
                  Need help with this shipment? Our Royal Support team is standing by.
                </p>
                <p style={{color:'var(--gold-400)',fontWeight:600,fontSize:16,marginBottom:16}}>📞 +1-800-ROYAL-01 &nbsp;·&nbsp; 📧 support@firstroyalsecurity.com</p>
                <button
                  className="btn btn-gold"
                  onClick={() => {
                    setChatReason(`I need help with shipment ${result.shipment.tracking_code}`)
                    setChatOpen(true)
                  }}
                >
                  💬 Chat with Support
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && !error && (
            <div className="empty-state" style={{marginTop:32}}>
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">Enter a tracking code to begin</h3>
              <p style={{fontSize:14}}>Your tracking code is on your booking confirmation email.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
