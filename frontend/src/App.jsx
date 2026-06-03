import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LiveLogs from './pages/LiveLogs'
import Alerts from './pages/Alerts'
import Devices from './pages/Devices'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import UserManagement from './pages/UserManagement'
import Anomalies from './pages/Anomalies'

/** Guard: redirect to /login if not authenticated */
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

/** Guard: Super Admin only routes */
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'Super Admin') return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="live-logs"   element={<LiveLogs />} />
        <Route path="alerts"      element={<Alerts />} />
        <Route path="anomalies"   element={<Anomalies />} />
        <Route path="devices"     element={<Devices />} />
        <Route path="analytics"   element={<Analytics />} />
        <Route path="reports"     element={<Reports />} />
        <Route path="settings"    element={<Settings />} />
        <Route path="users"       element={<AdminRoute><UserManagement /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#131E35',
              color: '#F1F5F9',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#131E35' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#131E35' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
