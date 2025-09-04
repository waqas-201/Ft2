"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Heart, Share2, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/lib/cart-context"

// Mock product data - in real app this would come from API
const mockProduct = {
  id: "1",
  name: "Premium Interior Emulsion",
  description:
    "High-quality water-based paint perfect for interior walls with excellent coverage and durability. This premium emulsion paint provides a smooth, even finish that's perfect for living rooms, bedrooms, and other interior spaces.",
  longDescription:
    "Our Premium Interior Emulsion is specially formulated for the Pakistani climate, offering superior coverage and long-lasting beauty. The advanced formula ensures easy application, quick drying, and excellent washability. Perfect for both new construction and renovation projects.",
  price: 2500,
  originalPrice: 2941,
  discount: 15,
  rating: 4.5,
  reviewCount: 128,
  category: "Interior Paints",
  brand: "Asian Paints",
  sku: "AP-PIE-001",
  inStock: true,
  stockCount: 45,
  colors: [
    { name: "Pure White", code: "#FFFFFF", available: true },
    { name: "Cream", code: "#F5F5DC", available: true },
    { name: "Light Blue", code: "#ADD8E6", available: true },
    { name: "Beige", code: "#F5F5DC", available: false },
  ],
  sizes: [
    { size: "1 Liter", price: 2500, inStock: true },
    { size: "4 Liters", price: 9500, inStock: true },
    { size: "20 Liters", price: 45000, inStock: false },
  ],
  images: [
    "/interior-paint-can-white.jpg",
    "/paint-color-swatches.jpg",
    "/painted-wall-interior.jpg",
    "/paint-application-brush.jpg",
  ],
  features: [
    "Washable finish",
    "Low VOC formula",
    "Quick drying (2-4 hours)",
    "Excellent coverage",
    "Smooth application",
    "Fade resistant",
  ],
  specifications: {
    Coverage: "120-140 sq ft per liter",
    "Drying Time": "2-4 hours (surface dry)",
    "Recoat Time": "4-6 hours",
    Finish: "Matt/Silk",
    Base: "Water-based",
    "VOC Content": "< 50 g/L",
  },
  reviews: [
    {
      id: 1,
      name: "Ahmed Khan",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent quality paint. Easy to apply and great coverage. Highly recommended!",
    },
    {
      id: 2,
      name: "Fatima Ali",
      rating: 4,
      date: "2024-01-10",
      comment: "Good paint but takes a bit longer to dry in humid weather. Overall satisfied.",
    },
    {
      id: 3,
      name: "Muhammad Hassan",
      rating: 5,
      date: "2024-01-05",
      comment: "Perfect for my living room. The finish is smooth and looks professional.",
    },
  ],
}

export default function ProductDetailPage() {
  const params = useParams()
  const { addItem, openCart } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0])
  const [selectedSize, setSelectedSize] = useState(mockProduct.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= mockProduct.stockCount) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: mockProduct.id,
      name: mockProduct.name,
      price: selectedSize.price,
      originalPrice: mockProduct.originalPrice,
      discount: mockProduct.discount,
      image: mockProduct.images[0],
      color: selectedColor.name,
      size: selectedSize.size,
      maxQuantity: mockProduct.stockCount,
      quantity,
    }

    addItem(cartItem)
    openCart()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <span>Home</span> / <span>Products</span> / <span>{mockProduct.category}</span> /
          <span className="text-foreground"> {mockProduct.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
              <img
                src={mockProduct.images[selectedImage] || "/placeholder.svg"}
                alt={mockProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${mockProduct.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">
                {mockProduct.brand}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{mockProduct.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(mockProduct.rating) ? "fill-teal-400 text-teal-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm">{mockProduct.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({mockProduct.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-primary">Rs. {selectedSize.price.toLocaleString()}</span>
                {mockProduct.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    Rs. {mockProduct.originalPrice.toLocaleString()}
                  </span>
                )}
                {mockProduct.discount && <Badge variant="destructive">{mockProduct.discount}% OFF</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                SKU: {mockProduct.sku} | {mockProduct.stockCount} in stock
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Color: {selectedColor.name}</h3>
              <div className="flex gap-2">
                {mockProduct.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => color.available && setSelectedColor(color)}
                    disabled={!color.available}
                    className={`w-12 h-12 rounded-full border-2 ${
                      selectedColor.name === color.name ? "border-primary border-4" : "border-gray-300"
                    } ${!color.available ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{ backgroundColor: color.code }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Size</h3>
              <Select
                value={selectedSize.size}
                onValueChange={(value) => {
                  const size = mockProduct.sizes.find((s) => s.size === value)
                  if (size) setSelectedSize(size)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockProduct.sizes.map((size) => (
                    <SelectItem key={size.size} value={size.size} disabled={!size.inStock}>
                      {size.size} - Rs. {size.price.toLocaleString()}
                      {!size.inStock && " (Out of Stock)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= mockProduct.stockCount}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">{mockProduct.stockCount} available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button onClick={handleAddToCart} className="flex-1" disabled={!selectedSize.inStock}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" onClick={() => setIsWishlisted(!isWishlisted)}>
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Key Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {mockProduct.features.map((feature) => (
                  <div key={feature} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-sm">Free delivery on orders over Rs. 5,000</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">1 year warranty included</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-primary" />
                <span className="text-sm">30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({mockProduct.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{mockProduct.longDescription}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(mockProduct.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{key}:</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockProduct.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.name}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-teal-400 text-teal-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
