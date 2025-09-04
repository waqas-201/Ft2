import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/products/[id] - Get single product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          include: {
            parent: true,
          },
        },
        variants: {
          include: {
            colors: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, slug, description, categoryId, tags, discount, featured } = body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if slug is taken by another product
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      })

      if (slugExists) {
        return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 })
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: name || existingProduct.name,
        slug: slug || existingProduct.slug,
        description: description || existingProduct.description,
        categoryId: categoryId || existingProduct.categoryId,
        tags: tags !== undefined ? tags : existingProduct.tags,
        discount: discount !== undefined ? discount : existingProduct.discount,
        featured: featured !== undefined ? featured : existingProduct.featured,
      },
      include: {
        category: true,
        variants: {
          include: {
            colors: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product (cascade will handle variants, colors, images)
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
