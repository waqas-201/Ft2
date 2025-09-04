"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Truck, CreditCard, MapPin, ArrowLeft, ArrowRight, ShoppingCart, CheckCircle, AlertCircle } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  notes?: string
}

interface PaymentInfo {
  method: "cod" | "card" | "bank"
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardName?: string
  bankAccount?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state: cartState, getTotalItems, getTotalPrice, clearCart } = useCart()
  const { state: authState } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Pakistan",
    notes: "",
  })

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: "cod",
  })

  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  // Calculate totals
  const subtotal = getTotalPrice()
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0
  const deliveryFee = subtotal >= 5000 ? 0 : 200
  const total = subtotal - promoDiscount + deliveryFee

  // Redirect if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0) {
      router.push("/cart")
    }
  }, [cartState.items, router])

  // Pre-fill user info if logged in
  useEffect(() => {
    if (authState.user) {
      setShippingInfo((prev) => ({
        ...prev,
        firstName: authState.user?.name.split(" ")[0] || "",
        lastName: authState.user?.name.split(" ").slice(1).join(" ") || "",
        email: authState.user?.email || "",
        phone: authState.user?.phone || "",
        address: authState.user?.address?.street || "",
        city: authState.user?.address?.city || "",
        state: authState.user?.address?.state || "",
        zipCode: authState.user?.address?.zipCode || "",
        country: authState.user?.address?.country || "Pakistan",
      }))
    }
  }, [authState.user])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      // Validate shipping info
      if (!shippingInfo.firstName) newErrors.firstName = "First name is required"
      if (!shippingInfo.lastName) newErrors.lastName = "Last name is required"
      if (!shippingInfo.email) newErrors.email = "Email is required"
      if (!shippingInfo.phone) newErrors.phone = "Phone number is required"
      if (!shippingInfo.address) newErrors.address = "Address is required"
      if (!shippingInfo.city) newErrors.city = "City is required"
      if (!shippingInfo.state) newErrors.state = "State is required"
      if (!shippingInfo.zipCode) newErrors.zipCode = "ZIP code is required"
    }

    if (step === 2) {
      // Validate payment info
      if (paymentInfo.method === "card") {
        if (!paymentInfo.cardNumber) newErrors.cardNumber = "Card number is required"
        if (!paymentInfo.expiryDate) newErrors.expiryDate = "Expiry date is required"
        if (!paymentInfo.cvv) newErrors.cvv = "CVV is required"
        if (!paymentInfo.cardName) newErrors.cardName = "Cardholder name is required"
      }
      if (paymentInfo.method === "bank") {
        if (!paymentInfo.bankAccount) newErrors.bankAccount = "Bank account is required"
      }
    }

    if (step === 3) {
      // Validate final step
      if (!agreeToTerms) newErrors.terms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleApplyPromo = () => {
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

  const handlePlaceOrder = async () => {
    if (!validateStep(3)) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartState.items,
          shipping: shippingInfo,
          payment: paymentInfo,
          subtotal,
          promoDiscount,
          deliveryFee,
          total,
          notes: shippingInfo.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to place order")
      }

      const order = await response.json()

      // Clear cart
      clearCart()

      // Redirect to success page
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (error) {
      console.error("Error placing order:", error)
      alert(error instanceof Error ? error.message : "Failed to place order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartState.items.length === 0) {
    return null
  }

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <span>Home</span> / <span>Cart</span> / <span className="text-foreground">Checkout</span>
        </nav>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: "Shipping", icon: Truck },
              { step: 2, title: "Payment", icon: CreditCard },
              { step: 3, title: "Review", icon: CheckCircle },
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {title}
                </span>
                {step < 3 && <div className={`w-16 h-0.5 ml-4 ${currentStep > step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                        className={errors.firstName ? "border-destructive" : ""}
                      />
                      {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                        className={errors.lastName ? "border-destructive" : ""}
                      />
                      {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        placeholder="+92-XXX-XXXXXXX"
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      placeholder="123 Main Street"
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        placeholder="Karachi"
                        className={errors.city ? "border-destructive" : ""}
                      />
                      {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Select
                        value={shippingInfo.state}
                        onValueChange={(value) => setShippingInfo({ ...shippingInfo, state: value })}
                      >
                        <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sindh">Sindh</SelectItem>
                          <SelectItem value="Punjab">Punjab</SelectItem>
                          <SelectItem value="KPK">Khyber Pakhtunkhwa</SelectItem>
                          <SelectItem value="Balochistan">Balochistan</SelectItem>
                          <SelectItem value="Gilgit-Baltistan">Gilgit-Baltistan</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                        placeholder="75500"
                        className={errors.zipCode ? "border-destructive" : ""}
                      />
                      {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={shippingInfo.notes}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      placeholder="Any special delivery instructions..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={paymentInfo.method}
                    onValueChange={(value) => setPaymentInfo({ ...paymentInfo, method: value as any })}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">Pay when your order arrives</div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-muted-foreground">Visa, Mastercard, etc.</div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex-1 cursor-pointer">
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-sm text-muted-foreground">Direct bank account transfer</div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Card Payment Form */}
                  {paymentInfo.method === "card" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name *</Label>
                        <Input
                          id="cardName"
                          value={paymentInfo.cardName || ""}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                          placeholder="John Doe"
                          className={errors.cardName ? "border-destructive" : ""}
                        />
                        {errors.cardName && <p className="text-sm text-destructive">{errors.cardName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          value={paymentInfo.cardNumber || ""}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                          placeholder="1234 5678 9012 3456"
                          className={errors.cardNumber ? "border-destructive" : ""}
                        />
                        {errors.cardNumber && <p className="text-sm text-destructive">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            value={paymentInfo.expiryDate || ""}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                            placeholder="MM/YY"
                            className={errors.expiryDate ? "border-destructive" : ""}
                          />
                          {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            value={paymentInfo.cvv || ""}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                            placeholder="123"
                            className={errors.cvv ? "border-destructive" : ""}
                          />
                          {errors.cvv && <p className="text-sm text-destructive">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Form */}
                  {paymentInfo.method === "bank" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You will receive bank transfer details after placing your order.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Review Your Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Shipping Details */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Shipping Address
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {shippingInfo.firstName} {shippingInfo.lastName}
                        </p>
                        <p>{shippingInfo.address}</p>
                        <p>
                          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                        </p>
                        <p>{shippingInfo.phone}</p>
                        <p>{shippingInfo.email}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Method
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {paymentInfo.method === "cod" && "Cash on Delivery"}
                        {paymentInfo.method === "card" &&
                          `Credit/Debit Card ending in ${paymentInfo.cardNumber?.slice(-4)}`}
                        {paymentInfo.method === "bank" && "Bank Transfer"}
                      </div>
                    </div>

                    <Separator />

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={setAgreeToTerms}
                        className={errors.terms ? "border-destructive" : ""}
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        I agree to the{" "}
                        <a href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                        . I understand that my order will be processed according to these terms.
                      </Label>
                    </div>
                    {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={currentStep === 1 ? () => router.push("/cart") : handlePrevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? "Back to Cart" : "Previous"}
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handlePlaceOrder} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : `Place Order (${formatPrice(total)})`}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartState.items.map((item) => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.color} • {item.size} • Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Promo Code */}
                {currentStep === 1 && (
                  <div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleApplyPromo} disabled={!promoCode.trim()}>
                        Apply
                      </Button>
                    </div>
                    {appliedPromo && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                        {appliedPromo.code} applied ({appliedPromo.discount}% off)
                      </div>
                    )}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedPromo.discount}%)</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
                  </div>

                  {subtotal < 5000 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(5000 - subtotal)} more for free delivery
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>

                <div className="text-xs text-muted-foreground text-center">Estimated delivery: 2-3 business days</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
