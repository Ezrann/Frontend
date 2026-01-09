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
        const res = await fetch("http://localhost:5001/api/wishlists", {
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
        `http://localhost:5001/api/wishlists/${productId}`,
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
    return `http://localhost:5001/${cover}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Heart className="w-10 h-10 text-red-600 fill-current" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">My Favorites</h1>
              <p className="text-gray-600 mt-1">
                {wishlist.length} {wishlist.length === 1 ? "item" : "items"}{" "}
                saved
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {wishlist.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start saving products you love by clicking the heart icon!
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product_id)}
                  disabled={removingId === item.product_id}
                  className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-red-600 text-gray-600 hover:text-white rounded-full p-2 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from favorites"
                >
                  {removingId === item.product_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                <Link href={`/products/${item.product_id}`}>
                  {/* Product Image */}
                  <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={getImageUrl(item.cover)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/image/placeholder.png";
                      }}
                    />
                    {/* Heart Badge */}
                    <div className="absolute top-2 left-2 bg-red-600 text-white rounded-full p-1.5">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-lg font-bold text-red-600">
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
