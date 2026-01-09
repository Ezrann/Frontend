"use client";

import Link from "next/link";
import { Tag, Package } from "lucide-react";

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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Helper function to get image URL
  const getImageUrl = (image: ProductImage | undefined) => {
    if (!image) return "/image/placeholder.png";
    // Use url if available (full URL), otherwise construct from path
    if (image.url) return image.url;
    if (image.path) return `http://localhost:5001/${image.path}`;
    return "/image/placeholder.png";
  };

  const firstImage =
    product.images && product.images.length > 0 ? product.images[0] : undefined;
  const imageUrl = getImageUrl(firstImage);

  const price = typeof product.price === "string" 
    ? parseFloat(product.price).toFixed(2) 
    : product.price;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
    >
      {/* Image Container */}
      <div className="relative w-full h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/image/placeholder.png";
          }}
        />
        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            product.product_condition === "new" || product.product_condition === "unused"
              ? "bg-green-500/90 text-white"
              : "bg-blue-500/90 text-white"
          }`}>
            {product.product_condition === "new" || product.product_condition === "unused" ? "New" : "Used"}
          </span>
        </div>
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        {/* Category */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Package className="w-4 h-4" />
          <span className="capitalize">{product.category_name || "Uncategorized"}</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-2xl font-bold text-blue-600">
              ${price}
            </p>
          </div>
          <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}


