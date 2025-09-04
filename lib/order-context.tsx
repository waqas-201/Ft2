"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  color: string
  size: string
  image: string
}

export interface Order {
  id: string
  items: OrderItem[]
  shipping: {
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
  payment: {
    method: "cod" | "card" | "bank"
    cardNumber?: string
    expiryDate?: string
    cvv?: string
    cardName?: string
    bankAccount?: string
  }
  subtotal: number
  promoDiscount: number
  deliveryFee: number
  total: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"
  trackingNumber?: string
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
  notes?: string
}

interface OrderContextType {
  orders: Order[]
  getOrder: (id: string) => Order | undefined
  updateOrderStatus: (id: string, status: Order["status"]) => void
  cancelOrder: (id: string) => void
  addTrackingNumber: (id: string, trackingNumber: string) => void
  refreshOrders: () => void
}

const OrderContext = createContext<OrderContextType | null>(null)

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        console.error("Failed to load orders")
        setOrders([])
      }
    } catch (error) {
      console.error("Failed to load orders:", error)
      setOrders([])
    }
  }

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map((order) => (order.id === id ? updatedOrder : order)))
      } else {
        console.error("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const cancelOrder = (id: string) => {
    updateOrderStatus(id, "cancelled")
  }

  const addTrackingNumber = async (id: string, trackingNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${id}/tracking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingNumber }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map((order) => (order.id === id ? updatedOrder : order)))
      } else {
        console.error("Failed to add tracking number")
      }
    } catch (error) {
      console.error("Error adding tracking number:", error)
    }
  }

  const refreshOrders = () => {
    loadOrders()
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const getOrder = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        getOrder,
        updateOrderStatus,
        cancelOrder,
        addTrackingNumber,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
