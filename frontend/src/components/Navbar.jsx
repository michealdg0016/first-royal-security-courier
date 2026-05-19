import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()

  const handleLogout = () => { logout(); navigate('/') }
  const isAdmin = user && ['superadmin', 'admin'].includes(user.role)

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-mark">👑</div>
          <div>
            <div className="navbar-logo-name">First Royal Security Co.</div>
            <div className="navbar-logo-tagline">Excellence · Security · Royalty</div>
          </div>
        </Link>

        <ul className="navbar-nav">
          <li><Link to="/" className={loc.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/track" className={loc.pathname.startsWith('/track') ? 'active' : ''}>Track</Link></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/#contact">Contact</a></li>
          {user && <li><Link to="/dashboard" className={loc.pathname === '/dashboard' ? 'active' : ''}>My Shipments</Link></li>}
          {isAdmin && <li><Link to="/admin" className={loc.pathname.startsWith('/admin') ? 'active' : ''}>Admin</Link></li>}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <>
              <div className="navbar-user">
                <div className="navbar-user-avatar">{user.name[0].toUpperCase()}</div>
                <span style={{fontSize:14,color:'var(--text-secondary)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-gold btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
