"use server"

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContactForm(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  // Validate input
  if (!name || !email || !subject || !message) {
    return {
      error: "Please fill in all fields",
      success: false,
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      error: "Please enter a valid email address",
      success: false,
    }
  }

  try {
    // In real app, send email or save to database
    console.log("Contact form submission:", { name, email, subject, message })

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      error: null,
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    }
  } catch (error) {
    return {
      error: "Failed to send message. Please try again.",
      success: false,
    }
  }
}

export async function subscribeNewsletter(prevState: any, formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return {
      error: "Please enter your email address",
      success: false,
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      error: "Please enter a valid email address",
      success: false,
    }
  }

  try {
    // In real app, save to newsletter database
    console.log("Newsletter subscription:", { email })

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      error: null,
      success: true,
      message: "Successfully subscribed to our newsletter!",
    }
  } catch (error) {
    return {
      error: "Failed to subscribe. Please try again.",
      success: false,
    }
  }
}
