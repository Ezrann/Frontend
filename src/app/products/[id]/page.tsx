import Link from "next/link";

const products = [
  {
    id: 1,
    name: "iPhone 13",
    price: 450,
    description: "Good condition, 128GB storage, battery health 88%.",
    image: "https://via.placeholder.com/500",
  },
  {
    id: 2,
    name: "Samsung A52",
    price: 290,
    description: "Used for 1 year, no cracks, works perfectly.",
    image: "https://via.placeholder.com/500",
  },
  {
    id: 3,
    name: "MacBook Pro 2019",
    price: 750,
    description: "Core i7, 16GB RAM, 512GB SSD. Minor scratches.",
    image: "https://via.placeholder.com/500",
  },
  {
    id: 4,
    name: "Gaming Chair",
    price: 120,
    description: "Comfortable chair, adjustable height, like new.",
    image: "https://via.placeholder.com/500",
  },
];

export default function ProductDetail({ params }) {
  const product = products.find((p) => p.id == params.id);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-red-600">Product not found.</p>
        <Link href="/products" className="text-blue-600 underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">

      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full rounded-lg shadow"
      />

      {/* Info */}
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-blue-600 text-2xl font-semibold mt-2">
          ${product.price}
        </p>

        <p className="mt-4 text-gray-600">{product.description}</p>

        <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Add to Cart
        </button>

        <Link href="/products" className="block mt-4 text-blue-600 underline">
          ← Back to Products
        </Link>
      </div>
    </div>
  );
}
