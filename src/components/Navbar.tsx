"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="text-xl font-semibold text-blue-600">
          Second Hand
        </Link>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 justify-center px-6">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full max-w-md border rounded-full px-4 py-2 focus:outline-none"
          />
        </div>

        {/* Right: Links */}
        <div className="hidden md:flex items-center gap-6">
          {/* Categories + Products */}
          <div className="flex items-center gap-6 mr-8">
            <Link
              href="/categories"
              className="text-gray-700 hover:text-blue-600"
            >
              Categories
            </Link>

            <Link
              href="/products"
              className="text-gray-700 hover:text-blue-600"
            >
              Products
            </Link>
          </div>

          {/* Cart + Profile */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="text-gray-600 hover:text-blue-600">
              🛒
            </Link>

            <Link href="/profile" className="text-gray-600 hover:text-blue-600">
              👤
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 pb-4">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border rounded-full px-4 py-2 mt-3 mb-4 focus:outline-none"
          />

          <div className="flex flex-col text-gray-700">
            <Link href="/products" className="py-2">
              Products
            </Link>

            <Link href="/categories" className="py-2">
              Categories
            </Link>

            <Link href="/cart" className="py-2">
              🛒 Cart
            </Link>
            <Link href="/profile" className="py-2">
              👤 Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
