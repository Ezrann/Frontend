"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation"; // Next.js 13+ router
import { Menu, X, Shield, Heart, User } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      setIsLoggedIn(!!token);
      setUserRole(role);
      // Only log if role exists to avoid spam
      if (role) {
        console.log("Navbar - Role from localStorage:", role);
        console.log(
          "Navbar - Is admin?",
          role?.toLowerCase()?.trim() === "admin"
        );
      }
    };

    // Check immediately
    checkAuth();

    // Check auth status periodically and on storage changes
    const interval = setInterval(checkAuth, 1000);

    // Listen for storage events (when localStorage changes in other tabs/windows)
    window.addEventListener("storage", checkAuth);

    // Also listen for custom storage events (for same-tab updates)
    const handleStorageChange = () => checkAuth();
    window.addEventListener("localStorageChange", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("localStorageChange", handleStorageChange);
    };
  }, []);

  // Update search query from URL parameters
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    } else {
      // Clear search query if we're not on products page or no search param
      if (pathname !== "/products") {
        setSearchQuery("");
      }
    }
  }, [searchParams, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Also clear cookies for middleware
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
    setIsLoggedIn(false);
    setProfileOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setOpen(false); // Close mobile menu if open
    }
  };

  const handleCreateProduct = () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
    } else {
      router.push("/products/add");
    }
    setOpen(false); // Close mobile menu if open
  };

  // Check if user is admin (case-insensitive)
  const isAdmin = () => {
    if (!userRole) {
      return false;
    }
    const normalizedRole = userRole.toLowerCase().trim();
    return normalizedRole === "admin";
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

          {/* Create Product Button + Admin Dashboard + Favorites + Profile */}
          <div className="flex items-center gap-4 relative">
            {/* Admin Dashboard Button - Visible only for admins - More Prominent */}
            {isAdmin() && (
              <Link
                href="/admin/dashboard"
                className="px-5 py-2.5 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Shield className="w-5 h-5" />
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={handleCreateProduct}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Post Product
            </button>

            {/* Favorites/Wishlist Button - Visible only when logged in */}
            {isLoggedIn && (
              <Link
                href="/favorites"
                className="p-2 text-gray-600 hover:text-red-600 transition-colors relative"
                title="My Favorites"
              >
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {/* Profile Dropdown */}
            <button
              onClick={() => {
                if (isLoggedIn) {
                  router.push("/profile");
                } else {
                  router.push("/auth/login");
                }
              }}
              className="text-gray-600 hover:text-blue-600"
              aria-label="Open profile"
            >
              <User className="w-6 h-6" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-10 bg-white shadow-md border rounded-md w-auto py-2 px-4 z-20 flex flex-col gap-2 min-w-30">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/profile"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    {(userRole?.toLowerCase()?.trim() === "admin" ||
                      userRole === "Admin" ||
                      userRole === "ADMIN") && (
                      <Link
                        href="/admin/dashboard"
                        className="text-gray-700 hover:text-blue-600"
                        onClick={() => setProfileOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-left text-gray-700 hover:text-blue-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="../auth/register"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setProfileOpen(false)}
                    >
                      Register
                    </Link>
                    <Link
                      href="../auth/login"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setProfileOpen(false)}
                    >
                      Login
                    </Link>
                  </>
                )}
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
            <Link href="/products" className="py-2">
              Products
            </Link>
            <Link href="/categories" className="py-2">
              Categories
            </Link>
            {/* Admin Dashboard Button - Mobile - Visible only for admins - More Prominent */}
            {isAdmin() && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="py-2.5 text-left px-5 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all font-semibold flex items-center gap-2 shadow-md"
              >
                <Shield className="w-5 h-5" />
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={handleCreateProduct}
              className="py-2 text-left px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Post Product
            </button>

            {/* Favorites/Wishlist Link - Mobile - Visible only when logged in */}
            {isLoggedIn && (
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                className="py-2 text-left px-4 text-gray-700 hover:text-red-600 transition-colors flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                My Favorites
              </Link>
            )}

            {/* Mobile Profile as Row */}
            <div className="py-2 flex flex-col gap-2 border-t pt-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  {(userRole?.toLowerCase()?.trim() === "admin" ||
                    userRole === "Admin" ||
                    userRole === "ADMIN") && (
                    <Link
                      href="/admin/dashboard"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    Register
                  </Link>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
