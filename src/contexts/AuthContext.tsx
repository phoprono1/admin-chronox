"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { account } from '@/lib/appwrite-client'
import { Models } from 'appwrite'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  loading: boolean
  checkAuth: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  checkAuth: () => {},
  logout: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const checkAuth = () => {
    account.get()
      .then((userData) => {
        setUser(userData)
      })
      .catch((error) => {
        setUser(null)
        console.error('Auth check failed:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const logout = () => {
    account.deleteSession('current')
      .then(() => {
        setUser(null)
        router.push('/login')
      })
      .catch((error) => {
        console.error('Logout failed:', error)
      })
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    loading,
    checkAuth,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}