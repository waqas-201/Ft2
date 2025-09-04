import { execSync } from "child_process"

console.log("Setting up database...")

try {
  // Generate Prisma client
  console.log("Generating Prisma client...")
  execSync("npx prisma generate", { stdio: "inherit" })

  // Push database schema
  console.log("Pushing database schema...")
  execSync("npx prisma db push", { stdio: "inherit" })

  console.log("Database setup complete!")
  console.log('Run "npm run seed" to add demo products.')
} catch (error) {
  console.error("Database setup failed:", error)
  process.exit(1)
}
