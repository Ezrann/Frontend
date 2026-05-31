"use client";

import { useTranslation } from "@/src/context/LanguageContext";
import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const marketplaceLinks = [
    { href: "/products", label: "Buy Products" },
    { href: "/products/add", label: "Sell Products" },
    { href: "/categories", label: "Categories" },
    { href: "/products", label: "Popular Products" },
  ];

  const supportLinks = [
    { href: "/help", label: "Help Center" },
    { href: "/contact", label: "Contact Us" },
    { href: "/products", label: "Report Product" },
    { href: "/safety", label: "Safety Tips" },
  ];

  const socialLinks = [
    {
      href: "https://x.com/",
      label: "X",
      icon: X,
      className: "hover:text-sky-600",
    },
    {
      href: "https://www.instagram.com/jackkuxx1111/?hl=en",
      label: "Instagram",
      icon: Instagram,
      className: "hover:text-pink-600",
    },
    {
      href: "https://www.facebook.com/sey.bunrong.12",
      label: "Facebook",
      icon: Facebook,
      className: "hover:text-blue-700",
    },
  ];

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr_1fr_1.35fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-slate-950"
            >
              Second Hand
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {t("About") ||
                "Cambodia marketplace for buying and selling trusted second-hand products."}
            </p>
            <div className="mt-5 space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Phnom Penh, Cambodia
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Trusted local marketplace
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-950">
              Marketplace
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {marketplaceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 transition hover:text-blue-600"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-950">
              Support
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 transition hover:text-blue-600"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-950">
              {t("") || "Newsletter"}
            </h4>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              {t("") ||
                "Subscribe for the latest second-hand marketplace updates and product listings."}
            </p>
            <form className="mt-5 flex max-w-md gap-2">
              <div className="relative min-w-0 flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  aria-label="email"
                  placeholder={t("Enter your email") || "Enter your email"}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  type="email"
                />
              </div>
              <button
                type="submit"
                aria-label="Join newsletter"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white transition hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 ${link.className}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            {t("") ||
              "© 2026 Second Hand. All rights reserved."}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-blue-600">
              Terms & Conditions
            </Link>
            <Link href="/cookies" className="transition hover:text-blue-600">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
