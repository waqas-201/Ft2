"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, MapPin, Phone, Mail, Package, Settings, LogOut, Edit, Search, Filter, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useOrders } from "@/lib/order-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const statusConfig = {
  pending: { color: "bg-teal-100 text-teal-800", label: "Pending" },
  confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
  processing: { color: "bg-purple-100 text-purple-800", label: "Processing" },
  shipped: { color: "bg-indigo-100 text-indigo-800", label: "Shipped" },
  delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
  cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
  returned: { color: "bg-gray-100 text-gray-800", label: "Returned" },
}

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, logout, updateUser } = useAuth()
  const { orders } = useOrders()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile")
  const [orderSearch, setOrderSearch] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Pakistan",
    },
  })

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push("/login")
      return
    }

    if (state.user) {
      setFormData({
        name: state.user.name,
        phone: state.user.phone || "",
        address: state.user.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "Pakistan",
        },
      })
    }
  }, [state, router])

  const handleSave = () => {
    updateUser({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
    })
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(orderSearch.toLowerCase()))
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`

  if (state.isLoading) {
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

  if (!state.isAuthenticated || !state.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Account</h1>
              <p className="text-muted-foreground">Manage your profile and orders</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Summary */}
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <CardTitle>{state.user.name}</CardTitle>
                    <CardDescription>{state.user.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{state.user.email}</span>
                      </div>
                      {state.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{state.user.phone}</span>
                        </div>
                      )}
                      {state.user.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div>{state.user.address.street}</div>
                            <div>
                              {state.user.address.city}, {state.user.address.state}
                            </div>
                            <div>{state.user.address.zipCode}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Form */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Profile Information</CardTitle>
                          <CardDescription>Update your personal details</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                        >
                          {isEditing ? "Save" : <Edit className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={!isEditing}
                            placeholder="+92-XXX-XXXXXXX"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Address Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input
                              id="street"
                              value={formData.address.street}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  address: { ...formData.address, street: e.target.value },
                                })
                              }
                              disabled={!isEditing}
                              placeholder="123 Main Street"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={formData.address.city}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  address: { ...formData.address, city: e.target.value },
                                })
                              }
                              disabled={!isEditing}
                              placeholder="Karachi"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                              id="state"
                              value={formData.address.state}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  address: { ...formData.address, state: e.target.value },
                                })
                              }
                              disabled={!isEditing}
                              placeholder="Sindh"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              value={formData.address.zipCode}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  address: { ...formData.address, zipCode: e.target.value },
                                })
                              }
                              disabled={!isEditing}
                              placeholder="75500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" value={formData.address.country} disabled className="bg-muted" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Order History
                      </CardTitle>
                      <CardDescription>View and manage your orders</CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search orders by ID or product name..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {orders.length === 0 ? "No orders yet" : "No orders match your search"}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {orders.length === 0
                          ? "Start shopping to see your orders here"
                          : "Try adjusting your search or filter criteria"}
                      </p>
                      {orders.length === 0 && (
                        <Link href="/products">
                          <Button>Browse Products</Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <Card key={order.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold">Order {order.id}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge className={`${statusConfig[order.status].color} mb-2`}>
                                  {statusConfig[order.status].label}
                                </Badge>
                                <div className="text-lg font-semibold">{formatPrice(order.total)}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2">Items ({order.items.length})</h5>
                                <div className="space-y-1">
                                  {order.items.slice(0, 2).map((item, index) => (
                                    <div key={index} className="text-sm text-muted-foreground">
                                      {item.name} × {item.quantity}
                                    </div>
                                  ))}
                                  {order.items.length > 2 && (
                                    <div className="text-sm text-muted-foreground">
                                      +{order.items.length - 2} more items
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium mb-2">Delivery Address</h5>
                                <div className="text-sm text-muted-foreground">
                                  <p>
                                    {order.shipping.firstName} {order.shipping.lastName}
                                  </p>
                                  <p>
                                    {order.shipping.city}, {order.shipping.state}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="text-sm text-muted-foreground">
                                {order.trackingNumber && <span>Tracking: {order.trackingNumber}</span>}
                              </div>
                              <Link href={`/orders/${order.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Email Preferences</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Order updates and shipping notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">New product announcements</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Marketing emails and promotions</span>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Account Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-destructive bg-transparent">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}
