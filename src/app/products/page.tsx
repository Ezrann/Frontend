"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "../../components/ProductCard";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  Tag,
  Loader2,
} from "lucide-react";

interface ProductImage {
  id?: number;
  path?: string;
  url?: string;
  is_cover?: number;
}

interface Product {
  id: number;
  title: string;
  price: string | number;
  product_condition: string;
  category_name?: string;
  images?: ProductImage[];
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("az");

  // Pagination
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);

  // Sync filters with URL query parameters (search, category)
  useEffect(() => {
    const searchParam = searchParams.get("search");
    const categoryParam = searchParams.get("category");

    setSearch(searchParam ? decodeURIComponent(searchParam) : "");
    setCategory(categoryParam ?? "");
    setPage(1);
  }, [searchParams]);

  // â­ Fetch Categories (Dynamic)
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.log("Category fetch error:", error);
      }
    }
    fetchCategories();
  }, []);

  // â­ Fetch Products Based on Filters
  useEffect(() => {
    async function fetchData() {
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);

        if (search) url.searchParams.append("q", search);
        if (category) url.searchParams.append("category", category);
        if (condition) url.searchParams.append("condition", condition);
        if (minPrice) url.searchParams.append("minPrice", minPrice);
        if (maxPrice) url.searchParams.append("maxPrice", maxPrice);

        const res = await fetch(url.toString());
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.log("Fetch error:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, [search, category, condition, minPrice, maxPrice]);

  // â­ Local Sorting
  const sorted = [...products].sort((a, b) => {
    if (sortBy === "az") return a.title.localeCompare(b.title);
    if (sortBy === "za") return b.title.localeCompare(a.title);
    if (sortBy === "low") {
      const priceA =
        typeof a.price === "string" ? parseFloat(a.price) : a.price;
      const priceB =
        typeof b.price === "string" ? parseFloat(b.price) : b.price;
      return priceA - priceB;
    }
    if (sortBy === "high") {
      const priceA =
        typeof a.price === "string" ? parseFloat(a.price) : a.price;
      const priceB =
        typeof b.price === "string" ? parseFloat(b.price) : b.price;
      return priceB - priceA;
    }
    return 0;
  });

  // â­ Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Check if any filters are active
  const hasActiveFilters =
    search || category || condition || minPrice || maxPrice;

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Products
          </h1>
          <p className="text-gray-600">
            Discover amazing second-hand electronics in Cambodia
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ---- FILTER SIDEBAR ---- */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => {
                    setCondition(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">Any Condition</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="az">Name A-Z</option>
                  <option value="za">Name Z-A</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* ---- PRODUCT GRID ---- */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {paginated.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">
                    {sorted.length}
                  </span>{" "}
                  products
                </p>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  {search && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Search: {search}
                    </span>
                  )}
                  {category && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {
                        categories.find((c) => c.id.toString() === category)
                          ?.name
                      }
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading products...</p>
              </div>
            ) : paginated.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results"
                    : "Check back later for new products"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginated.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => {
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= page - 1 && pageNum <= page + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                  page === pageNum
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (
                            pageNum === page - 2 ||
                            pageNum === page + 2
                          ) {
                            return (
                              <span key={pageNum} className="px-2">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
