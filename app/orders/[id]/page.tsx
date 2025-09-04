"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react"
import { useOrders, type Order } from "@/lib/order-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const statusConfig = {
  pending: { color: "bg-teal-100 text-teal-800", icon: Clock, label: "Pending" },
  confirmed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "Confirmed" },
  processing: { color: "bg-purple-100 text-purple-800", icon: Package, label: "Processing" },
  shipped: { color: "bg-indigo-100 text-indigo-800", icon: Truck, label: "Shipped" },
  delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "bg-red-100 text-red-800", icon: X, label: "Cancelled" },
  returned: { color: "bg-gray-100 text-gray-800", icon: ArrowLeft, label: "Returned" },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getOrder, cancelOrder } = useOrders()
  const [order, setOrder] = useState<Order | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    const orderId = params.id as string
    const foundOrder = getOrder(orderId)

    if (foundOrder) {
      setOrder(foundOrder)
    } else {
      router.push("/account?tab=orders")
    }
  }, [params.id, getOrder, router])

  const handleCancelOrder = () => {
    if (order) {
      cancelOrder(order.id)
      setOrder({ ...order, status: "cancelled" })
      setShowCancelConfirm(false)
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`
  const StatusIcon = statusConfig[order.status].icon
  const canCancel = ["pending", "confirmed"].includes(order.status)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/account?tab=orders" className="hover:text-foreground">
            Orders
          </Link>{" "}
          / <span className="text-foreground">Order {order.id}</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/account?tab=orders">
                <Button variant="outline" size="sm" className="mb-4 bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Order {order.id}</h1>
              <p className="text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <Badge className={`${statusConfig[order.status].color} mb-2`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusConfig[order.status].label}
              </Badge>
              <div className="text-2xl font-bold text-primary">{formatPrice(order.total)}</div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {["confirmed", "processing", "shipped", "delivered"].map((status, index) => {
                  const isActive = ["confirmed", "processing", "shipped", "delivered"].indexOf(order.status) >= index
                  const isCurrent = order.status === status
                  const StatusIcon = statusConfig[status as keyof typeof statusConfig].icon

                  return (
                    <div key={status} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      >
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="ml-2 text-sm">
                        <div className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {statusConfig[status as keyof typeof statusConfig].label}
                        </div>
                      </div>
                      {index < 3 && (
                        <div
                          className={`w-16 h-0.5 ml-4 ${
                            ["confirmed", "processing", "shipped", "delivered"].indexOf(order.status) > index
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {order.trackingNumber && (
                <Alert className="mt-4">
                  <Truck className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tracking Number:</strong> {order.trackingNumber}
                    <br />
                    You can track your package using this number on our delivery partner's website.
                  </AlertDescription>
                </Alert>
              )}

              {order.status === "cancelled" && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>This order has been cancelled.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Items Ordered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.color} • {item.size}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.promoDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>{order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">
                      {order.shipping.firstName} {order.shipping.lastName}
                    </p>
                    <p>{order.shipping.address}</p>
                    <p>
                      {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
                    </p>
                    <p>{order.shipping.country}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{order.shipping.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{order.shipping.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {order.payment.method === "cod" && (
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    )}
                    {order.payment.method === "card" && (
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-muted-foreground">Card ending in {order.payment.cardNumber?.slice(-4)}</p>
                      </div>
                    )}
                    {order.payment.method === "bank" && (
                      <div>
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-muted-foreground">Direct bank account transfer</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Order Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>Order ID: {order.id}</span>
                    </div>
                    {order.estimatedDelivery && (
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <span>Estimated Delivery: {order.estimatedDelivery}</span>
                      </div>
                    )}
                    {order.shipping.notes && (
                      <div>
                        <p className="font-medium">Delivery Notes:</p>
                        <p className="text-muted-foreground">{order.shipping.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {canCancel && !showCancelConfirm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={() => setShowCancelConfirm(true)} className="w-full">
                      Cancel Order
                    </Button>
                  </CardContent>
                </Card>
              )}

              {showCancelConfirm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">Cancel Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Are you sure you want to cancel this order? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={handleCancelOrder} className="flex-1">
                        Yes, Cancel Order
                      </Button>
                      <Button variant="outline" onClick={() => setShowCancelConfirm(false)} className="flex-1">
                        Keep Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
