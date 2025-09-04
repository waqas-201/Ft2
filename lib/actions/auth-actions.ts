"use ser```typescript file=\"lib/actions/auth-actions.ts"
"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

interface LoginFormData {
  email: string
  password: string
}

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate input
  if (!email || !password) {
    return {
      error: "Please fill in all fields",
      success: false,
    }
  }

  // Mock authentication - in real app, verify against database
  const validCredentials = [
    { email: "admin@paintstore.pk", password: "admin123", role: "admin" },
    { email: "user@example.com", password: "password123", role: "user" },
  ]

  const user = validCredentials.find((u) => u.email === email && u.password === password)

  if (!user) {
    return {
      error: "Invalid email or password",
      success: false,
    }
  }

  // Set authentication cookie (in real app, use proper JWT/session management)
  cookies().set(
    "auth-token",
    JSON.stringify({
      email: user.email,
      role: user.role,
      name: user.email === "admin@paintstore.pk" ? "Admin User" : "John Doe",
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  )

  redirect("/account")
}

export async function signupAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const acceptTerms = formData.get("acceptTerms") === "on"

  // Validate input
  if (!name || !email || !password || !confirmPassword) {
    return {
      error: "Please fill in all fields",
      success: false,
    }
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match",
      success: false,
    }
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters long",
      success: false,
    }
  }

  if (!acceptTerms) {
    return {
      error: "Please accept the terms and conditions",
      success: false,
    }
  }

  // Check if user already exists (mock check)
  if (email === "admin@paintstore.pk" || email === "user@example.com") {
    return {
      error: "An account with this email already exists",
      success: false,
    }
  }

  // In real app, save user to database
  console.log("Creating user:", { name, email })

  // Set authentication cookie
  cookies().set(
    "auth-token",
    JSON.stringify({
      email,
      role: "user",
      name,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  )

  redirect("/account")
}

export async function logoutAction() {
  cookies().delete("auth-token")
  redirect("/")
}
