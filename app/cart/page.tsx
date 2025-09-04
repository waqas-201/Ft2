"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Plus, Minus, X, ArrowRight, ArrowLeft, Truck, Tag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart, getTotalItems, getTotalPrice } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`

  const subtotal = getTotalPrice()
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0
  const deliveryFee = subtotal >= 5000 ? 0 : 200
  const total = subtotal - promoDiscount + deliveryFee

  const handleApplyPromo = () => {
    // Mock promo codes
    const promoCodes: { [key: string]: number } = {
      SAVE10: 10,
      WELCOME15: 15,
      PAINT20: 20,
    }

    if (promoCodes[promoCode.toUpperCase()]) {
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        discount: promoCodes[promoCode.toUpperCase()],
      })
      setPromoCode("")
    }
  }

  const removePromo = () => {
    setAppliedPromo(null)
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingCart className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any paint products to your cart yet.
            </p>
            <Link href="/products">
              <Button size="lg">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          / <span className="text-foreground">Shopping Cart</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Shopping Cart ({getTotalItems()} items)</h1>
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                Clear Cart
              </Button>
            </div>

            <div className="space-y-4">
              {state.items.map((item) => (
                <Card key={`${item.id}-${item.color}-${item.size}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <div className="text-sm text-muted-foreground">
                              Color: {item.color} • Size: {item.size}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxQuantity}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <span className="text-sm text-muted-foreground">Max: {item.maxQuantity}</span>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-semibold text-primary">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            {item.originalPrice && item.discount && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(item.originalPrice * item.quantity)}
                                </span>
                                <Badge variant="destructive" className="text-xs">
                                  {item.discount}% OFF
                                </Badge>
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground">{formatPrice(item.price)} each</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/products">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Promo Code */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Promo Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleApplyPromo} disabled={!promoCode.trim()}>
                      Apply
                    </Button>
                  </div>
                  {appliedPromo && (
                    <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-700">
                        {appliedPromo.code} ({appliedPromo.discount}% off)
                      </span>
                      <Button variant="ghost" size="sm" onClick={removePromo}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Try: SAVE10, WELCOME15, PAINT20</p>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount ({appliedPromo.discount}%)</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Delivery
                    </span>
                    <span>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
                  </div>

                  {subtotal < 5000 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(5000 - subtotal)} more for free delivery
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>

                <Link href="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    <span>Estimated delivery: 2-3 business days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
