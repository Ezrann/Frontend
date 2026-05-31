"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, MessageCircle, Star, User } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";

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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();

  // Helper function to get image URL
  const getImageUrl = (image: ProductImage | undefined) => {
    if (!image) return "/images/hero.png";
    // Use url if available (full URL), otherwise construct from path
    if (image.url) return image.url;
    if (image.path) return `${process.env.NEXT_PUBLIC_API_URL}/${image.path}`;
    return "/images/hero.png";
  };

  const firstImage =
    product.images && product.images.length > 0 ? product.images[0] : undefined;
  const imageUrl = getImageUrl(firstImage);

  const priceNumber =
    typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const price = Number.isFinite(priceNumber)
    ? new Intl.NumberFormat("en-US", {
        maximumFractionDigits: Number.isInteger(priceNumber) ? 0 : 2,
      }).format(priceNumber)
    : product.price;
  const ratingValue = Number(product.average_rating ?? 0);
  const totalRatings = Number(product.total_ratings ?? 0);
  const conditionLabel = product.product_condition
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const postedAt = formatRelativeTime(product.created_at);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
    >
      <div className="relative aspect-[1.85/1] w-full overflow-hidden bg-neutral-950">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = "/images/hero.png";
          }}
        />
        <div className="absolute left-4 top-4 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white shadow-sm">
          {conditionLabel}
        </div>
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 shadow">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-950">
          {product.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4 fill-pink-500 text-pink-500" />
            <span>{product.location || "Phnom Penh"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-2xl font-black tracking-tight text-slate-950">
            ${price}
          </p>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-slate-700">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{ratingValue.toFixed(1)}</span>
            <span className="text-xs font-medium text-slate-400">
              ({totalRatings})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex min-w-0 items-center gap-1.5">
            <User className="h-4 w-4 fill-violet-700 text-violet-700" />
            <span className="truncate">{product.seller_name || "Seller"}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>{postedAt}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < Math.round(ratingValue) ? "fill-amber-400" : ""
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {totalRatings > 0 ? `${totalRatings} rating${totalRatings === 1 ? "" : "s"}` : "No ratings yet"}
          </span>
        </div>

        <p className="line-clamp-1 text-xs text-slate-400">
          {product.description || `${product.category_name || t("product.uncategorized")} marketplace listing`}
        </p>

        <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-blue-700">
          <MessageCircle className="h-4 w-4" />
          Contact Seller
        </span>
      </div>
    </Link>
  );
}

function formatRelativeTime(dateValue?: string) {
  if (!dateValue) return "Just now";

  const postedDate = new Date(dateValue);
  if (Number.isNaN(postedDate.getTime())) return "Just now";

  const seconds = Math.max(0, Math.floor((Date.now() - postedDate.getTime()) / 1000));
  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(seconds / unit.seconds);
    if (value >= 1) return `${value} ${unit.label}${value === 1 ? "" : "s"} ago`;
  }

  return "Just now";
}


