"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Trash2,
  ArrowLeft,
  Package,
  Loader2,
  AlertCircle,
  Star,
} from "lucide-react";

interface WishlistItem {
  id: number;
  product_id: number;
  title: string;
  price: string | number;
  slug: string;
  cover: string | null;
  created_at: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlists`, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/auth/login?redirect=/favorites");
            return;
          }
          throw new Error("Failed to fetch favorites");
        }

        const data = await res.json();
        setWishlist(data);
      } catch (err) {
        console.error("Fetch wishlist error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load favorites"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const handleRemove = async (productId: number) => {
    try {
      setRemovingId(productId);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wishlists/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to remove from favorites");
      }

      // Remove from local state
      setWishlist(wishlist.filter((item) => item.product_id !== productId));
    } catch (err) {
      console.error("Remove wishlist error:", err);
      setError("Failed to remove item from favorites");
    } finally {
      setRemovingId(null);
    }
  };

  const getImageUrl = (cover: string | null) => {
    if (!cover) return "/images/hero.png";
    if (cover.startsWith("http")) return cover;
    return `${process.env.NEXT_PUBLIC_API_URL}/${cover}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-linear-to-r from-red-500 to-pink-500 rounded-full opacity-20 blur-lg"></div>
            <Loader2 className="w-20 h-20 animate-spin text-red-600 relative" />
          </div>
          <p className="text-gray-700 font-medium">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-all duration-300 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
          
          <div className="flex items-start gap-4 md:gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-2xl opacity-10 blur-xl"></div>
              <div className="relative bg-linear-to-br from-red-500 to-pink-600 rounded-2xl p-4 shadow-lg">
                <Heart className="w-12 h-12 text-white fill-current" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-gray-900 mb-2">My Favorites</h1>
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-linear-to-r from-red-500 to-pink-500 rounded-full"></div>
                <p className="text-gray-600 font-medium">
                  {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center gap-3 shadow-md">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {wishlist.length === 0 && !error && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-12 md:p-16 text-center max-w-2xl mx-auto">
              {/* Animated Heart Icon */}
              <div className="mb-8 flex justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 bg-linear-to-r from-red-200 to-pink-200 rounded-full opacity-30 animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="w-24 h-24 text-red-200 stroke-2" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                No favorites yet
              </h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Your heart is ready, but your favorites list is empty! Discover amazing second-hand products and add them to your collection.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Click the heart icon on any product to save it here
              </p>
              
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Package className="w-5 h-5" />
                Browse Products
              </Link>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product_id)}
                  disabled={removingId === item.product_id}
                  className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2.5 text-gray-600 shadow transition-all duration-300 hover:bg-red-600 hover:text-white"
                  title="Remove from favorites"
                >
                  {removingId === item.product_id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>

                <Link href={`/products/${item.product_id}`}>
                  {/* Product Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(item.cover)}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/images/hero.png";
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3 p-5">
                    <h3 className="line-clamp-2 text-2xl font-extrabold uppercase leading-tight text-slate-950">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1 text-orange-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${index < 4 ? "fill-orange-500" : ""}`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-slate-600">4.6</span>
                    </div>

                    <p className="text-5xl font-black tracking-tight text-slate-950">
                      $
                      {typeof item.price === "string"
                        ? parseFloat(item.price).toFixed(2)
                        : Number(item.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
