"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { useAuth } from "@/lib/auth-context"

const categories = [
  { name: "Interior Paints", href: "/products?category=interior" },
  { name: "Exterior Paints", href: "/products?category=exterior" },
  { name: "Primers", href: "/products?category=primers" },
  { name: "Tools & Accessories", href: "/products?category=tools" },
]

export function Header() {
  const { state, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-primary">PaintStore Pakistan</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for paints, colors, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {state.isAuthenticated && state.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <User className="w-4 h-4 mr-2" />
                    {state.user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?tab=orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            <CartDrawer />

            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-8 pb-4">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {category.name}
            </Link>
          ))}
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                href="/"
                className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/about"
                className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t pt-2 mt-2">
                {state.isAuthenticated && state.user ? (
                  <>
                    <Link
                      href="/account"
                      className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2 inline" />
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
