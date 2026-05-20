import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false) }
  const isAdmin = user && ['superadmin', 'admin'].includes(user.role)
  const close = () => setMenuOpen(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [loc.pathname])

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" onClick={close}>
            <div className="navbar-logo-mark">👑</div>
            <div>
              <div className="navbar-logo-name">First Royal Security Co.</div>
              <div className="navbar-logo-tagline">Excellence · Security · Royalty</div>
            </div>
          </Link>

          <ul className="navbar-nav">
            <li><Link to="/" className={loc.pathname === '/' ? 'active' : ''}>Home</Link></li>
            <li><Link to="/track" className={loc.pathname.startsWith('/track') ? 'active' : ''}>Track</Link></li>
            <li><Link to="/services" className={loc.pathname === '/services' ? 'active' : ''}>Services</Link></li>
            <li><Link to="/about" className={loc.pathname === '/about' ? 'active' : ''}>About</Link></li>
            <li><Link to="/contact" className={loc.pathname === '/contact' ? 'active' : ''}>Contact</Link></li>
            {user && <li><Link to="/dashboard" className={loc.pathname === '/dashboard' ? 'active' : ''}>My Shipments</Link></li>}
            {isAdmin && <li><Link to="/admin" className={loc.pathname.startsWith('/admin') ? 'active' : ''}>Admin</Link></li>}
          </ul>

          <div className="navbar-actions">
            {user ? (
              <div className="navbar-user nav-desktop">
                <div className="navbar-user-avatar">{user.name[0].toUpperCase()}</div>
                <span className="navbar-user-name">{user.name}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign Out</button>
              </div>
            ) : (
              <div className="nav-desktop" style={{display:'flex',gap:10}}>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/signup" className="btn btn-gold btn-sm">Get Started</Link>
              </div>
            )}

            <button
              className={`hamburger ${menuOpen ? 'is-open' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && <div className="mobile-menu-overlay" onClick={close} />}

      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <ul className="mobile-nav-list">
          <li><Link to="/" onClick={close}>Home</Link></li>
          <li><Link to="/track" onClick={close}>Track Shipment</Link></li>
          <li><Link to="/services" onClick={close}>Services</Link></li>
          <li><Link to="/about" onClick={close}>About</Link></li>
          <li><Link to="/contact" onClick={close}>Contact</Link></li>
          {user && <li><Link to="/dashboard" onClick={close}>My Shipments</Link></li>}
          {isAdmin && <li><Link to="/admin" onClick={close}>Admin Panel</Link></li>}
        </ul>

        <div className="mobile-menu-footer">
          {user ? (
            <>
              <div className="mobile-user-info">
                <div className="navbar-user-avatar">{user.name[0].toUpperCase()}</div>
                <span>{user.name}</span>
              </div>
              <button className="btn btn-ghost btn-full" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <Link to="/login" className="btn btn-ghost btn-full" onClick={close}>Sign In</Link>
              <Link to="/signup" className="btn btn-gold btn-full" onClick={close}>Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
