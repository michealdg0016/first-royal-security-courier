import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

const STATUSES = ['Order Placed','Package Picked Up','Processing at Origin Hub','Departed Origin Country','In Transit (International)','Arrived at Destination Country','Customs Clearance','At Delivery Hub','Out for Delivery','Delivered']
const STATUS_COLORS = ['badge-grey','badge-blue','badge-blue','badge-orange','badge-amber','badge-teal','badge-purple','badge-indigo','badge-green','badge-green']

function statusBadge(status, isFrozen) {
  if (isFrozen) return 'badge-red'
  return STATUS_COLORS[STATUSES.indexOf(status)] || 'badge-grey'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/shipments/my').then(r => setShipments(r.data.shipments)).finally(() => setLoading(false))
  }, [])

  const delivered = shipments.filter(s => s.status_index === 9).length
  const inTransit = shipments.filter(s => s.status_index > 0 && s.status_index < 9 && !s.is_frozen).length
  const onHold = shipments.filter(s => s.is_frozen).length

  return (
    <div>
      <Navbar />
      <div className="dashboard-page">
        <div className="container">
          <div className="dash-header">
            <h1 className="dash-title">Welcome back, {user?.name?.split(' ')[0]} 👑</h1>
            <p className="dash-subtitle">Track and manage all your shipments from your Royal dashboard.</p>
          </div>

          <div className="dash-stats">
            <div className="dash-stat">
              <div className="dash-stat-icon">📦</div>
              <div className="dash-stat-value">{shipments.length}</div>
              <div className="dash-stat-label">Total Shipments</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-icon">✅</div>
              <div className="dash-stat-value">{delivered}</div>
              <div className="dash-stat-label">Delivered</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-icon">✈️</div>
              <div className="dash-stat-value">{inTransit}</div>
              <div className="dash-stat-label">In Transit</div>
            </div>
          </div>

          {onHold > 0 && (
            <div className="frozen-bar">
              ❄️ You have {onHold} shipment{onHold > 1 ? 's' : ''} currently on hold. Contact support: +1-800-ROYAL-01
            </div>
          )}

          <div className="table-wrapper">
            <div className="table-head">
              <span className="table-head-title">My Shipments</span>
              <Link to="/track" className="btn btn-outline btn-sm">🔍 Quick Track</Link>
            </div>

            {loading ? (
              <div className="loading-state"><div className="spinner" /><span>Loading your shipments...</span></div>
            ) : shipments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3 className="empty-title">No shipments yet</h3>
                <p style={{fontSize:14,marginBottom:20}}>Your shipments will appear here once registered by our team.</p>
              </div>
            ) : (
              <div className="table-scroll"><table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking Code</th>
                    <th>Destination</th>
                    <th>Recipient</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Est. Delivery</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(s => (
                    <tr key={s.id}>
                      <td><span className="tc-cell">{s.tracking_code}</span></td>
                      <td>
                        <span style={{fontSize:12,color:'var(--text-muted)'}}>From: {s.origin_country}</span><br/>
                        <strong>{s.destination_country}</strong>
                      </td>
                      <td>{s.recipient_name}</td>
                      <td><span className="badge badge-gold">{s.service_type}</span></td>
                      <td>
                        <span className={`badge ${statusBadge(s.status, s.is_frozen)}`}>
                          {s.is_frozen ? '❄️ On Hold' : s.status}
                        </span>
                      </td>
                      <td style={{fontSize:13}}>
                        {s.estimated_delivery
                          ? new Date(s.estimated_delivery).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
                          : '—'}
                      </td>
                      <td>
                        <Link to={`/track/${s.tracking_code}`} className="btn btn-ghost btn-sm">Track →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>

          <div style={{marginTop:32,background:'rgba(201,162,39,0.05)',border:'1px solid rgba(201,162,39,0.15)',borderRadius:12,padding:24,display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
            <div style={{fontSize:36}}>📞</div>
            <div style={{flex:1}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",color:'var(--cream)',marginBottom:4}}>Need to ship something new?</h3>
              <p style={{color:'var(--text-muted)',fontSize:14}}>Contact our Royal team to register a new shipment or get a quote.</p>
            </div>
            <a href="mailto:support@firstroyalsecurity.com" className="btn btn-gold">Get in Touch</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
