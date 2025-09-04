import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const categories = [
  {
    name: "Interior Paints",
    slug: "interior-paints",
    children: [
      { name: "Wall Paints", slug: "wall-paints" },
      { name: "Ceiling Paints", slug: "ceiling-paints" },
      { name: "Texture Paints", slug: "texture-paints" },
    ],
  },
  {
    name: "Exterior Paints",
    slug: "exterior-paints",
    children: [
      { name: "Weather Shield", slug: "weather-shield" },
      { name: "Roof Paints", slug: "roof-paints" },
    ],
  },
  {
    name: "Primers & Undercoats",
    slug: "primers-undercoats",
  },
  {
    name: "Painting Tools",
    slug: "painting-tools",
    children: [
      { name: "Brushes", slug: "brushes" },
      { name: "Rollers", slug: "rollers" },
      { name: "Spray Equipment", slug: "spray-equipment" },
    ],
  },
]

const products = [
  {
    name: "Premium Silk Emulsion",
    slug: "premium-silk-emulsion",
    description:
      "High-quality silk finish emulsion paint perfect for interior walls. Provides excellent coverage and durability with a smooth, washable finish.",
    categorySlug: "wall-paints",
    tags: "interior,silk,washable,premium",
    featured: true,
    variants: [
      {
        name: "1 Liter",
        sku: "PSE-1L",
        price: 1200,
        stock: 50,
        colors: [
          {
            name: "Pure White",
            hexCode: "#FFFFFF",
            images: [
              { url: "/placeholder-zl89b.png", alt: "Pure White Premium Silk Emulsion 1L" },
              { url: "/placeholder-ppk4f.png", alt: "Pure White paint texture" },
            ],
          },
          {
            name: "Cream Delight",
            hexCode: "#F5F5DC",
            images: [{ url: "/placeholder-4idpr.png", alt: "Cream Delight Premium Silk Emulsion 1L" }],
          },
          {
            name: "Sky Blue",
            hexCode: "#87CEEB",
            images: [{ url: "/placeholder-s96fx.png", alt: "Sky Blue Premium Silk Emulsion 1L" }],
          },
        ],
      },
      {
        name: "4 Liters",
        sku: "PSE-4L",
        price: 4500,
        stock: 30,
        colors: [
          {
            name: "Pure White",
            hexCode: "#FFFFFF",
            images: [{ url: "/placeholder-oqram.png", alt: "Pure White Premium Silk Emulsion 4L" }],
          },
          {
            name: "Cream Delight",
            hexCode: "#F5F5DC",
            images: [{ url: "/placeholder-w9e36.png", alt: "Cream Delight Premium Silk Emulsion 4L" }],
          },
        ],
      },
    ],
  },
  {
    name: "Weather Guard Exterior",
    slug: "weather-guard-exterior",
    description:
      "Advanced exterior paint formulated to withstand harsh Pakistani weather conditions. UV resistant and long-lasting protection for your home.",
    categorySlug: "weather-shield",
    tags: "exterior,weather-resistant,uv-protection",
    featured: true,
    discount: 10,
    variants: [
      {
        name: "1 Liter",
        sku: "WGE-1L",
        price: 1500,
        stock: 40,
        colors: [
          {
            name: "Sandstone Beige",
            hexCode: "#D2B48C",
            images: [{ url: "/placeholder-4lwhx.png", alt: "Sandstone Beige Weather Guard 1L" }],
          },
          {
            name: "Terracotta Red",
            hexCode: "#E2725B",
            images: [{ url: "/placeholder-gopbg.png", alt: "Terracotta Red Weather Guard 1L" }],
          },
        ],
      },
      {
        name: "4 Liters",
        sku: "WGE-4L",
        price: 5500,
        stock: 25,
        colors: [
          {
            name: "Sandstone Beige",
            hexCode: "#D2B48C",
            images: [{ url: "/placeholder-fjn5b.png", alt: "Sandstone Beige Weather Guard 4L" }],
          },
        ],
      },
    ],
  },
  {
    name: "Texture Master Pro",
    slug: "texture-master-pro",
    description:
      "Create stunning textured walls with this professional-grade texture paint. Easy to apply and available in multiple finishes.",
    categorySlug: "texture-paints",
    tags: "texture,professional,decorative",
    variants: [
      {
        name: "5 Kg Bucket",
        sku: "TMP-5KG",
        price: 3200,
        stock: 20,
        colors: [
          {
            name: "Pearl White",
            hexCode: "#F8F6F0",
            images: [{ url: "/placeholder-8xr00.png", alt: "Pearl White Texture Master Pro 5Kg" }],
          },
          {
            name: "Golden Sand",
            hexCode: "#F4A460",
            images: [{ url: "/placeholder-2p8jy.png", alt: "Golden Sand Texture Master Pro 5Kg" }],
          },
        ],
      },
    ],
  },
  {
    name: "Universal Primer",
    slug: "universal-primer",
    description:
      "High-quality primer suitable for all surfaces. Ensures better paint adhesion and coverage for both interior and exterior applications.",
    categorySlug: "primers-undercoats",
    tags: "primer,universal,base-coat",
    variants: [
      {
        name: "1 Liter",
        sku: "UP-1L",
        price: 800,
        stock: 60,
        colors: [
          {
            name: "White Base",
            hexCode: "#FFFFFF",
            images: [{ url: "/placeholder-iuf4t.png", alt: "Universal Primer White Base 1L" }],
          },
        ],
      },
      {
        name: "4 Liters",
        sku: "UP-4L",
        price: 2800,
        stock: 35,
        colors: [
          {
            name: "White Base",
            hexCode: "#FFFFFF",
            images: [{ url: "/placeholder-uwmla.png", alt: "Universal Primer White Base 4L" }],
          },
        ],
      },
    ],
  },
  {
    name: "Professional Paint Brush Set",
    slug: "professional-paint-brush-set",
    description:
      "Complete set of high-quality brushes for professional painting. Includes flat, angled, and detail brushes for all your painting needs.",
    categorySlug: "brushes",
    tags: "brushes,professional,set,tools",
    variants: [
      {
        name: "5-Piece Set",
        sku: "PPBS-5PC",
        price: 1500,
        stock: 25,
        colors: [
          {
            name: "Natural Bristle",
            hexCode: "#D2691E",
            images: [{ url: "/placeholder-73ydf.png", alt: "Professional Paint Brush Set - Natural Bristle" }],
          },
        ],
      },
    ],
  },
  {
    name: "Ceiling White Special",
    slug: "ceiling-white-special",
    description:
      "Specially formulated white paint for ceilings. Non-drip formula with excellent coverage and minimal splatter.",
    categorySlug: "ceiling-paints",
    tags: "ceiling,white,non-drip,special",
    variants: [
      {
        name: "2.5 Liters",
        sku: "CWS-2.5L",
        price: 2200,
        stock: 40,
        colors: [
          {
            name: "Brilliant White",
            hexCode: "#FFFFFF",
            images: [{ url: "/brilliant-white-ceiling-paint-2-5-liter-can.jpg", alt: "Ceiling White Special - Brilliant White 2.5L" }],
          },
        ],
      },
    ],
  },
]

async function main() {
  console.log("🌱 Starting seed...")

  // Clear existing data
  await prisma.image.deleteMany()
  await prisma.color.deleteMany()
  await prisma.variant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  console.log("🗑️  Cleared existing data")

  // Create categories
  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
      },
    })

    console.log(`📁 Created category: ${category.name}`)

    // Create child categories if they exist
    if (categoryData.children) {
      for (const childData of categoryData.children) {
        const childCategory = await prisma.category.create({
          data: {
            name: childData.name,
            slug: childData.slug,
            parentId: category.id,
          },
        })
        console.log(`  📂 Created subcategory: ${childCategory.name}`)
      }
    }
  }

  // Create products
  for (const productData of products) {
    const category = await prisma.category.findUnique({
      where: { slug: productData.categorySlug },
    })

    if (!category) {
      console.error(`❌ Category not found: ${productData.categorySlug}`)
      continue
    }

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        categoryId: category.id,
        tags: productData.tags,
        discount: productData.discount,
        featured: productData.featured || false,
      },
    })

    console.log(`🎨 Created product: ${product.name}`)

    // Create variants
    for (const variantData of productData.variants) {
      const variant = await prisma.variant.create({
        data: {
          name: variantData.name,
          sku: variantData.sku,
          price: variantData.price,
          stock: variantData.stock,
          productId: product.id,
        },
      })

      console.log(`  📦 Created variant: ${variant.name}`)

      // Create colors
      for (const colorData of variantData.colors) {
        const color = await prisma.color.create({
          data: {
            name: colorData.name,
            hexCode: colorData.hexCode,
            variantId: variant.id,
          },
        })

        console.log(`    🎨 Created color: ${color.name}`)

        // Create images
        for (const imageData of colorData.images) {
          await prisma.image.create({
            data: {
              url: imageData.url,
              alt: imageData.alt,
              colorId: color.id,
            },
          })
        }
      }
    }
  }

  console.log("✅ Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
