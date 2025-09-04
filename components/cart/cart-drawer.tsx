"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, X, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

export function CartDrawer() {
  const { state, updateQuantity, removeItem, getTotalItems, getTotalPrice, toggleCart, closeCart } = useCart()

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`

  return (
    <Sheet open={state.isOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="w-4 h-4" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart ({getTotalItems()})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">Add some paint products to get started</p>
              <Link href="/products">
                <Button onClick={closeCart}>
                  Browse Products
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.name}</h4>
                        <div className="text-xs text-muted-foreground mb-2">
                          {item.color} • {item.size}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="text-sm">
                            {item.originalPrice && item.discount ? (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-primary">{formatPrice(item.price)}</span>
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-primary">{formatPrice(item.price)}</span>
                            )}
                          </div>
                          <div className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Footer */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(getTotalPrice())}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Link href="/cart" className="block">
                    <Button variant="outline" className="w-full bg-transparent" onClick={closeCart}>
                      View Full Cart
                    </Button>
                  </Link>
                  <Link href="/checkout" className="block">
                    <Button className="w-full" onClick={closeCart}>
                      Checkout
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-muted-foreground text-center">Free delivery on orders over Rs. 5,000</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
