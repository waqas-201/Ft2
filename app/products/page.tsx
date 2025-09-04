"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Filter, Grid, List } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: {
    id: string
    name: string
    slug: string
  }
  variants: Array<{
    id: string
    name: string
    price: number
    stock: number
    colors: Array<{
      id: string
      name: string
      hexCode: string
      images: Array<{
        url: string
        alt: string
      }>
    }>
  }>
  tags: string
  discount?: number
  featured: boolean
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        console.log("[v0] Starting to fetch products and categories")

        // Fetch products with error handling
        let productsData = { products: [] }
        try {
          console.log("[v0] Fetching products from /api/products")
          const productsResponse = await fetch("/api/products?limit=50")
          console.log("[v0] Products response status:", productsResponse.status)

          if (!productsResponse.ok) {
            throw new Error(`Products API returned ${productsResponse.status}`)
          }

          const responseText = await productsResponse.text()
          console.log("[v0] Products response text preview:", responseText.substring(0, 100))

          try {
            productsData = JSON.parse(responseText)
          } catch (parseError) {
            console.error("[v0] Failed to parse products JSON:", parseError)
            console.error("[v0] Response text:", responseText)
            // Use fallback mock data
            productsData = { products: [] }
          }
        } catch (error) {
          console.error("[v0] Error fetching products:", error)
          productsData = { products: [] }
        }

        // Fetch categories with error handling
        let categoriesData = []
        try {
          console.log("[v0] Fetching categories from /api/categories")
          const categoriesResponse = await fetch("/api/categories")
          console.log("[v0] Categories response status:", categoriesResponse.status)

          if (!categoriesResponse.ok) {
            throw new Error(`Categories API returned ${categoriesResponse.status}`)
          }

          const responseText = await categoriesResponse.text()
          console.log("[v0] Categories response text preview:", responseText.substring(0, 100))

          try {
            categoriesData = JSON.parse(responseText)
          } catch (parseError) {
            console.error("[v0] Failed to parse categories JSON:", parseError)
            console.error("[v0] Response text:", responseText)
            // Use fallback mock data
            categoriesData = []
          }
        } catch (error) {
          console.error("[v0] Error fetching categories:", error)
          categoriesData = []
        }

        console.log("[v0] Setting products:", productsData.products?.length || 0)
        console.log("[v0] Setting categories:", categoriesData?.length || 0)

        setProducts(productsData.products || [])
        setCategories(categoriesData || [])

        // Set max price range based on actual product prices
        const maxPrice = Math.max(
          ...(productsData.products || []).map((p: Product) => Math.max(...p.variants.map((v) => v.price))),
        )
        setPriceRange([0, Math.ceil(maxPrice / 1000) * 1000])
      } catch (error) {
        console.error("[v0] Error in fetchData:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category.slug === selectedCategory)
    }

    // Filter by price range (using minimum variant price)
    filtered = filtered.filter((product) => {
      const minPrice = Math.min(...product.variants.map((v) => v.price))
      return minPrice >= priceRange[0] && minPrice <= priceRange[1]
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          const aMinPrice = Math.min(...a.variants.map((v) => v.price))
          const bMinPrice = Math.min(...b.variants.map((v) => v.price))
          return aMinPrice - bMinPrice
        case "price-high":
          const aMaxPrice = Math.max(...a.variants.map((v) => v.price))
          const bMaxPrice = Math.max(...b.variants.map((v) => v.price))
          return bMaxPrice - aMaxPrice
        case "featured":
          return Number(b.featured) - Number(a.featured)
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedBrands, priceRange, sortBy])

  const getProductPrice = (product: Product) => {
    const prices = product.variants.map((v) => v.price)
    return Math.min(...prices)
  }

  const getProductOriginalPrice = (product: Product) => {
    if (!product.discount) return null
    const minPrice = getProductPrice(product)
    return Math.round(minPrice / (1 - product.discount / 100))
  }

  const getProductImage = (product: Product) => {
    const firstVariant = product.variants[0]
    const firstColor = firstVariant?.colors[0]
    const firstImage = firstColor?.images[0]
    return firstImage?.url || "/placeholder.svg"
  }

  const getProductStock = (product: Product) => {
    return product.variants.reduce((total, variant) => total + variant.stock, 0)
  }

  const getProductFeatures = (product: Product) => {
    return product.tags ? product.tags.split(",").map((tag) => tag.trim()) : []
  }

  const allCategories = [
    { id: "all", name: "All Products", count: products.length },
    ...categories.map((cat) => ({
      id: cat.slug,
      name: cat.name,
      count: cat._count.products,
    })),
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading products...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Filters</h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  {allCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-primary"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                      <span className="text-xs text-muted-foreground">({category.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={priceRange[1]}
                    min={0}
                    step={100}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Rs. {priceRange[0]}</span>
                    <span>Rs. {priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {selectedCategory === "all"
                    ? "All Products"
                    : allCategories.find((c) => c.id === selectedCategory)?.name}
                </h1>
                <p className="text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="featured">Featured First</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredProducts.map((product) => {
                const price = getProductPrice(product)
                const originalPrice = getProductOriginalPrice(product)
                const image = getProductImage(product)
                const stock = getProductStock(product)
                const features = getProductFeatures(product)
                const inStock = stock > 0

                return (
                  <Card
                    key={product.id}
                    className={`hover:shadow-lg transition-shadow ${!inStock ? "opacity-75" : ""}`}
                  >
                    {viewMode === "grid" ? (
                      <>
                        <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {product.discount && (
                            <Badge className="absolute top-2 left-2" variant="destructive">
                              {product.discount}% OFF
                            </Badge>
                          )}
                          {product.featured && (
                            <Badge className="absolute top-2 right-2" variant="secondary">
                              Featured
                            </Badge>
                          )}
                          {!inStock && (
                            <Badge className="absolute bottom-2 right-2" variant="secondary">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                          <div className="text-sm text-muted-foreground">{product.category.name}</div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {features.slice(0, 2).map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-lg font-semibold text-primary">Rs. {price.toLocaleString()}</div>
                              {originalPrice && (
                                <div className="text-sm text-muted-foreground line-through">
                                  Rs. {originalPrice.toLocaleString()}
                                </div>
                              )}
                            </div>
                            <Link href={`/products/${product.slug}`}>
                              <Button size="sm" disabled={!inStock}>
                                {inStock ? "View Details" : "Out of Stock"}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      <div className="flex gap-4 p-4">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {product.discount && (
                            <Badge className="absolute top-1 left-1 text-xs" variant="destructive">
                              {product.discount}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-primary">Rs. {price.toLocaleString()}</div>
                              {originalPrice && (
                                <div className="text-sm text-muted-foreground line-through">
                                  Rs. {originalPrice.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {product.category.name}
                            </Badge>
                            {product.featured && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-wrap gap-1">
                              {features.map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            <Link href={`/products/${product.slug}`}>
                              <Button size="sm" disabled={!inStock}>
                                {inStock ? "View Details" : "Out of Stock"}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                <Button
                  onClick={() => {
                    setSelectedCategory("all")
                    setSelectedBrands([])
                    setPriceRange([0, 10000])
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
