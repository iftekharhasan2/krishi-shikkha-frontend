import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// In production, set VITE_API_BASE_URL to your backend URL e.g. https://api.krishividya.com
// In development, this is empty and the Vite dev proxy handles /api/* → localhost:5000
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchMe()
    } else {
      setLoading(false)
    }

    // Auto-logout on 401 (expired/invalid token)
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          const url = err.config?.url || ''
          // Don't intercept login/register itself
          if (!url.includes('/api/auth/login') && !url.includes('/api/auth/register')) {
            localStorage.removeItem('token')
            delete axios.defaults.headers.common['Authorization']
            setUser(null)
          }
        }
        return Promise.reject(err)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [])

  const fetchMe = async () => {
    try {
      const { data } = await axios.get('/api/auth/me')
      setUser(data)
    } catch {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const refreshUser = async () => { await fetchMe() }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
