"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Tag, Package, Search, Loader2 } from "lucide-react";

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
    return categories.filter((c) => c.name.toLowerCase().includes(query));
  }, [categories, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Tag className="w-8 h-8 text-blue-600" />
              Browse Categories
            </h1>
            <p className="text-gray-600 max-w-xl">
              Explore all product categories and jump straight to listings that
              match what you are looking for.
            </p>
          </div>

          {/* Search input */}
          <div className="w-full md:w-80">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search categories
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Phones, Laptops, Accessories"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <p className="text-gray-600 text-sm">
              Please check your connection or contact the administrator.
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No categories found
            </h2>
            <p className="text-gray-600">
              Try clearing your search or come back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Tag className="w-5 h-5" />
                      </div>
                      <h2 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h2>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    View all second-hand products in the {category.name}{" "}
                    category.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm font-medium text-blue-600">
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    View products
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    -&gt;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
