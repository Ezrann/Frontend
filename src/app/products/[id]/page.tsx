"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronLeft,
  Heart,
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
  Phone,
  Sparkles,
  Star,
  MessageSquareText,
  Send,
  ChevronRight,
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
  seller_phone?: string;
  average_rating?: number;
  total_ratings?: number;
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

interface RelatedProduct {
  id: number;
  title: string;
  price: string | number;
  location?: string;
  created_at?: string;
  images?: ProductImage[];
}

interface ProductRating {
  id: number;
  score: number;
  comment?: string;
  created_at?: string;
  rater_name?: string;
}

interface RatingSummary {
  totalRatings: number;
  averageScore: number;
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [productRatings, setProductRatings] = useState<ProductRating[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    totalRatings: 0,
    averageScore: 0,
  });
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingMessage, setRatingMessage] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("fake_product");
  const [reportDetail, setReportDetail] = useState("");
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          setIsAdmin(false);
          return;
        }

        const user = await res.json();
        setCurrentUserId(user.id || null);
        const normalizedRole = user.role?.toLowerCase()?.trim();
        setIsAdmin(normalizedRole === "admin");
      } catch {
        setCurrentUserId(null);
        setIsAdmin(false);
      }
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${resolvedParams.id}`
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

  useEffect(() => {
    const fetchProductRatings = async () => {
      if (!product) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ratings/product/${product.id}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          setProductRatings([]);
          setRatingSummary({ totalRatings: 0, averageScore: 0 });
          return;
        }

        const data = await res.json();
        setProductRatings(Array.isArray(data.ratings) ? data.ratings : []);
        setRatingSummary(data.summary || { totalRatings: 0, averageScore: 0 });
      } catch (ratingFetchError) {
        console.error("Product ratings fetch error:", ratingFetchError);
        setProductRatings([]);
        setRatingSummary({ totalRatings: 0, averageScore: 0 });
      }
    };

    fetchProductRatings();
  }, [product]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.category_name) {
        setRelatedProducts([]);
        return;
      }

      try {
        setIsRelatedLoading(true);
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        url.searchParams.set("category", product.category_name);

        const res = await fetch(url.toString());
        if (!res.ok) {
          setRelatedProducts([]);
          return;
        }

        const data = await res.json();
        const normalized = Array.isArray(data) ? data : [];
        setRelatedProducts(
          normalized
            .filter((item: RelatedProduct) => item.id !== product.id)
            .slice(0, 6)
        );
      } catch {
        setRelatedProducts([]);
      } finally {
        setIsRelatedLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // Initialize favorite state based on wishlist
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!product) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlists`, {
          credentials: "include",
        });

        if (!res.ok) {
          setIsFavorite(false);
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

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/wishlists/${product.id}/toggle`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login?redirect=/products/" + resolvedParams.id);
          return;
        }
        throw new Error("Failed to update favorites");
      }

      const data = await res.json();
      const added = data.action === "added";
      setIsFavorite(added);
      setMessage(added ? "Saved to favorites" : "Removed from favorites");
      setTimeout(() => setMessage(""), 3000);
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
      } catch {
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${product.id}`,
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
    return `${process.env.NEXT_PUBLIC_API_URL}/${image.path}`;
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Recently";

    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price;
    if (Number.isNaN(numericPrice)) {
      return String(price);
    }

    return numericPrice.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(numericPrice) ? 0 : 2,
      maximumFractionDigits: Number.isInteger(numericPrice) ? 0 : 2,
    });
  };

  const conditionLabel =
    product?.product_condition === "new" ? "New" : "Used";

  const backHref = isAdmin ? "/admin/dashboard" : "/products";
  const backLabel = isAdmin ? "Back to Admin Dashboard" : "Back to Products";

  const renderStars = (score: number, sizeClass = "h-4 w-4") => {
    return Array.from({ length: 5 }, (_, index) => {
      const active = index < Math.round(score);
      return (
        <Star
          key={index}
          className={`${sizeClass} ${active ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      );
    });
  };

  const parseSpecsFromDescription = (desc?: string) => {
    if (!desc) return [] as { label: string; value: string }[];
    const lines = desc
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.includes(":") && l.split(":").length > 1);
    return lines.map((l) => {
      const [k, ...rest] = l.split(":");
      return { label: k.trim(), value: rest.join(":").trim() };
    });
  };

  const handleSubmitRating = async () => {
    if (!product) return;

    setRatingError("");
    setRatingMessage("");

    if (!ratingScore) {
      setRatingError("Please choose a rating before submitting.");
      return;
    }

    if (currentUserId && product.user_id && currentUserId === product.user_id) {
      setRatingError("You cannot rate your own product.");
      return;
    }

    setIsRatingSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ratings/product/${product.id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score: ratingScore,
            comment: ratingComment.trim(),
          }),
        }
      );

      if (res.status === 401) {
        router.push(`/auth/login?redirect=/products/${resolvedParams.id}`);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setRatingError(data.message || "Failed to submit rating.");
        return;
      }

      setProductRatings(Array.isArray(data.ratings) ? data.ratings : []);
      setRatingSummary(data.summary || { totalRatings: 0, averageScore: 0 });
      setRatingScore(0);
      setRatingComment("");
      setRatingMessage("Rating submitted successfully.");
      toast.success("Rating submitted successfully.");
      setTimeout(() => setRatingMessage(""), 3000);
    } catch (submitError) {
      const errorMessage =
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit rating.";
      setRatingError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!product) return;

    setReportError("");
    setReportMessage("");

    if (!reportReason.trim()) {
      setReportError("Please choose a report reason.");
      return;
    }

    setIsReportSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          reason: reportReason,
          detail: reportDetail.trim(),
        }),
      });

      if (res.status === 401) {
        router.push(`/auth/login?redirect=/products/${resolvedParams.id}`);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setReportError(data.message || "Failed to submit report.");
        return;
      }

      setReportMessage("Report sent to the admin team.");
      toast.success("Report sent to the admin team.");
      setShowReportModal(false);
      setReportReason("fake_product");
      setReportDetail("");
      setTimeout(() => setReportMessage(""), 3000);
    } catch (submitError) {
      const errorMessage =
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit report.";
      setReportError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
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
  const currentImage = images[selectedImageIndex] ?? images[0];
  const displayPrice = formatPrice(product.price);
  const locationLabel = product.location || "Phnom Penh";
  const sellerName = product.seller_name || "Seller";
  const sellerInitials = sellerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "S")
    .join("");
  const sellerAverageRating = Number(product.average_rating ?? ratingSummary.averageScore ?? 0);
  const sellerReviewCount = Number(product.total_ratings ?? ratingSummary.totalRatings ?? 0);
  const sellerBadgeLabel =
    sellerReviewCount > 0 && sellerAverageRating >= 4.5
      ? "Top rated seller"
      : product.seller_phone
        ? "Available by phone"
        : "Seller";
  const statusLabel = product.status || "active";
  const listingStats = [
    { label: "Condition", value: conditionLabel, icon: Tag },
    { label: "Location", value: locationLabel, icon: MapPin },
    { label: "Posted", value: formatDate(product.created_at), icon: Calendar },
    { label: "Views", value: `${product.views ?? 0}`, icon: Eye },
  ];
  const listingDetails = [
    { label: "Category", value: product.category_name || "General" },
    { label: "Status", value: statusLabel.replace(/_/g, " ") },
    { label: "Seller", value: sellerName },
    { label: "Contact", value: product.seller_phone || "Not shared" },
  ];
  const parsedSpecs = parseSpecsFromDescription(product.description);
  const highlights = [
    `Transparent ${conditionLabel.toLowerCase()} listing with upfront pricing`,
    product.location
      ? `Located in ${locationLabel} for easy pickup or delivery`
      : "Easy to review against similar listings",
    product.seller_phone
      ? "Tap the seller button to place a quick call"
      : "Seller contact can be viewed from the profile card",
  ];
  const safetyTips = [
    "Meet in a public place when possible.",
    "Check the item carefully before you buy it.",
    "Use secure payment methods and keep a record of the chat.",
  ];

  const handlePreviousImage = () => {
    if (!images.length) return;
    setSelectedImageIndex(
      (currentIndex) => (currentIndex - 1 + images.length) % images.length
    );
  };

  const handleNextImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((currentIndex) => (currentIndex + 1) % images.length);
  };

  const handleContactSeller = () => {
    if (product.seller_phone) {
      window.location.href = `tel:${product.seller_phone}`;
      return;
    }

    document
      .getElementById("seller-information")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

            <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                isFavorite
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
            >
              <AlertCircle className="h-4 w-4" />
              Report listing
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="transition hover:text-blue-700">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="transition hover:text-blue-700">
            Listings
          </Link>
          <span>/</span>
          <span className="max-w-56 truncate text-slate-900">
            {product.category_name || product.title}
          </span>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-800 shadow-sm animate-fade-in">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm animate-fade-in">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <span>Home</span>
                  <span>/</span>
                  <span>Listings</span>
                  <span>/</span>
                  <span className="text-blue-700">{product.category_name || "All categories"}</span>
                </div>
              </div>

              <div className="relative aspect-4/3 bg-slate-100">
                {currentImage && (currentImage.url || currentImage.path) ? (
                  <img
                    src={getImageUrl(currentImage)}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-slate-400">
                    <div>
                      <ImageIcon className="mx-auto mb-3 h-16 w-16" />
                      <p className="font-medium">No image available</p>
                    </div>
                  </div>
                )}

                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                  <span>{selectedImageIndex + 1}/{images.length}</span>
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePreviousImage}
                      aria-label="Previous image"
                      className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next image"
                      className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setMessage("Open the image in a larger view from the gallery below.")}
                  className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-slate-900"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Expand
                </button>
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto border-t border-slate-200 p-4 sm:p-5">
                  {images.map((image, index) => (
                    <button
                      key={image.id || index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      title={`View image ${index + 1}`}
                      aria-label={`View image ${index + 1}`}
                      className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                        selectedImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-blue-200"
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.title} - image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Specifications
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Listing details
                  </h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                  {statusLabel.replace(/_/g, " ")}
                </span>
              </div>

              {parsedSpecs.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-2">
                  {parsedSpecs.map((spec, idx) => (
                    <div
                      key={spec.label}
                      className={`flex items-start justify-between gap-4 px-4 py-3 ${idx < parsedSpecs.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-full bg-slate-50 p-2 text-slate-500">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-400 truncate">{spec.label}</p>
                        </div>
                      </div>

                      <div className="ml-4 flex-1 text-right">
                        <p className="text-sm font-semibold text-slate-900">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {listingDetails.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">
                        {item.label === "Category" ? (
                          <Package className="h-4 w-4" />
                        ) : item.label === "Seller" ? (
                          <User className="h-4 w-4" />
                        ) : item.label === "Contact" ? (
                          <Phone className="h-4 w-4" />
                        ) : (
                          <Tag className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-0.5 font-semibold text-slate-900">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Description
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">About this item</h2>
              <div className="mt-4 space-y-4">
                {product.description ? (
                  <p className="max-w-4xl whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm leading-7 text-slate-500">
                    The seller has not added a description yet.
                  </p>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Condition
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {conditionLabel}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Category
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {product.category_name || "General"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Posted
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatDate(product.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold text-blue-700">{product.category_name || "Listings"}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {product.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                  <CheckCircle className="h-4 w-4" />
                  In stock
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700">
                  {conditionLabel}
                </span>
              </div>

              <div className="mt-5 flex items-end gap-2 border-y border-slate-200 py-5">
                <DollarSign className="mb-1 h-8 w-8 text-blue-600" />
                <span className="text-4xl font-bold tracking-tight text-blue-600">
                  ${displayPrice}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {listingStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="inline-flex rounded-xl bg-white p-2 text-slate-500 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Why you will love it
                </p>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  {highlights.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleContactSeller}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <MessageSquareText className="h-4 w-4" />
                  Contact Seller
                </button>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-semibold transition ${
                    isFavorite
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Saved" : "Save"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <AlertCircle className="h-4 w-4" />
                  Report
                </button>
              </div>

            </section>

            {(product.seller_name || product.seller_phone || product.created_at) && (
              <section id="seller-information" className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Seller Information
                </p>

                <div className="mt-4 flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                    {sellerInitials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        {sellerName}
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {sellerBadgeLabel}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        {renderStars(sellerAverageRating, "h-4 w-4")}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {sellerAverageRating > 0 ? sellerAverageRating.toFixed(1) : "New"}
                      </span>
                      <span>
                        {sellerReviewCount > 0
                          ? `${sellerReviewCount} review${sellerReviewCount === 1 ? "" : "s"}`
                          : "No reviews yet"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3 py-2">
                    <Phone className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Contact</p>
                      {product.seller_phone ? (
                        <a
                          href={`tel:${product.seller_phone}`}
                          className="mt-1 block font-semibold text-slate-900 transition hover:text-blue-700"
                        >
                          {product.seller_phone}
                        </a>
                      ) : (
                        <p className="mt-1 font-semibold text-slate-900">Message via listing</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-2">
                    <MapPin className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Location</p>
                      <p className="mt-1 font-semibold text-slate-900">{locationLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-2">
                    <Calendar className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Listed</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatDate(product.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-2">
                    <Eye className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Views</p>
                      <p className="mt-1 font-semibold text-slate-900">{product.views ?? 0}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContactSeller}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <MessageSquareText className="h-4 w-4" />
                  Contact Seller
                </button>
                
              </section>
            )}

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Safety Tips
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Buy safely</h2>
              <div className="mt-4 space-y-3">
                {safetyTips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Reviews
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Product Ratings</h2>
              <p className="mt-2 text-sm text-slate-500">
                Feedback from buyers who rated this listing.
              </p>
            </div>

            <div className="rounded-3xl bg-blue-50 px-5 py-4 text-center">
              <div className="flex items-center justify-center gap-1">
                {renderStars(Number(ratingSummary.averageScore), "h-5 w-5")}
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {Number(ratingSummary.averageScore).toFixed(1)}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {ratingSummary.totalRatings} review{ratingSummary.totalRatings === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {ratingMessage && (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              {ratingMessage}
            </div>
          )}

          {reportMessage && (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              {reportMessage}
            </div>
          )}

          {ratingError && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {ratingError}
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Leave a rating</p>
              <p className="mt-1 text-sm text-slate-500">
                Share a quick score and an optional comment.
              </p>

              {currentUserId && product.user_id && currentUserId === product.user_id ? (
                <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                  You cannot rate your own product.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">Your score</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 5 }, (_, index) => {
                        const value = index + 1;
                        const active = value <= ratingScore;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRatingScore(value)}
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                              active
                                ? "border-amber-300 bg-amber-50 text-amber-500"
                                : "border-slate-200 bg-white text-slate-300 hover:border-amber-200 hover:text-amber-400"
                            }`}
                            aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                          >
                            <Star className={`h-5 w-5 ${active ? "fill-amber-400" : ""}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Comment
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(event) => setRatingComment(event.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="What did you think about this product?"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitRating}
                    disabled={isRatingSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <Send className="h-4 w-4" />
                    {isRatingSubmitting ? "Submitting..." : "Submit rating"}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {productRatings.length > 0 ? (
                productRatings.map((rating) => (
                  <div key={rating.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {rating.rater_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(rating.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(Number(rating.score), "h-4 w-4")}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {rating.comment}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No ratings yet. Be the first to rate this product.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-4xl border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Report product</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Report fake listings or products you are not sure about. The admin team will review it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close report dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reportError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {reportError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                  title="Report reason"
                  aria-label="Report reason"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                >
                  <option value="fake_product">Fake product</option>
                  <option value="not_sure">Not sure about authenticity</option>
                  <option value="misleading">Misleading description or price</option>
                  <option value="other">Other concern</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Details
                </label>
                <textarea
                  value={reportDetail}
                  onChange={(event) => setReportDetail(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  placeholder="Add any details that may help the admin review this listing."
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={isReportSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <AlertCircle className="h-4 w-4" />
                {isReportSubmitting ? "Sending..." : "Send report"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                title="Close delete dialog"
                aria-label="Close delete dialog"
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
