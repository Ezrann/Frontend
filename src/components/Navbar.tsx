"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Menu, X, Shield, Heart, User } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "../context/LanguageContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(() => {
    const searchParam = searchParams.get("search");
    return searchParam ? decodeURIComponent(searchParam) : "";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      setIsLoggedIn(!!token);
      setUserRole(role);
      if (role) {
        console.log("Navbar - Role from localStorage:", role);
        console.log(
          "Navbar - Is admin?",
          role?.toLowerCase()?.trim() === "admin"
        );
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);
    window.addEventListener("storage", checkAuth);

    const handleStorageChange = () => checkAuth();
    window.addEventListener("localStorageChange", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("localStorageChange", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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
      setOpen(false);
      return;
    }

    router.push("/products");
    setOpen(false);
  };

  const handleCreateProduct = () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
    } else {
      router.push("/products/add");
    }
    setOpen(false);
  };

  const isAdmin = () => {
    if (!userRole) {
      return false;
    }
    return userRole.toLowerCase().trim() === "admin";
  };

  return (
    <nav className="w-full bg-white shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-blue-600">
          {t("nav.brand")}
        </Link>

        <form
          key={`desktop-search-${pathname}-${searchParams.toString()}`}
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 justify-center px-6"
        >
          <input
            type="text"
            placeholder={t("nav.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md border rounded-full px-4 py-2 focus:outline-none"
          />
        </form>

        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher />

          <div className="flex items-center gap-6 mr-8">
            <Link href="/categories" className="text-gray-700 hover:text-blue-600">
              {t("nav.categories")}
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600">
              {t("nav.products")}
            </Link>
          </div>

          <div className="flex items-center gap-4 relative">
            {isAdmin() && (
              <Link
                href="/admin/dashboard"
                className="px-5 py-2.5 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Shield className="w-5 h-5" />
                {t("nav.adminDashboard")}
              </Link>
            )}

            <button
              onClick={handleCreateProduct}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              {t("nav.postProduct")}
            </button>

            {isLoggedIn && (
              <Link
                href="/favorites"
                className="p-2 text-gray-600 hover:text-red-600 transition-colors relative"
                title={t("nav.myFavorites")}
              >
                <Heart className="w-6 h-6" />
              </Link>
            )}

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
                      {t("nav.profile")}
                    </Link>
                    {(userRole?.toLowerCase()?.trim() === "admin" ||
                      userRole === "Admin" ||
                      userRole === "ADMIN") && (
                      <Link
                        href="/admin/dashboard"
                        className="text-gray-700 hover:text-blue-600"
                        onClick={() => setProfileOpen(false)}
                      >
                        {t("nav.adminDashboard")}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-left text-gray-700 hover:text-blue-600"
                    >
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="../auth/register"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setProfileOpen(false)}
                    >
                      {t("nav.register")}
                    </Link>
                    <Link
                      href="../auth/login"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setProfileOpen(false)}
                    >
                      {t("nav.login")}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t px-4 pb-4">
          <div className="mt-3">
            <LanguageSwitcher />
          </div>

          <form
            key={`mobile-search-${pathname}-${searchParams.toString()}`}
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder={t("nav.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-full px-4 py-2 mt-3 mb-4 focus:outline-none"
            />
          </form>

          <div className="flex flex-col text-gray-700 gap-2">
            <Link href="/products" className="py-2">
              {t("nav.products")}
            </Link>
            <Link href="/categories" className="py-2">
              {t("nav.categories")}
            </Link>
            {isAdmin() && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="py-2.5 text-left px-5 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all font-semibold flex items-center gap-2 shadow-md"
              >
                <Shield className="w-5 h-5" />
                {t("nav.adminDashboard")}
              </Link>
            )}

            <button
              onClick={handleCreateProduct}
              className="py-2 text-left px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              {t("nav.postProduct")}
            </button>

            {isLoggedIn && (
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                className="py-2 text-left px-4 text-gray-700 hover:text-red-600 transition-colors flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                {t("nav.myFavorites")}
              </Link>
            )}

            <div className="py-2 flex flex-col gap-2 border-t pt-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.profile")}
                  </Link>
                  {(userRole?.toLowerCase()?.trim() === "admin" ||
                    userRole === "Admin" ||
                    userRole === "ADMIN") && (
                    <Link
                      href="/admin/dashboard"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setOpen(false)}
                    >
                      {t("nav.adminDashboard")}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-blue-600"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.register")}
                  </Link>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.login")}
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
