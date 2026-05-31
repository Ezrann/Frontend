"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/src/components/products/ProductCard";
import { useTranslation } from "@/src/context/LanguageContext";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
  Sparkles,
  ArrowUpDown,
  ChevronDown,
  Check,
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
  seller_name?: string;
  created_at?: string;
  description?: string;
  location?: string;
  average_rating?: string | number;
  total_ratings?: string | number;
  images?: ProductImage[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const [search, setSearch] = useState(() => {
    const searchParam = searchParams.get("search");
    return searchParam ? decodeURIComponent(searchParam) : "";
  });
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("az");

  const itemsPerPage = 6;
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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

  const sortOptions = [
    { value: "az", label: t("productsPage.nameAz") },
    { value: "za", label: t("productsPage.nameZa") },
    { value: "low", label: t("productsPage.priceLowHigh") },
    { value: "high", label: t("productsPage.priceHighLow") },
  ];

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ?? t("productsPage.sortBy");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_55%,#e0f2fe_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                <Sparkles className="h-4 w-4" />
                Marketplace
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t("productsPage.title")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {t("productsPage.subtitle")}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 md:self-auto">
              <span>{sorted.length}</span>
              <span className="text-slate-400">items</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative z-30 overflow-visible rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("productsPage.showing", {
                    shown: paginated.length,
                    total: sorted.length,
                  })}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {hasActiveFilters ? t("productsPage.clearAll") : t("productsPage.subtitle")}
                </p>
              </div>

              <div className="relative self-start md:self-center">
                <button
                  type="button"
                  onClick={() => setSortMenuOpen((current) => !current)}
                  className="inline-flex min-w-56 items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                  aria-haspopup="menu"
                >
                  <span className="inline-flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-orange-500" />
                    {currentSortLabel}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {sortMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
                    <div className="border-b border-slate-200 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                      {t("productsPage.sortBy")}
                    </div>
                    <div className="py-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSortBy(option.value);
                            setSortMenuOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                        >
                          <span>{option.label}</span>
                          {sortBy === option.value && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-600">{t("productsPage.loading")}</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Package className="mx-auto mb-4 h-14 w-14 text-slate-400" />
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                {t("productsPage.emptyTitle")}
              </h3>
              <p className="mb-6 text-slate-600">
                {hasActiveFilters
                  ? t("productsPage.emptyFiltered")
                  : t("productsPage.emptyDefault")}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="rounded-xl bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {t("productsPage.clearAll")}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginated.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t("productsPage.previous")}
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
                              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                                page === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === page - 2 || pageNum === page + 2) {
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
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("productsPage.next")}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        </div>
    </div>
  );
}
