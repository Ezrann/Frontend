"use client";

import { useTranslation } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div
      className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1"
      aria-label={t("common.language")}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          language === "en"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:text-blue-600"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("km")}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          language === "km"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:text-blue-600"
        }`}
      >
        ខ្មែរ
      </button>
    </div>
  );
}
