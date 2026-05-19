import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      if (['superadmin', 'admin'].includes(data.user.role)) navigate('/admin')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">👑</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your Royal account</p>
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" placeholder="Your password"
              value={form.password} onChange={handle} required />
          </div>
          <button type="submit" className="btn btn-gold btn-full" disabled={loading} style={{marginTop:8}}>
            {loading ? 'Signing In...' : 'Sign In to My Account'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/signup">Create one free</Link>
        </div>

        <div className="divider" />
        <div style={{background:'rgba(201,162,39,0.06)',border:'1px solid rgba(201,162,39,0.15)',borderRadius:8,padding:14}}>
          <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>Demo Credentials</p>
          <p style={{fontSize:13,color:'var(--text-secondary)'}}>👑 <strong style={{color:'var(--gold-400)'}}>Super Admin:</strong> admin@firstroyalsecurity.com / Royal@Admin2024!</p>
          <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:4}}>👤 <strong>Customer:</strong> james@example.com / Customer123!</p>
        </div>
      </div>
    </div>
  )
}
