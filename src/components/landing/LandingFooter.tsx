"use client";

import Link from "next/link";
import { 
  ShoppingCart, 
  MapPin, 
  Mail, 
  Phone,
  Globe,
  MessageCircle,
  Share2
} from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href={"/" as any} className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">badekshop</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Your trusted partner for connectivity in Bali. Providing instant eSIM 
              and SIM cards for tourists since 2020.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>Ngurah Rai International Airport, Bali</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500" />
                <span>+62 819-3330-2000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span>support@badekshop.com</span>
              </div>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-3">
              <li><Link href={"/products" as any} className="hover:text-white transition-colors">eSIM Plans</Link></li>
              <li><Link href={"/products" as any} className="hover:text-white transition-colors">Physical SIM</Link></li>
              <li><Link href={"/products" as any} className="hover:text-white transition-colors">3 Days Plan</Link></li>
              <li><Link href={"/products" as any} className="hover:text-white transition-colors">7 Days Plan</Link></li>
              <li><Link href={"/products" as any} className="hover:text-white transition-colors">14 Days Plan</Link></li>
              <li><Link href={"/products" as any} className="hover:text-white transition-colors">30 Days Plan</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><Link href={"/track-order" as any} className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href={"/kyc" as any} className="hover:text-white transition-colors">KYC Guide</Link></li>
              <li><a href="https://wa.me/6281933302000" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm">
              © {new Date().getFullYear()} badekshop. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-2">We accept:</span>
              {["VISA", "Mastercard", "JCB", "AMEX", "UnionPay"].map((icon) => (
                <div
                  key={icon}
                  className="px-2 py-1 bg-gray-800 rounded text-xs font-semibold text-gray-400"
                >
                  {icon}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Social Media"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/6281933302000"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
