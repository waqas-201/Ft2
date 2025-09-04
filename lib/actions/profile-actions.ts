"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface ProfileUpdateData {
  name: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
}

export async function updateProfileAction(prevState: any, formData: FormData) {
  // Check authentication
  const authCookie = cookies().get("auth-token")
  if (!authCookie) {
    redirect("/login")
  }

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const street = formData.get("street") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const zipCode = formData.get("zipCode") as string

  // Validate input
  if (!name) {
    return {
      error: "Name is required",
      success: false,
    }
  }

  try {
    // Parse current user data
    const currentUser = JSON.parse(authCookie.value)

    // Update user data (in real app, update database)
    const updatedUser = {
      ...currentUser,
      name,
      phone,
      address: {
        street,
        city,
        state,
        zipCode,
        country: "Pakistan",
      },
    }

    // Update cookie with new data
    cookies().set("auth-token", JSON.stringify(updatedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("Profile updated:", updatedUser)

    return {
      error: null,
      success: true,
      message: "Profile updated successfully!",
    }
  } catch (error) {
    return {
      error: "Failed to update profile. Please try again.",
      success: false,
    }
  }
}
