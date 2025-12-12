"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold text-blue-600">
          Second Hand
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <input
            type="text"
            placeholder="Search"
            className="border rounded-full px-4 py-1 focus:outline-none"
          />

          <select className="border rounded-full px-3 py-1">
            <option>Categories</option>
          </select>

          <Link href="/cart" className="text-gray-600 hover:text-blue-600">
            🛒
          </Link>

          <Link href="/profile" className="text-gray-600 hover:text-blue-600">
            👤
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 pb-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full border rounded-full px-4 py-1 mt-2 mb-3 focus:outline-none"
          />

          <select className="w-full border rounded-full px-3 py-2">
            <option>Categories</option>
          </select>

          <div className="flex flex-col mt-3 text-gray-600">
            <Link href="/cart" className="py-2">🛒 Cart</Link>
            <Link href="/profile" className="py-2">👤 Profile</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
