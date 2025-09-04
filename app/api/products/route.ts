import { type NextRequest, NextResponse } from "next/server"

// Mock data for when database is not available
const mockProducts = [
  {
    id: "1",
    name: "Premium Interior Paint",
    slug: "premium-interior-paint",
    description: "High-quality interior paint with excellent coverage and durability",
    categoryId: "1",
    tags: "interior, premium, washable",
    discount: 10,
    featured: true,
    createdAt: new Date(),
    category: {
      id: "1",
      name: "Interior Paint",
      slug: "interior-paint",
    },
    variants: [
      {
        id: "1",
        name: "1 Liter",
        sku: "PIP-1L",
        price: 1200,
        stock: 50,
        colors: [
          {
            id: "1",
            name: "Pure White",
            hexCode: "#FFFFFF",
            images: [
              {
                id: "1",
                url: "/white-paint-can.jpg",
                alt: "Pure White Paint Can",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Exterior Weather Shield",
    slug: "exterior-weather-shield",
    description: "Weather-resistant exterior paint for long-lasting protection",
    categoryId: "2",
    tags: "exterior, weather-resistant, durable",
    discount: null,
    featured: true,
    createdAt: new Date(),
    category: {
      id: "2",
      name: "Exterior Paint",
      slug: "exterior-paint",
    },
    variants: [
      {
        id: "2",
        name: "1 Liter",
        sku: "EWS-1L",
        price: 1500,
        stock: 30,
        colors: [
          {
            id: "2",
            name: "Sky Blue",
            hexCode: "#87CEEB",
            images: [
              {
                id: "2",
                url: "/blue-paint-can.jpg",
                alt: "Sky Blue Paint Can",
              },
            ],
          },
        ],
      },
    ],
  },
]

async function getPrismaClient() {
  try {
    const { prisma } = await import("@/lib/db")
    return prisma
  } catch (error) {
    console.log("[v0] Database not available, using mock data:", error.message)
    return null
  }
}

// GET /api/products - Get all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Products API called")

    const prismaClient = await getPrismaClient()

    if (!prismaClient) {
      console.log("[v0] Using mock data fallback")

      // Return mock data when database is not available
      const { searchParams } = new URL(request.url)
      const category = searchParams.get("category")
      const featured = searchParams.get("featured")
      const search = searchParams.get("search")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "12")

      let filteredProducts = [...mockProducts]

      // Apply filters to mock data
      if (category) {
        filteredProducts = filteredProducts.filter((p) => p.category.slug === category)
      }
      if (featured === "true") {
        filteredProducts = filteredProducts.filter((p) => p.featured)
      }
      if (search) {
        const searchLower = search.toLowerCase()
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.tags.toLowerCase().includes(searchLower),
        )
      }

      const total = filteredProducts.length
      const startIndex = (page - 1) * limit
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit)

      return NextResponse.json({
        products: paginatedProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    }

    console.log("[v0] Database available, using Prisma")

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const where: any = {}

    // Filter by category
    if (category) {
      where.category = {
        slug: category,
      }
    }

    // Filter by featured
    if (featured === "true") {
      where.featured = true
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ]
    }

    const [products, total] = await Promise.all([
      prismaClient.product.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prismaClient.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Error in products API:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const prismaClient = await getPrismaClient()

    if (!prismaClient) {
      console.log("[v0] Database not available for product creation")
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const body = await request.json()
    const { name, slug, description, categoryId, tags, discount, featured, variants } = body

    // Validate required fields
    if (!name || !slug || !description || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if slug already exists
    const existingProduct = await prismaClient.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 })
    }

    // Create product with variants and colors
    const product = await prismaClient.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        tags: tags || "",
        discount: discount || null,
        featured: featured || false,
        variants: {
          create:
            variants?.map((variant: any) => ({
              name: variant.name,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              colors: {
                create:
                  variant.colors?.map((color: any) => ({
                    name: color.name,
                    hexCode: color.hexCode,
                    images: {
                      create:
                        color.images?.map((image: any) => ({
                          url: image.url,
                          alt: image.alt,
                        })) || [],
                    },
                  })) || [],
              },
            })) || [],
        },
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

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
