"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ router
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setOpen(false); // Close mobile menu if open
    }
  };

  return (
    <nav className="w-full bg-white shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="text-xl font-semibold text-blue-600">
          Second Hand
        </Link>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 justify-center px-6"
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md border rounded-full px-4 py-2 focus:outline-none"
          />
        </form>

        {/* Right: Links */}
        <div className="hidden md:flex items-center gap-6">
          {/* Categories + Products */}
          <div className="flex items-center gap-6 mr-8">
            <Link href="/categories" className="text-gray-700 hover:text-blue-600">
              Categories
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
          </div>

          {/* Cart + Profile */}
          <div className="flex items-center gap-4 relative">
            <Link href="/cart" className="text-gray-600 hover:text-blue-600">
              🛒
            </Link>

            {/* Profile Dropdown */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="text-gray-600 hover:text-blue-600"
            >
              👤
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-10 bg-white shadow-md border rounded-md w-auto py-2 px-4 z-20 flex gap-4">
                <Link
                  href="/register"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
              </div>
            )}
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
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-full px-4 py-2 mt-3 mb-4 focus:outline-none"
            />
          </form>

          <div className="flex flex-col text-gray-700 gap-2">
            <Link href="/products" className="py-2">Products</Link>
            <Link href="/categories" className="py-2">Categories</Link>
            <Link href="/cart" className="py-2">🛒 Cart</Link>

            {/* Mobile Profile as Row */}
            <div className="py-2 flex gap-4 border-t pt-2">
              <Link href="/register" className="text-gray-700 hover:text-blue-600">
                Register
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
