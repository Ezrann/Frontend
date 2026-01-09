"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Package,
  User,
  Calendar,
  DollarSign,
  Tag,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
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
  title: string;
  description?: string;
  price: string | number;
  product_condition: string;
  status: string;
  category_name?: string;
  seller_name?: string;
  user_id?: number;
  category_id?: number;
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Helper to map database status to display status
  const getDisplayStatus = (dbStatus: string) => {
    if (dbStatus === "active") return "approved";
    if (dbStatus === "removed") return "rejected";
    return dbStatus;
  };
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [deleteProductTitle, setDeleteProductTitle] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Check admin authentication and fetch products
  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const token = localStorage.getItem("token");
      let role = localStorage.getItem("role");

      console.log("=== ADMIN DASHBOARD CHECK ===");
      console.log("Token exists:", !!token);
      console.log("Raw role from localStorage:", role);
      console.log("Role type:", typeof role);
      console.log("Role length:", role?.length);

      if (!token) {
        console.log("No token found, redirecting to login...");
        router.push("/auth/login");
        return;
      }

      // If role not in localStorage, fetch from API
      if (!role) {
        console.log("⚠️ Role not in localStorage, fetching from API...");
        try {
          const profileRes = await fetch("http://localhost:5001/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            role = profileData.role;
            if (role) {
              localStorage.setItem("role", role);
              // Also set cookie for middleware
              document.cookie = `role=${role}; path=/; max-age=${
                7 * 24 * 60 * 60
              }; SameSite=Lax`;
              console.log("✅ Role fetched from API and saved:", role);
            }
          }
        } catch (err) {
          console.error("Failed to fetch role from API:", err);
        }
      }

      // Check if role is admin (case-insensitive, trim whitespace)
      const normalizedRole = role?.toLowerCase()?.trim();
      console.log("Normalized role:", normalizedRole);
      console.log("Is admin?", normalizedRole === "admin");

      // Also check for common variations
      const isAdminRole =
        normalizedRole === "admin" ||
        normalizedRole === "administrator" ||
        role === "Admin" ||
        role === "ADMIN";

      console.log("Final admin check result:", isAdminRole);

      if (!isAdminRole) {
        console.log("❌ Not an admin user, setting access denied...");
        console.log("Current role value:", JSON.stringify(role));
        setAccessDenied(true);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // User is admin
      console.log("✅ User is admin, proceeding to fetch products...");
      setIsAdmin(true);
      setAccessDenied(false);
      await fetchProducts();
    };

    checkAdminAndFetch();
  }, [router]);

  // Fetch products when filter changes (only if admin)
  useEffect(() => {
    if (isAdmin && !accessDenied) {
      fetchProducts();
    }
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Fetch all products or filtered by status
      // Map frontend filter values to database status values
      let url = "http://localhost:5001/api/products";
      if (filter !== "all") {
        let dbStatus = filter;
        if (filter === "approved") {
          dbStatus = "active";
        } else if (filter === "rejected") {
          dbStatus = "removed";
        }
        url += `?status=${dbStatus}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        setError("Failed to load products");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch products error:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: number) => {
    await updateProductStatus(productId, "approved");
  };

  const handleReject = async (productId: number) => {
    await updateProductStatus(productId, "rejected");
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteProductId(product.id);
    setDeleteProductTitle(product.title);
    setDeleteReason("");
    setShowDeleteModal(true);
    setError("");
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId || !deleteReason.trim()) {
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
        `http://localhost:5001/api/products/${deleteProductId}`,
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
      setDeleteProductId(null);
      setDeleteProductTitle("");
      setDeleteReason("");
      
      // Refresh the products list
      setTimeout(() => {
        fetchProducts();
      }, 500);
    } catch (error) {
      console.error("Delete product error:", error);
      setError("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const updateProductStatus = async (productId: number, status: string) => {
    try {
      setProcessingId(productId);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      console.log("Updating product", productId, "to status:", status);

      const res = await fetch(
        `http://localhost:5001/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      console.log("Update response status:", res.status);
      console.log("Update response ok:", res.ok);

      const contentType = res.headers.get("content-type");
      let data: any = null;

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
          console.log("Update response data:", data);
        } catch (e) {
          console.error("Failed to parse JSON response:", e);
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
      }

      if (!res.ok) {
        const errorMessage =
          data?.message || data?.error || `Failed to ${status} product (${res.status})`;
        console.error("Update failed:", errorMessage);
        setError(errorMessage);
        setProcessingId(null);
        return;
      }

      console.log("Product status updated successfully!");
      setMessage(`Product ${status} successfully!`);
      setTimeout(() => setMessage(""), 3000);
      
      // Refresh the list after a short delay to ensure backend has processed
      setTimeout(() => {
        fetchProducts();
      }, 500);
    } catch (error) {
      console.error("Update status error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update product status"
      );
      setProcessingId(null);
    }
  };

  const getImageUrl = (image: ProductImage | undefined) => {
    if (!image) return "/image/placeholder.png";
    if (image.url) return image.url;
    if (image.path) return `http://localhost:5001/${image.path}`;
    return "/image/placeholder.png";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.seller_name?.toLowerCase().includes(query)
    );
  });

  // Show access denied message
  if (accessDenied && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Admin privileges
            required.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left text-sm">
            <p className="font-semibold mb-2">Debug Info:</p>
            <p>
              Token: {localStorage.getItem("token") ? "✓ Present" : "✗ Missing"}
            </p>
            <p>Role (localStorage): {localStorage.getItem("role") || "Not set"}</p>
            <p>Is Admin: {isAdmin ? "Yes" : "No"}</p>
            <p className="mt-2 text-xs text-gray-500">
              If you're an admin but seeing this, try refreshing the page or logging out and back in.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                if (token) {
                  try {
                    const res = await fetch("http://localhost:5001/api/users/me", {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.role) {
                        localStorage.setItem("role", data.role);
                        document.cookie = `role=${data.role}; path=/; max-age=${
                          7 * 24 * 60 * 60
                        }; SameSite=Lax`;
                        window.location.reload();
                      }
                    }
                  } catch (err) {
                    console.error("Failed to refresh role:", err);
                  }
                }
              }}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
            >
              Refresh Role
            </button>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading && products.length === 0 && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Shield className="w-10 h-10 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Review and manage products submitted by users
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-400">
                  Logged in as: {localStorage.getItem("role") || "Unknown"}
                </p>
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>
                    Debug: Token={localStorage.getItem("token") ? "✓" : "✗"},
                    Admin={isAdmin ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-md animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-md animate-fade-in">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "rejected"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Rejected
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchQuery
                  ? "No products found matching your search."
                  : `No ${filter === "all" ? "" : filter} products found.`}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Product Image */}
                  <div className="lg:col-span-1">
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-800">
                            {product.title}
                          </h2>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              product.status === "active" || product.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : product.status === "removed" || product.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {getDisplayStatus(product.status).charAt(0).toUpperCase() +
                              getDisplayStatus(product.status).slice(1)}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Product Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="font-semibold text-blue-600">
                            $
                            {typeof product.price === "string"
                              ? parseFloat(product.price).toFixed(2)
                              : product.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Condition</p>
                          <p className="font-semibold capitalize">
                            {product.product_condition}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="font-semibold">
                            {product.category_name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Seller</p>
                          <p className="font-semibold">
                            {product.seller_name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Posted: {formatDate(product.created_at)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t flex-wrap">
                      <Link
                        href={`/products/${product.id}`}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                      {(product.status === "pending" || product.status === "Pending") && (
                        <>
                          <button
                            onClick={() => handleApprove(product.id)}
                            disabled={processingId === product.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                          >
                            {processingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(product.id)}
                            disabled={processingId === product.id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                          >
                            {processingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteClick(product)}
                        disabled={processingId === product.id || isDeleting}
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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
                  setDeleteProductId(null);
                  setDeleteProductTitle("");
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
              {deleteProductTitle && (
                <p className="text-sm text-gray-600 font-medium mb-4">
                  Product: <span className="font-bold">{deleteProductTitle}</span>
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
                  setDeleteProductId(null);
                  setDeleteProductTitle("");
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
                    <Loader2 className="w-4 h-4 animate-spin" />
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
