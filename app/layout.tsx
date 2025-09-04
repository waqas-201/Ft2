import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { OrderProvider } from "@/lib/order-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "PaintStore Pakistan - Premium Paints & Painting Solutions",
  description:
    "Shop premium quality paints, primers, and painting accessories in Pakistan. Interior, exterior, and specialty paints with fast delivery.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
          <OrderProvider>
            <CartProvider>
              <Suspense fallback={null}>{children}</Suspense>
            </CartProvider>
          </OrderProvider>
        <Analytics />
      </body>
    </html>
  )
}
