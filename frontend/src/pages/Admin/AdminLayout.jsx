import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { path: '/admin', label: 'Command Centre', icon: '📊' },
  { path: '/admin/shipments', label: 'Shipments', icon: '📦' },
  { path: '/admin/shipments/new', label: 'New Shipment', icon: '➕' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
]

export default function AdminLayout({ children, title, subtitle }) {
  const loc = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="admin-wrap">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-mark">👑</div>
          <div className="admin-logo-text">
            <div className="admin-logo-name">FRSC Admin</div>
            <div className="admin-logo-sub">Royal Control Panel</div>
          </div>
        </div>

        <ul className="admin-nav">
          {NAV.map(n => (
            <li key={n.path} className="admin-nav-item">
              <Link to={n.path}
                className={`admin-nav-link ${loc.pathname === n.path ? 'active' : ''}`}>
                <span className="admin-nav-icon">{n.icon}</span>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="admin-sidebar-footer">
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{width:32,height:32,background:'linear-gradient(135deg,var(--gold-500),var(--gold-600))',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,color:'var(--navy-800)',flexShrink:0}}>{user?.name?.[0]}</div>
            <div>
              <p style={{fontSize:13,fontWeight:600,color:'var(--text-primary)',lineHeight:1}}>{user?.name}</p>
              <p style={{fontSize:11,color:'var(--gold-400)',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:2}}>Super Admin</p>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Link to="/" className="btn btn-ghost btn-sm" style={{flex:1,justifyContent:'center',fontSize:12}}>🌐 Site</Link>
            <button className="btn btn-ghost btn-sm" style={{flex:1,fontSize:12}} onClick={() => { logout(); navigate('/') }}>Sign Out</button>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">{title}</h1>
            {subtitle && <p className="admin-page-sub">{subtitle}</p>}
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
