import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/orders/[id] - Get single order
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Parse the stored order data
    const orderData = JSON.parse(order.cartItems)

    return NextResponse.json({
      id: order.id,
      ...orderData,
      status: order.status,
      updatedAt: order.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// PUT /api/orders/[id] - Update order (admin operations)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, trackingNumber, notes } = body

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Parse existing order data
    const orderData = JSON.parse(existingOrder.cartItems)

    // Update order data
    const updatedOrderData = {
      ...orderData,
      status: status || orderData.status,
      trackingNumber: trackingNumber || orderData.trackingNumber,
      notes: notes !== undefined ? notes : orderData.notes,
      updatedAt: new Date().toISOString(),
    }

    // Update in database
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: updatedOrderData.status,
        cartItems: JSON.stringify(updatedOrderData),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      id: updatedOrder.id,
      ...updatedOrderData,
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

// DELETE /api/orders/[id] - Cancel order
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Parse existing order data
    const orderData = JSON.parse(existingOrder.cartItems)

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(orderData.status)) {
      return NextResponse.json({ error: "Order cannot be cancelled at this stage" }, { status: 400 })
    }

    // Update order status to cancelled
    const cancelledOrderData = {
      ...orderData,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "cancelled",
        cartItems: JSON.stringify(cancelledOrderData),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      id: updatedOrder.id,
      ...cancelledOrderData,
      message: "Order cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
