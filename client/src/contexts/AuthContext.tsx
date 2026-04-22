import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { User } from '../types'
import { queryClient } from '../lib/queryClient'

// Configure axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5004'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  impersonateUser: (user: User) => Promise<void>
  stopImpersonation: () => void
  loading: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        const userObj = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(userObj)
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        console.log('Auth: Token restored from localStorage');
      } catch (e) {
        console.error('Auth: Failed to parse stored user:', e);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token: newToken, user: newUser } = response.data
      
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      console.log('Auth: Login successful, token set');
      
      // Invalidate all queries to refetch with new user data
      queryClient.invalidateQueries()
    } catch (error: any) {
      console.error('Auth: Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post('/api/auth/register', data)
      const { token: newToken, user: newUser } = response.data
      
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      // Invalidate all queries to refetch with new user data
      queryClient.invalidateQueries()
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('originalToken');
    localStorage.removeItem('originalUser');
    delete axios.defaults.headers.common['Authorization']
    
    // Clear all queries on logout
    queryClient.clear()
  }

  const impersonateUser = async (impersonatedUser: User) => {
    try {
      // Store original user and token
      if (token && user) {
        localStorage.setItem('originalToken', token);
        localStorage.setItem('originalUser', JSON.stringify(user));
      }
      
      // Set impersonated user
      setUser(impersonatedUser);
      localStorage.setItem('user', JSON.stringify({...impersonatedUser, originalRole: user?.role || null}));
      
      // Update UI by invalidating queries
      queryClient.invalidateQueries();
      
      console.log('Auth: Impersonating user:', impersonatedUser.name);
    } catch (error) {
      console.error('Auth: Impersonation failed:', error);
      throw error;
    }
  };

  const stopImpersonation = () => {
    // Get original user and token
    const originalToken = localStorage.getItem('originalToken');
    const originalUserStr = localStorage.getItem('originalUser');
    
    if (originalToken && originalUserStr) {
      try {
        const originalUser = JSON.parse(originalUserStr);
        
        // Restore original user
        setToken(originalToken);
        setUser(originalUser);
        localStorage.setItem('token', originalToken);
        localStorage.setItem('user', JSON.stringify(originalUser));
        
        // Remove impersonation data
        localStorage.removeItem('originalToken');
        localStorage.removeItem('originalUser');
        
        // Update axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${originalToken}`;
        
        // Update UI by invalidating queries
        queryClient.invalidateQueries();
        
        console.log('Auth: Stopped impersonation, restored original user:', originalUser.name);
      } catch (error) {
        console.error('Auth: Failed to restore original user:', error);
        logout(); // Fallback to logout if restoration fails
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, impersonateUser, stopImpersonation, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

