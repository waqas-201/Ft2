import { type NextRequest, NextResponse } from "next/server"

let prisma: any = null
let dbAvailable = false

try {
  const { prisma: prismaClient } = require("@/lib/db")
  prisma = prismaClient
  dbAvailable = true
} catch (error) {
  console.log("[v0] Database not available, using mock data:", error.message)
  dbAvailable = false
}

// Mock categories data
const mockCategories = [
  {
    id: "1",
    name: "Interior Paint",
    slug: "interior-paint",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [
      {
        id: "2",
        name: "Wall Paint",
        slug: "wall-paint",
        parentId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
        parent: null,
        _count: { products: 15 },
      },
      {
        id: "3",
        name: "Ceiling Paint",
        slug: "ceiling-paint",
        parentId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
        parent: null,
        _count: { products: 8 },
      },
    ],
    parent: null,
    _count: { products: 23 },
  },
  {
    id: "4",
    name: "Exterior Paint",
    slug: "exterior-paint",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [
      {
        id: "5",
        name: "House Paint",
        slug: "house-paint",
        parentId: "4",
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
        parent: null,
        _count: { products: 12 },
      },
    ],
    parent: null,
    _count: { products: 12 },
  },
  {
    id: "6",
    name: "Primers",
    slug: "primers",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
    parent: null,
    _count: { products: 6 },
  },
  {
    id: "7",
    name: "Tools & Accessories",
    slug: "tools-accessories",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
    parent: null,
    _count: { products: 18 },
  },
]

// GET /api/categories - Get all categories
export async function GET() {
  try {
    if (dbAvailable && prisma) {
      const categories = await prisma.category.findMany({
        include: {
          children: true,
          parent: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: "asc" },
      })
      return NextResponse.json(categories)
    } else {
      return NextResponse.json(mockCategories)
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(mockCategories)
  }
}

// POST /api/categories - Create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!dbAvailable || !prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const body = await request.json()
    const { name, slug, parentId } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this slug already exists" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
      },
      include: {
        children: true,
        parent: true,
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
