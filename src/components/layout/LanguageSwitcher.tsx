"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const currentLanguage = language === "en" ? "en" : "km";

  const languageOptions = [
    {
      value: "en" as const,
      label: t("common.english"),
      logo: "/images/flags/england.png",
    },
    {
      value: "km" as const,
      label: t("common.khmer"),
      logo: "/images/flags/cam.png",
    },
  ];

  const activeLanguage = languageOptions.find(
    (option) => option.value === currentLanguage
  );

  return (
    <div ref={rootRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-slate-900"
        aria-label={t("common.language")}
      >
        {activeLanguage && (
          <Image
            src={activeLanguage.logo}
            alt={activeLanguage.label}
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0"
          />
        )}
        <span className="hidden sm:inline">{activeLanguage?.label}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {t("common.language")}
          </div>

          <div className="p-1">
            {languageOptions.map((option) => {
              const isActive = option.value === currentLanguage;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setLanguage(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                    isActive
                      ? "bg-slate-50 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Image
                      src={option.logo}
                      alt={option.label}
                      width={20}
                      height={20}
                      className="h-5 w-5 shrink-0"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </span>

                  {isActive ? <Check className="h-4 w-4 text-slate-500" /> : <span className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
