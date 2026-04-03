"use client";

import { useTranslation } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-blue-600 text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h3 className="text-lg font-semibold">{t("footer.title")}</h3>
        <p className="text-sm mt-1">{t("footer.subtitle")}</p>

        <p className="text-sm mt-4 opacity-90">{t("footer.rights")}</p>
      </div>
    </footer>
  );
}
