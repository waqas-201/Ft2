"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "LOAD_USER"; payload: User | null }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true }

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
      }

    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }

    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }

    case "LOAD_USER":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: !!action.payload,
      }

    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("paintstore-user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        dispatch({ type: "LOAD_USER", payload: user })
      } catch (error) {
        console.error("Failed to load user from localStorage:", error)
        dispatch({ type: "LOAD_USER", payload: null })
      }
    } else {
      dispatch({ type: "LOAD_USER", payload: null })
    }
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("paintstore-user", JSON.stringify(state.user))
    } else {
      localStorage.removeItem("paintstore-user")
    }
  }, [state.user])

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - in real app, this would call your backend
    const mockUsers = [
      {
        id: "1",
        email: "admin@paintstore.pk",
        password: "admin123",
        name: "Admin User",
        phone: "+92-300-1234567",
        address: {
          street: "123 Paint Street",
          city: "Karachi",
          state: "Sindh",
          zipCode: "75500",
          country: "Pakistan",
        },
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        email: "user@example.com",
        password: "password123",
        name: "John Doe",
        phone: "+92-321-9876543",
        createdAt: "2024-01-15T00:00:00Z",
      },
    ]

    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      dispatch({ type: "LOGIN_SUCCESS", payload: userWithoutPassword })
      return true
    } else {
      dispatch({ type: "LOGIN_FAILURE" })
      return false
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock signup - in real app, this would call your backend
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date().toISOString(),
    }

    dispatch({ type: "LOGIN_SUCCESS", payload: newUser })
    return true
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: userData })
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
