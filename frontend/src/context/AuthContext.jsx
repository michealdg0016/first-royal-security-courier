import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('frsc_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('frsc_token')
    if (token) {
      api.get('/auth/me').then(r => { setUser(r.data); localStorage.setItem('frsc_user', JSON.stringify(r.data)) })
        .catch(() => { localStorage.removeItem('frsc_token'); localStorage.removeItem('frsc_user'); setUser(null) })
        .finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('frsc_token', token)
    localStorage.setItem('frsc_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('frsc_token')
    localStorage.removeItem('frsc_user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
