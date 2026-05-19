import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import api from '../../api/client'

const STATUSES = ['Order Placed','Package Picked Up','Processing at Origin Hub','Departed Origin Country','In Transit (International)','Arrived at Destination Country','Customs Clearance','At Delivery Hub','Out for Delivery','Delivered']
const STATUS_COLORS = ['badge-grey','badge-blue','badge-blue','badge-orange','badge-amber','badge-teal','badge-purple','badge-indigo','badge-green','badge-green']

function statusBadge(s, frozen) {
  if (frozen) return 'badge-red'
  return STATUS_COLORS[STATUSES.indexOf(s)] || 'badge-grey'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Command Centre" subtitle="Real-time overview of all operations">
      {loading ? (
        <div className="loading-state"><div className="spinner" /><span>Loading dashboard...</span></div>
      ) : stats && (
        <>
          <div className="admin-stats-grid">
            {[
              { icon: '📦', label: 'Total Shipments', value: stats.total, color: 'var(--gold-400)' },
              { icon: '✈️', label: 'In Transit', value: stats.inTransit, color: '#60a5fa' },
              { icon: '✅', label: 'Delivered', value: stats.delivered, color: '#4ade80' },
              { icon: '❄️', label: 'On Hold', value: stats.frozen, color: '#f87171' },
              { icon: '📬', label: 'Pending', value: stats.pending, color: '#fbbf24' },
              { icon: '👥', label: 'Customers', value: stats.totalUsers, color: '#c084fc' },
              { icon: '🚫', label: 'Frozen Users', value: stats.frozenUsers, color: '#f87171' },
              { icon: '📊', label: 'Success Rate', value: stats.total > 0 ? `${Math.round((stats.delivered/stats.total)*100)}%` : '—', color: 'var(--gold-400)' },
            ].map(stat => (
              <div key={stat.label} className="admin-stat-card">
                <div className="admin-stat-icon">{stat.icon}</div>
                <div className="admin-stat-value" style={{color: stat.color}}>{stat.value}</div>
                <div className="admin-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{display:'flex',gap:12,marginBottom:28,flexWrap:'wrap'}}>
            <Link to="/admin/shipments/new" className="btn btn-gold">+ New Shipment</Link>
            <Link to="/admin/shipments" className="btn btn-outline">Manage Shipments</Link>
            <Link to="/admin/users" className="btn btn-ghost">Manage Users</Link>
          </div>

          {/* Recent shipments */}
          <div className="table-wrapper">
            <div className="table-head">
              <span className="table-head-title">Recent Shipments</span>
              <Link to="/admin/shipments" className="btn btn-ghost btn-sm">View All →</Link>
            </div>
            {stats.recentShipments.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📭</div><h3 className="empty-title">No shipments yet</h3></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking Code</th>
                    <th>Sender</th>
                    <th>Route</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentShipments.map(s => (
                    <tr key={s.id}>
                      <td><span className="tc-cell">{s.tracking_code}</span></td>
                      <td style={{fontSize:13}}>{s.sender_name}</td>
                      <td style={{fontSize:13}}>{s.origin_country} → {s.destination_country}</td>
                      <td><span className="badge badge-gold" style={{fontSize:10}}>{s.service_type}</span></td>
                      <td><span className={`badge ${statusBadge(s.status, s.is_frozen)}`}>{s.is_frozen ? '❄️ On Hold' : s.status}</span></td>
                      <td>
                        <Link to={`/admin/shipments?id=${s.id}`} className="btn btn-ghost btn-sm">Manage</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}
