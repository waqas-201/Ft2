import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// PUT /api/orders/[id]/tracking - Add tracking number (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { trackingNumber } = body

    if (!trackingNumber) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 })
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Parse existing order data
    const orderData = JSON.parse(existingOrder.cartItems)

    // Update order with tracking number and set status to shipped
    const updatedOrderData = {
      ...orderData,
      trackingNumber,
      status: "shipped",
      updatedAt: new Date().toISOString(),
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "shipped",
        cartItems: JSON.stringify(updatedOrderData),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      id: updatedOrder.id,
      ...updatedOrderData,
      message: "Tracking number added successfully",
    })
  } catch (error) {
    console.error("Error adding tracking number:", error)
    return NextResponse.json({ error: "Failed to add tracking number" }, { status: 500 })
  }
}
