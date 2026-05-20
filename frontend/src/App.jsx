import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Track from './pages/Track'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/Admin/index'
import AdminShipments from './pages/Admin/Shipments'
import AdminUsers from './pages/Admin/Users'
import AdminChat from './pages/Admin/Chat'
import CreateShipment from './pages/Admin/CreateShipment'
import LiveChat from './components/LiveChat'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-state"><div className="loading-spinner"/><span>Loading...</span></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !['superadmin', 'admin'].includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  const isAdmin = user && ['superadmin', 'admin'].includes(user.role)

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:code" element={<Track />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/shipments" element={<ProtectedRoute adminOnly><AdminShipments /></ProtectedRoute>} />
        <Route path="/admin/shipments/new" element={<ProtectedRoute adminOnly><CreateShipment /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/chat" element={<ProtectedRoute adminOnly><AdminChat /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Live Chat widget — show on non-admin pages for everyone */}
      {!isAdmin && <LiveChat />}
    </>
  )
}
