import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-primary">PaintStore Pakistan</span>
            </div>
            <p className="text-slate-400 mb-4">
              Premium quality paints and painting solutions for homes and businesses across Pakistan.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-slate-400 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-slate-400 hover:text-white transition-colors">
                  Brands
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-white transition-colors">
                  Paint Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=interior" className="text-slate-400 hover:text-white transition-colors">
                  Interior Paints
                </Link>
              </li>
              <li>
                <Link href="/products?category=exterior" className="text-slate-400 hover:text-white transition-colors">
                  Exterior Paints
                </Link>
              </li>
              <li>
                <Link href="/products?category=primers" className="text-slate-400 hover:text-white transition-colors">
                  Primers & Undercoats
                </Link>
              </li>
              <li>
                <Link href="/products?category=tools" className="text-slate-400 hover:text-white transition-colors">
                  Tools & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-slate-400">+92-21-1234-5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-slate-400">info@paintstore.pk</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <span className="text-slate-400">123 Paint Street, Karachi, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">© 2024 PaintStore Pakistan. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/shipping" className="text-slate-400 hover:text-white text-sm transition-colors">
                Shipping Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
