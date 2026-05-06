import { createContext, useContext, useState, useCallback } from 'react'
import API from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ls_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('ls_token'))

  const login = useCallback(async (username, password) => {
    const res = await API.post('/auth/login', { username, password })
    localStorage.setItem('ls_token', res.data.access_token)
    localStorage.setItem('ls_user', JSON.stringify(res.data.user))
    setToken(res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ls_token')
    localStorage.removeItem('ls_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
