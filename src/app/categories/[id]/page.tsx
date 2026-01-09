import Image from "next/image";

const allProducts = [
  // Phones
  { id: 1, name: "iPhone 15 Pro Max", price: 1250, location: "Phnom Penh", condition: "Used", category: "phone", img: "/image/iphone1.png" },
  { id: 3, name: "iPhone 14 Pro", price: 899, location: "Siem Reap", condition: "Used", category: "phone", img: "/image/iphone1.png" },
  { id: 8, name: "iPhone 13 Mini", price: 499, location: "Kandal", condition: "Used", category: "phone", img: "/image/iphone1.png" },

  // Tablets
  { id: 6, name: "iPad Pro 11 2021", price: 720, location: "Phnom Penh", condition: "Used", category: "tablet", img: "/image/iphone1.png" },

  // Computers
  { id: 5, name: "Samsung Galaxy S22", price: 650, location: "Battambang", condition: "Used", category: "computer", img: "/image/iphone1.png" },

  // Accessories
  { id: 2, name: "RGB Gaming Mouse", price: 10, location: "Phnom Penh", condition: "Used", category: "accessories", img: "/image/iphone1.png" },
  { id: 4, name: "Gaming Mouse Wireless", price: 15, location: "Phnom Penh", condition: "Brand New", category: "accessories", img: "/image/iphone1.png" },
  { id: 7, name: "Office Mouse Wired", price: 5, location: "Takeo", condition: "Used", category: "accessories", img: "/image/iphone1.png" },
];

export default async function CategoryPage({ params }) {
  const { category } = params;

  const filtered = allProducts.filter((p) => p.category === category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold capitalize mb-6">
        {category} Products
      </h1>

      {filtered.length === 0 ? (
        <p className="text-gray-600">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="p-4 border rounded-lg shadow-sm bg-white">
              <Image src={p.img} alt={p.name} width={300} height={300} className="rounded-md" />

              <h3 className="font-semibold mt-2 text-gray-900">{p.name}</h3>

              <p className="text-sm text-gray-500">
                {p.condition} • {p.location}
              </p>

              <p className="mt-2 font-semibold text-red-600">
                Price: ${p.price}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
