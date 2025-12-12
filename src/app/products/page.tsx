"use client";

import { useState } from "react";
import Link from "next/link";

const products = [
  { id: 1, name: "iPhone 13", price: 450, condition: "used", category: "phones", image: "https://via.placeholder.com/300" },
  { id: 2, name: "Samsung A52", price: 290, condition: "used", category: "phones", image: "https://via.placeholder.com/300" },
  { id: 3, name: "MacBook Pro 2019", price: 750, condition: "used", category: "laptops", image: "https://via.placeholder.com/300" },
  { id: 4, name: "Gaming Chair", price: 120, condition: "new", category: "furniture", image: "https://via.placeholder.com/300" },
  { id: 5, name: "Office Chair", price: 90, condition: "used", category: "furniture", image: "https://via.placeholder.com/300" },
  { id: 6, name: "iPad Air 4", price: 380, condition: "new", category: "tablets", image: "https://via.placeholder.com/300" },
];

// Unique categories
const categories = [...new Set(products.map((p) => p.category))];

export default function ProductsPage() {
  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [price, setPrice] = useState(1000);

  // Pagination
  const itemsPerPage = 4;
  const [page, setPage] = useState(1);

  // Filter logic
  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => (category === "all" ? true : p.category === category))
    .filter((p) => (condition === "all" ? true : p.condition === condition))
    .filter((p) => p.price <= price);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        {/* Search */}
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Condition */}
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Conditions</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>

        {/* Price slider */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Max Price: ${price}</label>
          <input
            type="range"
            min="10"
            max="1000"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginated.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="border rounded-lg shadow-sm p-3 hover:shadow-md transition"
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-48 object-cover rounded-md"
            />

            <h3 className="mt-3 font-semibold">{p.name}</h3>
            <p className="text-blue-600 font-bold">${p.price}</p>

            <p className="text-sm text-gray-600 capitalize">
              {p.condition} · {p.category}
            </p>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-4 py-1">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
