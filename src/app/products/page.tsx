import Link from "next/link";

const products = [
  {
    id: 1,
    name: "iPhone 13",
    price: 450,
    image: "https://via.placeholder.com/300",
  },
  {
    id: 2,
    name: "Samsung A52",
    price: 290,
    image: "https://via.placeholder.com/300",
  },
  {
    id: 3,
    name: "MacBook Pro 2019",
    price: 750,
    image: "https://via.placeholder.com/300",
  },
  {
    id: 4,
    name: "Gaming Chair",
    price: 120,
    image: "https://via.placeholder.com/300",
  },
];

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
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
          </Link>
        ))}
      </div>
    </div>
  );
}
