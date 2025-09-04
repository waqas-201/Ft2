"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ShoppingCart, Users, TrendingUp, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  category: { name: string }
  variants: Array<{
    price: number
    stock: number
  }>
  featured: boolean
  createdAt: string
}

interface Order {
  id: string
  customerName: string
  total: number
  status: string
  createdAt: string
  phone: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { state: authState } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  })

  // Check admin access
  useEffect(() => {
    if (!authState.user || authState.user.email !== "admin@paintstore.pk") {
      router.push("/login")
      return
    }
  }, [authState.user, router])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch products
        const productsRes = await fetch("/api/products?limit=10")
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])

        // Fetch orders
        const ordersRes = await fetch("/api/orders?limit=10")
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || [])

        // Calculate stats
        const totalProducts = productsData.pagination?.total || 0
        const totalOrders = ordersData.pagination?.total || 0
        const pendingOrders =
          ordersData.orders?.filter((order: Order) => ["pending", "confirmed"].includes(order.status)).length || 0
        const totalRevenue = ordersData.orders?.reduce((sum: number, order: Order) => sum + order.total, 0) || 0

        setStats({
          totalProducts,
          totalOrders,
          pendingOrders,
          totalRevenue,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (authState.user?.email === "admin@paintstore.pk") {
      fetchDashboardData()
    }
  }, [authState.user])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId))
      } else {
        alert("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error deleting product")
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
      } else {
        alert("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Error updating order")
    }
  }

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`

  if (!authState.user || authState.user.email !== "admin@paintstore.pk") {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading admin dashboard...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your paint store</p>
          </div>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Products Management */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products Management</CardTitle>
                  <div className="flex gap-2">
                    <Link href="/admin/products/new">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{product.name}</h3>
                          {product.featured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.category.name} • {formatPrice(product.variants[0]?.price || 0)} • Stock:{" "}
                          {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/products/${product.slug}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{order.id}</h3>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : order.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • {order.phone} • {formatPrice(order.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
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
