"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleX,
  Loader2,
  Package,
  Search,
  Tag,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        if (!res.ok) {
          throw new Error("Failed to load categories");
        }

        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setError("Could not load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(query));
  }, [categories, search]);

  const totalCategories = categories.length;
  const visibleCategories = filteredCategories.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Browse Categories
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Find the category you want, then open matching products in one click.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 md:self-auto">
              <span>{visibleCategories}</span>
              <span className="text-slate-400">/</span>
              <span>{totalCategories}</span>
              <span className="text-slate-500">categories</span>
            </div>
          </div>

          <div className="mt-5 w-full md:max-w-md">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Search categories
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name"
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label="Clear category search"
                >
                  <CircleX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-600">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <p className="mb-1 text-base font-semibold text-red-600">{error}</p>
            <p className="text-sm text-slate-600">
              Please check your connection or contact the administrator.
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Package className="mx-auto mb-4 h-14 w-14 text-slate-400" />
            <h2 className="mb-2 text-xl font-bold text-slate-900">No categories found</h2>
            <p className="text-slate-600">Try clearing your search or come back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 transition group-hover:text-blue-700">
                        {category.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">View products in this category</p>
                    </div>
                  </div>

                  <div className="text-blue-600 transition group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
