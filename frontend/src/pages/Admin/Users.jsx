import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import api from '../../api/client'

function Toast({ toasts }) {
  return <div className="toast-wrap">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toasts, setToasts] = useState([])
  const [confirmUser, setConfirmUser] = useState(null)

  const toast = (msg, type = 'ok') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  const load = async () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    const { data } = await api.get('/admin/users', { params })
    setUsers(data.users)
    setLoading(false)
  }

  useEffect(() => { load() }, [search])

  const toggleFreeze = async (user) => {
    try {
      const { data } = await api.patch(`/admin/users/${user.id}/toggle-freeze`)
      setUsers(us => us.map(u => u.id === user.id ? data.user : u))
      toast(data.user.is_frozen ? `❄️ ${user.name} has been suspended` : `✓ ${user.name} has been reinstated`)
      setConfirmUser(null)
    } catch (err) {
      toast(err.response?.data?.error || 'Action failed', 'err')
    }
  }

  const admins = users.filter(u => u.role === 'superadmin' || u.role === 'admin')
  const customers = users.filter(u => u.role === 'customer')

  return (
    <AdminLayout title="User Management" subtitle={`${users.length} total accounts on the platform`}>
      <Toast toasts={toasts} />

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:28}}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-value">{customers.length}</div>
          <div className="admin-stat-label">Total Customers</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">❄️</div>
          <div className="admin-stat-value" style={{color:'#f87171'}}>{users.filter(u => u.is_frozen).length}</div>
          <div className="admin-stat-label">Suspended Accounts</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👑</div>
          <div className="admin-stat-value" style={{color:'var(--gold-400)'}}>{admins.length}</div>
          <div className="admin-stat-label">Admin Accounts</div>
        </div>
      </div>

      <div className="filters-bar">
        <input className="search-input" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <div className="table-head">
            <span className="table-head-title">All Users ({users.length})</span>
          </div>
          {users.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><h3 className="empty-title">No users found</h3></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:u.role==='superadmin'?'linear-gradient(135deg,#c9a227,#a8881f)':'linear-gradient(135deg,#1e3270,#162554)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,color:u.role==='superadmin'?'#050d1f':'#b8c4d0',flexShrink:0}}>
                          {u.name[0].toUpperCase()}
                        </div>
                        <span style={{fontWeight:500,color:'var(--text-primary)',fontSize:14}}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{fontSize:13}}>{u.email}</td>
                    <td style={{fontSize:13,color:'var(--text-muted)'}}>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.role === 'superadmin' ? 'badge-gold' : u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                        {u.role === 'superadmin' ? '👑 Super Admin' : u.role === 'admin' ? '🛡 Admin' : '👤 Customer'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_frozen ? 'badge-red' : 'badge-green'}`}>
                        {u.is_frozen ? '❄️ Suspended' : '✓ Active'}
                      </span>
                    </td>
                    <td style={{fontSize:12,color:'var(--text-muted)'}}>
                      {new Date(u.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td>
                      {u.role !== 'superadmin' ? (
                        <button
                          className={`btn btn-sm ${u.is_frozen ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => setConfirmUser(u)}
                        >
                          {u.is_frozen ? '🔥 Reinstate' : '❄️ Suspend'}
                        </button>
                      ) : (
                        <span style={{fontSize:12,color:'var(--text-muted)',fontStyle:'italic'}}>Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Confirm freeze/unfreeze modal */}
      {confirmUser && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmUser(null)}>
          <div className="modal">
            <h2 className="modal-title" style={{color: confirmUser.is_frozen ? 'var(--success)' : '#f87171'}}>
              {confirmUser.is_frozen ? '🔥 Reinstate User' : '❄️ Suspend User'}
            </h2>
            <p className="modal-sub">
              {confirmUser.is_frozen
                ? `Reinstating ${confirmUser.name} will restore their access to the platform.`
                : `Suspending ${confirmUser.name} will immediately block their access. All their in-progress actions will halt.`
              }
            </p>
            <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'14px 16px',marginBottom:4}}>
              <p style={{fontSize:14,color:'var(--text-primary)',fontWeight:600}}>{confirmUser.name}</p>
              <p style={{fontSize:13,color:'var(--text-muted)'}}>{confirmUser.email}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmUser(null)}>Cancel</button>
              <button
                className={`btn ${confirmUser.is_frozen ? 'btn-success' : 'btn-danger'}`}
                onClick={() => toggleFreeze(confirmUser)}
              >
                {confirmUser.is_frozen ? '🔥 Confirm Reinstate' : '❄️ Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
