"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Grid2X2,
  Heart,
  ChevronDown,
  Menu,
  Search,
  Shield,
  User,
  X,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "@/src/context/LanguageContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState(() => {
    const searchParam = searchParams.get("search");
    return searchParam ? decodeURIComponent(searchParam) : "";
  });
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") ?? ""
  );
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();

    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          setIsLoggedIn(false);
          setUserRole(null);
          return;
        }

        const user = await res.json();
        setIsLoggedIn(true);
        setUserRole(user.role || null);
      } catch {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);
    const handleAuthChange = () => checkAuth();
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!categoryMenuRef.current) {
        return;
      }

      if (!categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setIsLoggedIn(false);
    setUserRole(null);
    window.dispatchEvent(new Event("authChange"));
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    router.push(params.toString() ? `/products?${params.toString()}` : "/products");
    setCategoryMenuOpen(false);
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

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    router.push("/profile");
  };

  const isAdmin = () => {
    if (!userRole) {
      return false;
    }
    return userRole.toLowerCase().trim() === "admin";
  };

  const iconButtonClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600";

  const allCategoriesLabel = t("nav.allCategories");

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-semibold tracking-tight text-blue-600 sm:text-2xl"
        >
          {t("nav.brand")}
        </Link>

        <div className="hidden flex-1 items-center gap-3 lg:flex">
          <form
            key={`desktop-search-${pathname}-${searchParams.toString()}`}
            onSubmit={handleSearch}
            className="ml-2 flex min-w-60 flex-1 items-stretch rounded-full border border-slate-200 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
          >
            <div
              ref={categoryMenuRef}
              className="relative flex w-52 shrink-0 items-center border-r border-slate-200 bg-slate-50 px-2"
            >
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((current) => !current)}
                className="inline-flex w-full items-center justify-between rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                aria-label={allCategoriesLabel}
                aria-haspopup="listbox"
              >
                <span className="truncate">{selectedCategory || allCategoriesLabel}</span>
                <ChevronDown
                  className={`ml-2 h-4 w-4 text-slate-400 transition ${
                    categoryMenuOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {categoryMenuOpen && (
                <div className="absolute left-2 right-2 top-[calc(100%+0.4rem)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_20px_45px_rgba(15,23,42,0.14)]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("");
                      setCategoryMenuOpen(false);
                    }}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                      selectedCategory === ""
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {allCategoriesLabel}
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setCategoryMenuOpen(false);
                      }}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                        selectedCategory === category.name
                          ? "bg-blue-50 font-semibold text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t("nav.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </form>
        </div>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />

          {isLoggedIn ? (
            <>
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

              <Link
                href="/favorites"
                className={iconButtonClass}
                title={t("nav.myFavorites")}
              >
                <Heart className="h-5 w-5" />
              </Link>

              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className={iconButtonClass}
                  aria-label={t("nav.profile")}
                >
                  <User className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
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
                <div className="grid gap-1">
                  <Link
                    href="/auth/login"
                    className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-white hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-white hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
