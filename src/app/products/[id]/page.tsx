"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Share2,
  Package,
  DollarSign,
  Tag,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Eye,
  Trash2,
  X,
} from "lucide-react";

interface ProductImage {
  id: number;
  path: string;
  url?: string;
  is_cover?: number;
}

interface Product {
  id: number;
  user_id?: number;
  category_id?: number;
  title: string;
  slug?: string;
  description?: string;
  price: string | number;
  product_condition: string;
  status?: string;
  views?: number;
  category_name?: string;
  seller_name?: string;
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const role = localStorage.getItem("role");
      const normalizedRole = role?.toLowerCase()?.trim();
      setIsAdmin(
        normalizedRole === "admin" || role === "Admin" || role === "ADMIN"
      );
    };

    checkAdmin();
    const interval = setInterval(checkAdmin, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `http://localhost:5001/api/products/${resolvedParams.id}`
        );

        if (!res.ok) {
          if (res.status === 404) {
            setError("Product not found");
          } else {
            setError("Failed to load product");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Product fetch error:", error);
        setError("Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchProduct();
    }
  }, [resolvedParams.id]);

  // Initialize favorite state based on wishlist
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!product) return;

      const token = localStorage.getItem("token");
      if (!token) {
        setIsFavorite(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5001/api/wishlists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        const isInWishlist = Array.isArray(data)
          ? data.some(
              (item: { product_id: number }) => item.product_id === product.id
            )
          : false;
        setIsFavorite(isInWishlist);
      } catch (err) {
        console.error("Check wishlist error:", err);
      }
    };

    checkFavoriteStatus();
  }, [product]);

  const handleToggleFavorite = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login?redirect=/products/" + resolvedParams.id);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/api/wishlists/${product.id}/toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update favorites");
      }

      const data = await res.json();
      const added = data.action === "added";
      setIsFavorite(added);
      setMessage(added ? "Saved to favorites" : "Removed from favorites");
      setTimeout(() => setMessage(""), 3000);

      // If added to favorites, navigate to favorites page
      if (added) {
        router.push("/favorites");
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
      setError("Failed to update favorites");
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text:
            product.description ||
            `Check out ${product.title} for $${product.price}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled");
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setMessage("Link copied to clipboard!");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !deleteReason.trim()) {
      setError("Please provide a reason for deletion");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const res = await fetch(
        `http://localhost:5001/api/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: deleteReason }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to delete product");
        setIsDeleting(false);
        return;
      }

      setMessage("Product deleted successfully");
      setShowDeleteModal(false);
      setDeleteReason("");

      // Redirect to products page after a short delay
      setTimeout(() => {
        router.push("/products");
      }, 1500);
    } catch (error) {
      console.error("Delete product error:", error);
      setError("Failed to delete product. Please try again.");
      setIsDeleting(false);
    }
  };

  const getImageUrl = (image: ProductImage | undefined) => {
    if (!image) return "/image/placeholder.png";
    // Use url if available, otherwise construct from path
    if (image.url) return image.url;
    return `http://localhost:5001/${image.path}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [{ id: 0, path: "" }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-md animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-md animate-fade-in">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                {images[selectedImageIndex] &&
                (images[selectedImageIndex].url ||
                  images[selectedImageIndex].path) ? (
                  <img
                    src={getImageUrl(images[selectedImageIndex])}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                    <p>No Image Available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {product.category_name && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {product.category_name}
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.product_condition === "new"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {product.product_condition === "new" ? "New" : "Used"}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-3">
                    {product.title}
                  </h1>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                      title="Delete Product (Admin)"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-xl transition-all ${
                      isFavorite
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={
                      isFavorite ? "Remove from favorites" : "Save to favorites"
                    }
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-bold text-blue-600">
                  $
                  {typeof product.price === "string"
                    ? parseFloat(product.price).toFixed(2)
                    : product.price}
                </span>
              </div>

              {/* Status and Views */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                {product.status && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : product.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {product.status.charAt(0).toUpperCase() +
                      product.status.slice(1)}
                  </span>
                )}
                {product.views !== undefined && (
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {product.views} {product.views === 1 ? "view" : "views"}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Product Details
              </h2>
              <div className="space-y-4">
                {product.description && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Condition</p>
                      <p className="font-semibold text-gray-800 capitalize">
                        {product.product_condition}
                      </p>
                    </div>
                  </div>
                  {product.category_name && (
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-semibold text-gray-800">
                          {product.category_name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Information */}
            {(product.seller_name || product.created_at) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Seller Information
                </h2>
                <div className="space-y-3">
                  {product.seller_name && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Seller</p>
                        <p className="font-semibold text-gray-800">
                          {product.seller_name}
                        </p>
                      </div>
                    </div>
                  )}
                  {product.created_at && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Listed on</p>
                        <p className="font-semibold text-gray-800">
                          {formatDate(product.created_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Product Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-600" />
                Delete Product
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason("");
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this product?
              </p>
              {product && (
                <p className="text-sm text-gray-600 font-medium mb-4">
                  Product: <span className="font-bold">{product.title}</span>
                </p>
              )}
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Deletion <span className="text-red-600">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please provide a reason for deleting this product. This will be sent to the product owner."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                This reason will be sent to the product owner via message.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason("");
                  setError("");
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting || !deleteReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
