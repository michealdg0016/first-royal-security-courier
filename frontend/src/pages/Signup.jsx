import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', { name: form.name, email: form.email, phone: form.phone, password: form.password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
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
          <h1 className="auth-title">Join the Royal Network</h1>
          <p className="auth-subtitle">Create your account — free forever for personal use</p>
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" type="text" className="form-input" placeholder="Your full name"
              value={form.name} onChange={handle} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone (Optional)</label>
              <input name="phone" type="tel" className="form-input" placeholder="+1 555 000 0000"
                value={form.phone} onChange={handle} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" placeholder="Min. 6 characters"
                value={form.password} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input name="confirm" type="password" className="form-input" placeholder="Repeat password"
                value={form.confirm} onChange={handle} required />
            </div>
          </div>
          <button type="submit" className="btn btn-gold btn-full" disabled={loading} style={{marginTop:8}}>
            {loading ? 'Creating Account...' : 'Create My Royal Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>

        <p style={{textAlign:'center',fontSize:12,color:'var(--text-muted)',marginTop:16}}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
