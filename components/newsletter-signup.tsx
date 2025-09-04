"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { subscribeNewsletter } from "@/lib/actions/contact-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Subscribing..." : "Subscribe"}
    </Button>
  )
}

export function NewsletterSignup() {
  const [state, formAction] = useFormState(subscribeNewsletter, {
    error: null,
    success: false,
    message: null,
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
        <p className="text-sm text-muted-foreground">
          Subscribe to our newsletter for the latest paint trends and exclusive offers.
        </p>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <form action={formAction} className="flex gap-2">
        <Input name="email" type="email" placeholder="Enter your email" className="flex-1" required />
        <SubmitButton />
      </form>
    </div>
  )
}
