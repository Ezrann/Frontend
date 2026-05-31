"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import type { DashboardAnalytics } from "../../../services/adminService";
import { fetchDashboardAnalytics } from "../../../services/adminService";
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Package,
  User,
  Users,
  Calendar,
  DollarSign,
  Tag,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  X,
  Activity,
  ShoppingCart,
  TrendingUp,
  Flag,
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

const emptyDashboardAnalytics: DashboardAnalytics = {
  users: {
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    regular: 0,
    newLast30Days: 0,
  },
  listings: {
    total: 0,
    active: 0,
    pending: 0,
    sold: 0,
    removed: 0,
    activeValue: 0,
    newLast30Days: 0,
  },
  sales: {
    totalSales: 0,
    totalRevenue: 0,
    averageSalePrice: 0,
    monthlySales: 0,
    monthlyRevenue: 0,
    soldRate: 0,
  },
  reports: {
    total: 0,
    open: 0,
  },
  recentListings: [],
  recentSales: [],
};

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState({
    totalProducts: null as number | null,
    pendingProducts: null as number | null,
    approvedProducts: null as number | null,
    rejectedProducts: null as number | null,
  });
  const [dashboardAnalytics, setDashboardAnalytics] =
    useState<DashboardAnalytics | null>(null);
  
  // Helper to map database status to display status
  const getDisplayStatus = (dbStatus: string) => {
    if (dbStatus === "active") return "approved";
    if (dbStatus === "removed") return "rejected";
    return dbStatus;
  };

  const getDbStatusForFilter = (value: "all" | "pending" | "approved" | "rejected") => {
    if (value === "approved") return "active";
    if (value === "rejected") return "removed";
    if (value === "pending") return "pending";
    return null;
  };

  const loadProductsByDbStatus = async (dbStatus: string | null) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
    if (dbStatus) {
      url.searchParams.set("status", dbStatus);
    }

    const res = await fetch(url.toString(), {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to load products (${dbStatus || "all"})`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [deleteProductTitle, setDeleteProductTitle] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectProductId, setRejectProductId] = useState<number | null>(null);
  const [rejectProductTitle, setRejectProductTitle] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Check admin authentication and fetch products
  useEffect(() => {
    const checkAdminAndFetch = async () => {
      let role: string | undefined;

      try {
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (profileRes.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          role = profileData.role;
          setCurrentRole(role || null);
        }
      } catch (err) {
        console.error("Failed to fetch admin profile:", err);
      }

      if (!role) {
        router.push("/auth/login");
        return;
      }

      // Check if role is admin (case-insensitive, trim whitespace)
      const normalizedRole = role?.toLowerCase()?.trim();

      // Also check for common variations
      const isAdminRole =
        normalizedRole === "admin" ||
        normalizedRole === "administrator";

      if (!isAdminRole) {
        setAccessDenied(true);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // User is admin
      setIsAdmin(true);
      setAccessDenied(false);
      await Promise.all([
        fetchProducts(),
        fetchTotalUsers(),
        fetchAnalytics(),
        fetchAdminAnalytics(),
      ]);
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

      const dbStatus = getDbStatusForFilter(filter);
      const statusesToLoad =
        filter === "all" ? ["active", "pending", "removed", "sold"] : [dbStatus];

      const loadedProducts = await Promise.all(
        statusesToLoad.map((statusValue) => loadProductsByDbStatus(statusValue))
      );

      setProducts(loadedProducts.flat());
    } catch (error) {
      console.error("Fetch products error:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setTotalUsers(null);
        return;
      }

      const data = await res.json();
      setTotalUsers(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error("Fetch total users error:", error);
      setTotalUsers(null);
    }
  };

  const fetchAdminAnalytics = async () => {
    try {
      const data = await fetchDashboardAnalytics();
      setDashboardAnalytics(data);
      setTotalUsers(data.users.total);
      setAnalytics({
        totalProducts: data.listings.total,
        pendingProducts: data.listings.pending,
        approvedProducts: data.listings.active,
        rejectedProducts: data.listings.removed,
      });
    } catch (analyticsError) {
      console.error("Fetch dashboard analytics error:", analyticsError);
      setDashboardAnalytics(null);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [approved, pending, rejected, sold] = await Promise.all([
        loadProductsByDbStatus("active"),
        loadProductsByDbStatus("pending"),
        loadProductsByDbStatus("removed"),
        loadProductsByDbStatus("sold"),
      ]);

      setAnalytics({
        totalProducts: approved.length + pending.length + rejected.length + sold.length,
        pendingProducts: pending.length,
        approvedProducts: approved.length,
        rejectedProducts: rejected.length,
      });
    } catch (analyticsError) {
      console.error("Fetch analytics error:", analyticsError);
      setAnalytics({
        totalProducts: null,
        pendingProducts: null,
        approvedProducts: null,
        rejectedProducts: null,
      });
    }
  };

  const handleApprove = async (productId: number) => {
    await updateProductStatus(productId, "approved");
  };

  const handleRejectClick = (product: Product) => {
    setRejectProductId(product.id);
    setRejectProductTitle(product.title);
    setRejectReason("");
    setShowRejectModal(true);
    setError("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectProductId || !rejectReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    await updateProductStatus(rejectProductId, "rejected", rejectReason.trim());
    setShowRejectModal(false);
    setRejectProductId(null);
    setRejectProductTitle("");
    setRejectReason("");
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${deleteProductId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: deleteReason }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = data.message || "Failed to delete product";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsDeleting(false);
        return;
      }

      setMessage("Product deleted successfully");
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
      setDeleteProductId(null);
      setDeleteProductTitle("");
      setDeleteReason("");
      
      // Refresh the products list
      setTimeout(() => {
        fetchProducts();
        fetchAnalytics();
      }, 500);
    } catch (error) {
      console.error("Delete product error:", error);
      const errorMessage = "Failed to delete product. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshDashboard = async () => {
    await Promise.all([
      fetchProducts(),
      fetchTotalUsers(),
      fetchAnalytics(),
      fetchAdminAnalytics(),
    ]);
    toast.success("Dashboard refreshed");
  };

  const updateProductStatus = async (
    productId: number,
    status: string,
    reason?: string
  ) => {
    try {
      setProcessingId(productId);
      setMessage("");
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, reason }),
        }
      );

      const contentType = res.headers.get("content-type");
      let data: { message?: string; error?: string } | null = null;

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
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
        setError(errorMessage);
        toast.error(errorMessage);
        setProcessingId(null);
        return;
      }

      setMessage(`Product ${status} successfully!`);
      toast.success(`Product ${status} successfully!`);
      setTimeout(() => setMessage(""), 3000);
      
      // Refresh the list after a short delay to ensure backend has processed
      setTimeout(() => {
        fetchProducts();
        fetchAnalytics();
      }, 500);
    } catch (error) {
      console.error("Update status error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update product status";
      setError(errorMessage);
      toast.error(errorMessage);
      setProcessingId(null);
    }
  };

  const getImageUrl = (image: ProductImage | undefined) => {
    if (!image) return "/image/placeholder.png";
    if (image.url) return image.url;
    if (image.path) return `${process.env.NEXT_PUBLIC_API_URL}/${image.path}`;
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

  const formatCurrency = (value: string | number | null | undefined) => {
    const numericValue = Number(value || 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(numericValue) ? numericValue : 0);
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

  const analyticsData = dashboardAnalytics ?? emptyDashboardAnalytics;

  // Show access denied message
  if (accessDenied && !loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page. Admin privileges
            required.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
            >
              Refresh
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
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
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
              <p className="mt-2 text-xs text-gray-400">
                Logged in as: {currentRole || "Unknown"}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
            >
              Back to Home
            </Link>
            <Link
              href="/admin/reports"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium"
            >
              View Reports
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
                Total users
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardAnalytics ? analyticsData.users.total : totalUsers ?? "--"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {analyticsData.users.newLast30Days} new in the last 30 days
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-cyan-700 shadow-sm">
                <Activity className="h-6 w-6" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                Active listings
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardAnalytics
                  ? analyticsData.listings.active
                  : analytics.approvedProducts ?? "--"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatCurrency(analyticsData.listings.activeValue)} listed value
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-amber-700 shadow-sm">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-600">
                Pending
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {analytics.pendingProducts === null ? "--" : analytics.pendingProducts}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Waiting for moderation
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-emerald-700 shadow-sm">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
                Total sales
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardAnalytics ? analyticsData.sales.totalSales : "--"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatCurrency(analyticsData.sales.totalRevenue)} revenue
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-indigo-700 shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">
                This month
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardAnalytics ? analyticsData.sales.monthlySales : "--"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatCurrency(analyticsData.sales.monthlyRevenue)} sold this month
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-red-700 shadow-sm">
                <Flag className="h-6 w-6" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-red-600">
                Open reports
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardAnalytics ? analyticsData.reports.open : "--"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {analyticsData.reports.total} reports in total
              </p>
            </div>
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
              onClick={refreshDashboard}
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
                            onClick={() => handleRejectClick(product)}
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
                aria-label="Close"
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

      {/* Reject Product Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                Reject Product
              </h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectProductId(null);
                  setRejectProductTitle("");
                  setRejectReason("");
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Please provide the reason for rejecting this product.
              </p>
              {rejectProductTitle && (
                <p className="text-sm text-gray-600 font-medium mb-4">
                  Product: <span className="font-bold">{rejectProductTitle}</span>
                </p>
              )}
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain clearly why this product is rejected. This reason will be sent to the seller."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                rows={4}
                required
              />
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
                  setShowRejectModal(false);
                  setRejectProductId(null);
                  setRejectProductTitle("");
                  setRejectReason("");
                  setError("");
                }}
                disabled={processingId !== null}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={processingId !== null || !rejectReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {processingId !== null ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject Product
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
