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
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login?redirect=/favorites");
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlists`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setRemovingId(productId);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wishlists/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    if (!cover) return "/image/placeholder.png";
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
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 transform hover:-translate-y-2"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product_id)}
                  disabled={removingId === item.product_id}
                  className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-red-600 text-gray-600 hover:text-white rounded-full p-2.5 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl"
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
                  <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                    <img
                      src={getImageUrl(item.cover)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/image/placeholder.png";
                      }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    
                    {/* Heart Badge */}
                    <div className="absolute top-3 left-3 bg-linear-to-r from-red-600 to-pink-600 text-white rounded-full p-2.5 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-3 text-base group-hover:text-red-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold bg-linear-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                        $
                        {typeof item.price === "string"
                          ? parseFloat(item.price).toFixed(2)
                          : Number(item.price).toFixed(2)}
                      </p>
                      <span className="text-xs text-gray-400 font-medium">USD</span>
                    </div>
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
