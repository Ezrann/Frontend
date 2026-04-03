"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "../context/LanguageContext";

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    async function getProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setProducts([]);
          return;
        }
        const data = (await res.json()) as Product[];
        setProducts(data);
      } catch {
        setProducts([]);
      }
    }

    getProducts();
  }, []);

  return (
    <div className="bg-zinc-50 w-full">
      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* HERO SECTION */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-16">
          <div>
            <h1 className="text-4xl font-bold text-black leading-tight">
              {t("home.titlePrefix")}{" "}
              <span className="text-blue-600">{t("home.titleHighlight")}</span>
              <br /> {t("home.titleSuffix")}
            </h1>

            <p className="text-gray-600 mt-4 max-w-md">
              {t("home.subtitle")}
            </p>

            <Link
              href="/products/add"
              className="mt-6 inline-block px-5 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
            >
              {t("home.cta")}
            </Link>
          </div>

          <div className="flex justify-center">
            <Image
              src="/images/hero.png"
              alt="hero"
              width={500}
              height={400}
              className="rounded-lg"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        </section>

        <hr />

        {/* PRODUCTS FROM API */}
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{t("home.latestProducts")}</h2>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
            >
              {t("home.seeAll")}
              <span className="text-sm">-&gt;</span>
            </Link>
          </div>

          {products.length === 0 && (
            <p className="text-gray-500">{t("home.noProducts")}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
