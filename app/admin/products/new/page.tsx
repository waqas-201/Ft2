"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
}

interface Variant {
  name: string
  sku: string
  price: number
  stock: number
  colors: Color[]
}

interface Color {
  name: string
  hexCode: string
  images: Image[]
}

interface Image {
  url: string
  alt: string
}

export default function NewProductPage() {
  const router = useRouter()
  const { state: authState } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    tags: "",
    discount: 0,
    featured: false,
  })

  const [variants, setVariants] = useState<Variant[]>([
    {
      name: "1 Liter",
      sku: "",
      price: 0,
      stock: 0,
      colors: [
        {
          name: "White",
          hexCode: "#FFFFFF",
          images: [{ url: "", alt: "" }],
        },
      ],
    },
  ])

  // Check admin access
  // useEffect(() => {
  //   if (!authState.user || authState.user.email !== "admin@paintstore.pk") {
  //     router.push("/login")
  //     return
  //   }
  // }, [authState.user, router])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim()
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.name])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = "Product name is required"
    if (!formData.slug) newErrors.slug = "Product slug is required"
    if (!formData.description) newErrors.description = "Description is required"
    if (!formData.categoryId) newErrors.categoryId = "Category is required"

    variants.forEach((variant, vIndex) => {
      if (!variant.name) newErrors[`variant_${vIndex}_name`] = "Variant name is required"
      if (!variant.sku) newErrors[`variant_${vIndex}_sku`] = "SKU is required"
      if (variant.price <= 0) newErrors[`variant_${vIndex}_price`] = "Price must be greater than 0"
      if (variant.stock < 0) newErrors[`variant_${vIndex}_stock`] = "Stock cannot be negative"

      variant.colors.forEach((color, cIndex) => {
        if (!color.name) newErrors[`variant_${vIndex}_color_${cIndex}_name`] = "Color name is required"
        if (!color.hexCode) newErrors[`variant_${vIndex}_color_${cIndex}_hex`] = "Color code is required"
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variants,
        }),
      })

      if (response.ok) {
        router.push("/admin")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create product")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Error creating product")
    } finally {
      setLoading(false)
    }
  }

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: "",
        sku: "",
        price: 0,
        stock: 0,
        colors: [{ name: "White", hexCode: "#FFFFFF", images: [{ url: "", alt: "" }] }],
      },
    ])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const addColor = (variantIndex: number) => {
    const updated = [...variants]
    updated[variantIndex].colors.push({
      name: "",
      hexCode: "#FFFFFF",
      images: [{ url: "", alt: "" }],
    })
    setVariants(updated)
  }

  const updateColor = (variantIndex: number, colorIndex: number, field: string, value: any) => {
    const updated = [...variants]
    updated[variantIndex].colors[colorIndex] = {
      ...updated[variantIndex].colors[colorIndex],
      [field]: value,
    }
    setVariants(updated)
  }

  if (!authState.user || authState.user.email !== "admin@paintstore.pk") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Add New Product</h1>
              <p className="text-muted-foreground">Create a new product for your store</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className={errors.slug ? "border-destructive" : ""}
                    />
                    {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="interior,premium,washable"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Variants</CardTitle>
                  <Button type="button" onClick={addVariant} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {variants.map((variant, vIndex) => (
                  <div key={vIndex} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant {vIndex + 1}</h4>
                      {variants.length > 1 && (
                        <Button type="button" onClick={() => removeVariant(vIndex)} variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Variant Name *</Label>
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(vIndex, "name", e.target.value)}
                          placeholder="1 Liter"
                          className={errors[`variant_${vIndex}_name`] ? "border-destructive" : ""}
                        />
                        {errors[`variant_${vIndex}_name`] && (
                          <p className="text-sm text-destructive">{errors[`variant_${vIndex}_name`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>SKU *</Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(vIndex, "sku", e.target.value)}
                          placeholder="PSE-1L"
                          className={errors[`variant_${vIndex}_sku`] ? "border-destructive" : ""}
                        />
                        {errors[`variant_${vIndex}_sku`] && (
                          <p className="text-sm text-destructive">{errors[`variant_${vIndex}_sku`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Price (Rs.) *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.price}
                          onChange={(e) => updateVariant(vIndex, "price", Number(e.target.value))}
                          className={errors[`variant_${vIndex}_price`] ? "border-destructive" : ""}
                        />
                        {errors[`variant_${vIndex}_price`] && (
                          <p className="text-sm text-destructive">{errors[`variant_${vIndex}_price`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Stock *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) => updateVariant(vIndex, "stock", Number(e.target.value))}
                          className={errors[`variant_${vIndex}_stock`] ? "border-destructive" : ""}
                        />
                        {errors[`variant_${vIndex}_stock`] && (
                          <p className="text-sm text-destructive">{errors[`variant_${vIndex}_stock`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Colors</Label>
                        <Button type="button" onClick={() => addColor(vIndex)} variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Color
                        </Button>
                      </div>

                      {variant.colors.map((color, cIndex) => (
                        <div key={cIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted/30 rounded">
                          <div className="space-y-2">
                            <Label>Color Name *</Label>
                            <Input
                              value={color.name}
                              onChange={(e) => updateColor(vIndex, cIndex, "name", e.target.value)}
                              placeholder="Pure White"
                              className={errors[`variant_${vIndex}_color_${cIndex}_name`] ? "border-destructive" : ""}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Hex Code *</Label>
                            <div className="flex gap-2">
                              <Input
                                value={color.hexCode}
                                onChange={(e) => updateColor(vIndex, cIndex, "hexCode", e.target.value)}
                                placeholder="#FFFFFF"
                                className={errors[`variant_${vIndex}_color_${cIndex}_hex`] ? "border-destructive" : ""}
                              />
                              <div className="w-10 h-10 rounded border" style={{ backgroundColor: color.hexCode }} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                              value={color.images[0]?.url || ""}
                              onChange={(e) => {
                                const updatedImages = [...color.images]
                                updatedImages[0] = {
                                  url: e.target.value,
                                  alt: `${formData.name} - ${color.name}`,
                                }
                                updateColor(vIndex, cIndex, "images", updatedImages)
                              }}
                              placeholder="/placeholder.svg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/admin">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
