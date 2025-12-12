
import Footer from "../components/Footer";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-zinc-50 w-full">
      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* -------------------- HERO SECTION -------------------- */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-16">
          {/* Text */}
          <div>
            <h1 className="text-4xl font-bold text-black leading-tight">
              Buy & Sell <span className="text-blue-600">Second Hand</span>
              <br /> Electronics Easily
            </h1>

            <p className="text-gray-600 mt-4 max-w-md">
              Join thousands of Cambodians buying and selling quality pre-owned electronics.
              Post your items in minutes and discover amazing deals every day.
            </p>

            <button className="mt-6 px-5 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition">
              Get Started
            </button>
          </div>

          {/* Hero Image */}
          <div className="flex justify-center">
            <Image
              src="/images/hero.png"
              alt="hero"
              width={500}
              height={400}
              className="rounded-lg"
            />
          </div>
        </section>

        <hr />

        {/* -------------------- CATEGORIES -------------------- */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-6">Categories</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { name: "Phone", img: "/image/ipad.png" },
              { name: "Tablets", img: "/image/pc.png" },
              { name: "Computer", img: "/image/pc.png" },
              { name: "Accessories", img: "/image/ass.png" },
            ].map((c) => (
              <div
                key={c.name}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className="w-24 h-24 flex items-center justify-center rounded-full border-2 border-blue-300">
                  <Image src={c.img} alt={c.name} width={60} height={60} />
                </div>
                <p className="text-gray-700">{c.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------- PRODUCTS -------------------- */}
            <section className="mt-12">
  <h2 className="text-xl font-semibold mb-6">Products</h2>

  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

    {[
      {
        id: 1,
        name: "iPhone 15 Pro Max",
        price: 1250,
        location: "Phnom Penh",
        condition: "Used",
        img: "/image/iphone1.png",
      },
      {
        id: 2,
        name: "RGB Gaming Mouse",
        price: 10,
        location: "Phnom Penh",
        condition: "Used",
        img: "/image/iphone1.png",
      },
      {
        id: 3,
        name: "iPhone 14 Pro",
        price: 899,
        location: "Siem Reap",
        condition: "Used",
        img: "/image/iphone1.png",
      },
      {
        id: 4,
        name: "Gaming Mouse Wireless",
        price: 15,
        location: "Phnom Penh",
        condition: "Brand New",
        img: "/image/iphone1.png",
      },
      {
        id: 5,
        name: "Samsung Galaxy S22",
        price: 650,
        location: "Battambang",
        condition: "Used",
        img: "/image/iphone1.png",
      },
      {
        id: 6,
        name: "iPad Pro 11 2021",
        price: 720,
        location: "Phnom Penh",
        condition: "Used",
        img: "/image/iphone1.png",
      },
      {
        id: 7,
        name: "Office Mouse Wired",
        price: 5,
        location: "Takeo",
        condition: "Used",
        img: "/image/iphone1.png",
      },
      {
        id: 8,
        name: "iPhone 13 Mini",
        price: 499,
        location: "Kandal",
        condition: "Used",
        img: "/image/iphone1.png",
      },
    ].map((p) => (
      <div
        key={p.id}
        className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
      >
        <Image
          src={p.img}
          alt={p.name}
          width={300}
          height={300}
          className="rounded-md"
        />

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
</section>

      </main>
      <Footer />
    </div>
  );
}
