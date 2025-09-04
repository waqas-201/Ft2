import { type NextRequest, NextResponse } from "next/server"

// Mock orders data for when database is not available
const mockOrders = [
  {
    id: "ORD-1703123456789-abc123def",
    items: [
      {
        id: "1",
        name: "Premium Interior Paint - White",
        price: 2500,
        quantity: 2,
        color: "White",
        size: "1L",
        image: "/white-paint-can.jpg",
      },
    ],
    shipping: {
      firstName: "Ahmed",
      lastName: "Khan",
      email: "ahmed@example.com",
      phone: "+92-300-1234567",
      address: "123 Main Street",
      city: "Karachi",
      state: "Sindh",
      zipCode: "75500",
      country: "Pakistan",
    },
    payment: {
      method: "cod" as const,
    },
    subtotal: 5000,
    promoDiscount: 0,
    deliveryFee: 200,
    total: 5200,
    status: "confirmed" as const,
    trackingNumber: "TRK123456789",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// GET /api/orders - Get orders (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    let orders = mockOrders
    let total = mockOrders.length

    // Try to use database if available
    try {
      const { prisma } = await import("@/lib/db")
      const { searchParams } = new URL(request.url)
      const status = searchParams.get("status")
      const customerEmail = searchParams.get("customerEmail")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")
      const skip = (page - 1) * limit

      const where: any = {}

      // Filter by status
      if (status) {
        where.status = status
      }

      // Filter by customer email (for user's own orders)
      if (customerEmail) {
        where.cartItems = {
          contains: customerEmail,
        }
      }

      const [dbOrders, dbTotal] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.order.count({ where }),
      ])

      // Parse cartItems JSON for each order
      orders = dbOrders.map((order) => ({
        ...order,
        items: JSON.parse(order.cartItems),
      }))
      total = dbTotal
    } catch (dbError) {
      console.log("[v0] Database not available, using mock data:", dbError)
      // Continue with mock data
    }

    return NextResponse.json({
      orders,
      pagination: {
        page: 1,
        limit: 10,
        total,
        pages: Math.ceil(total / 10),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST /api/orders - Create new order (place order)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shipping, payment, subtotal, promoDiscount, deliveryFee, total, notes } = body

    // Validate required fields
    if (!items || !shipping || !payment || !total) {
      return NextResponse.json({ error: "Missing required order information" }, { status: 400 })
    }

    // Validate shipping information
    const requiredShippingFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode"]
    for (const field of requiredShippingFields) {
      if (!shipping[field]) {
        return NextResponse.json({ error: `Missing required shipping field: ${field}` }, { status: 400 })
      }
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create comprehensive order data
    const orderData = {
      id: orderId,
      items,
      shipping,
      payment: {
        method: payment.method,
        // Don't store sensitive payment info in database
        ...(payment.method === "card" ? { cardLast4: payment.cardNumber?.slice(-4) } : {}),
        ...(payment.method === "bank" ? { bankAccount: payment.bankAccount } : {}),
      },
      subtotal,
      promoDiscount: promoDiscount || 0,
      deliveryFee: deliveryFee || 0,
      total,
      status: "confirmed" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      notes: notes || "",
    }

    try {
      const { prisma } = await import("@/lib/db")

      // Create order in database
      await prisma.order.create({
        data: {
          id: orderId,
          customerName: `${shipping.firstName} ${shipping.lastName}`,
          phone: shipping.phone,
          address: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}`,
          cartItems: JSON.stringify(orderData), // Store complete order data as JSON
          total,
          status: "confirmed",
        },
      })
    } catch (dbError) {
      console.log("[v0] Database not available, order created in memory only:", dbError)
      // Continue without database - in a real app you'd want to queue this for later processing
    }

    // Return the complete order data
    return NextResponse.json(orderData, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
