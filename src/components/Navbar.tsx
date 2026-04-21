"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Grid2X2,
  Heart,
  Menu,
  Search,
  Shield,
  User,
  X,
} from "lucide-react";
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

  const navLinkClass = (href: string) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      pathname === href
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const iconButtonClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-2xl font-semibold tracking-tight text-blue-600"
        >
          {t("nav.brand")}
        </Link>

        <div className="hidden flex-1 items-center gap-3 lg:flex">
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
            <Link href="/categories" className={navLinkClass("/categories")}>
              {t("nav.categories")}
            </Link>
            <Link href="/products" className={navLinkClass("/products")}>
              {t("nav.products")}
            </Link>
          </div>

          <form
            key={`desktop-search-${pathname}-${searchParams.toString()}`}
            onSubmit={handleSearch}
            className="ml-2 flex min-w-[240px] flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-blue-400 focus-within:bg-white"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("nav.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </form>
        </div>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />

          {isAdmin() && (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <Shield className="h-4 w-4" />
              {t("nav.adminDashboard")}
            </Link>
          )}

          <button
            onClick={handleCreateProduct}
            className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            {t("nav.postProduct")}
          </button>

          {isLoggedIn && (
            <Link
              href="/favorites"
              className={iconButtonClass}
              title={t("nav.myFavorites")}
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setProfileOpen((current) => !current)}
              className={iconButtonClass}
              aria-label={t("nav.profile")}
            >
              <User className="h-5 w-5" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 min-w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/profile"
                      className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                      onClick={() => setProfileOpen(false)}
                    >
                      {t("nav.profile")}
                    </Link>
                    {isAdmin() && (
                      <Link
                        href="/admin/dashboard"
                        className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                        onClick={() => setProfileOpen(false)}
                      >
                        {t("nav.adminDashboard")}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                    >
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/register"
                      className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                      onClick={() => setProfileOpen(false)}
                    >
                      {t("nav.register")}
                    </Link>
                    <Link
                      href="/auth/login"
                      className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
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

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 lg:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-4 lg:hidden">
          <div className="mb-4">
            <LanguageSwitcher />
          </div>

          <form
            key={`mobile-search-${pathname}-${searchParams.toString()}`}
            onSubmit={handleSearch}
            className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("nav.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </form>

          <div className="grid gap-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              <Search className="h-4 w-4 text-slate-400" />
              {t("nav.products")}
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              <Grid2X2 className="h-4 w-4 text-slate-400" />
              {t("nav.categories")}
            </Link>
            <button
              onClick={handleCreateProduct}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t("nav.postProduct")}
            </button>
            {isAdmin() && (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                <Shield className="h-4 w-4" />
                {t("nav.adminDashboard")}
              </Link>
            )}
            {isLoggedIn && (
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Heart className="h-4 w-4 text-slate-400" />
                {t("nav.myFavorites")}
              </Link>
            )}

            <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-white hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.profile")}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-white hover:text-blue-600"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-white hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.register")}
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-white hover:text-blue-600"
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
