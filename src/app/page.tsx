"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Laptop,
  ShieldCheck,
  Smartphone,
  Tablet,
  Tag,
  Upload,
  Users,
} from "lucide-react";
import ProductCard from "@/src/components/products/ProductCard";
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

interface Category {
  id: number;
  name: string;
  slug?: string;
}

function getCategoryIcon(categoryName: string) {
  const normalized = categoryName.toLowerCase();

  if (normalized.includes("phone") || normalized.includes("mobile")) {
    return Smartphone;
  }
  if (normalized.includes("laptop") || normalized.includes("computer")) {
    return Laptop;
  }
  if (normalized.includes("tablet") || normalized.includes("ipad")) {
    return Tablet;
  }

  return Tag;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      title: t("home.stepOneTitle"),
      text: t("home.stepOneText"),
    },
    {
      number: "02",
      title: t("home.stepTwoTitle"),
      text: t("home.stepTwoText"),
    },
    {
      number: "03",
      title: t("home.stepThreeTitle"),
      text: t("home.stepThreeText"),
    },
  ];

  const benefits = [
    {
      icon: ShieldCheck,
      title: t("home.trustOneTitle"),
      text: t("home.trustOneText"),
    },
    {
      icon: Upload,
      title: t("home.trustTwoTitle"),
      text: t("home.trustTwoText"),
    },
    {
      icon: Users,
      title: t("home.trustThreeTitle"),
      text: t("home.trustThreeText"),
    },
  ];

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

    async function getCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setCategories([]);
          return;
        }
        const data = (await res.json()) as Category[];
        setCategories(data.slice(0, 4));
      } catch {
        setCategories([]);
      }
    }

    getProducts();
    getCategories();
  }, []);

  return (
    <div className="w-full bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%)]">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_100%)] px-6 py-10 shadow-[0_24px_70px_rgba(59,130,246,0.12)] sm:px-8 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_32%)]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
                {t("home.titleHighlight")}
              </div>

              <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                {t("home.titlePrefix")} <span className="text-blue-600">{t("home.titleHighlight")}</span>
                <br />
                {t("home.titleSuffix")}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                {t("home.subtitle")}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  {t("home.secondaryCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products/add"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                >
                  {t("home.cta")}
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-2xl font-semibold text-slate-900">1200+</p>
                  <p className="mt-1 text-sm text-slate-500">{t("home.statsListings")}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-2xl font-semibold text-slate-900">300+</p>
                  <p className="mt-1 text-sm text-slate-500">{t("home.statsSellers")}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-2xl font-semibold text-slate-900">24/7</p>
                  <p className="mt-1 text-sm text-slate-500">{t("home.statsPosting")}</p>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute inset-x-10 top-8 h-44 rounded-full bg-blue-200/60 blur-3xl" />
              <Image
                src="/images/hero.png"
                alt="Second hand electronics marketplace"
                width={640}
                height={520}
                priority
                className="relative h-auto w-full max-w-xl object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{t("home.categoriesTitle")}</h2>
              <p className="mt-2 text-sm text-slate-500">{t("home.categoriesSubtitle")}</p>
            </div>
            <Link
              href="/categories"
              className="hidden text-sm font-semibold text-blue-600 transition hover:text-blue-700 sm:inline-flex"
            >
              {t("home.browseAllCategories")}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.name);

              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{category.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{t("home.categoryCardText")}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                    {t("home.secondaryCta")}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{t("home.latestProducts")}</h2>
              <p className="mt-2 text-sm text-slate-500">{t("home.latestSubtitle")}</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              {t("home.seeAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {products.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
              {t("home.noProducts")}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
              {t("home.howItWorksTitle")}
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">{t("home.howItWorksSubtitle")}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">{t("home.howItWorksBody")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold text-blue-600">{step.number}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_100%)] px-6 py-8 shadow-sm sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              {t("home.trustTitle")}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">{t("home.trustSubtitle")}</h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-3xl border border-white bg-white/90 p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
