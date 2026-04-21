"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeClosed, Lock, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import {
  decodeGoogleResponse,
  handleGoogleLogin,
  initializeGoogleSignIn,
  loadGoogleScript,
} from "../../../lib/google-auth";
import { useTranslation } from "../../../context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function handleGoogleSignIn(response: { credential: string }) {
      try {
        const decoded = decodeGoogleResponse(response.credential);

        if (!decoded) {
          toast.error(t("auth.decodeFailed"));
          return;
        }

        const result = await handleGoogleLogin({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(t("auth.googleLoginSuccess"));

        window.setTimeout(() => {
          const role = localStorage.getItem("role")?.toLowerCase() || "user";
          router.push(role === "admin" ? "/admin/dashboard" : "/");
        }, 1000);
      } catch (error) {
        console.error("Google sign-in error:", error);
        toast.error(t("auth.googleLoginFailed"));
      }
    }

    loadGoogleScript();

    const checkGoogleLoaded = window.setInterval(() => {
      if (typeof window !== "undefined" && window.google) {
        window.clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn("google-login-button", handleGoogleSignIn, () =>
          console.log(t("auth.googlePromptClosed"))
        );
      }
    }, 100);

    return () => window.clearInterval(checkGoogleLoaded);
  }, [router, t]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || t("auth.invalidCredentials"));
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }; SameSite=Lax`;
      }

      let userRole =
        data.role ||
        data.user?.role ||
        data.data?.role ||
        data.user?.user?.role;

      if (!userRole && data.token) {
        try {
          const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${data.token}`,
              "Content-Type": "application/json",
            },
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            userRole = profileData.role;
          }
        } catch (error) {
          console.error("Failed to fetch role from profile API:", error);
        }
      }

      if (userRole) {
        const roleString = String(userRole).trim();
        localStorage.setItem("role", roleString);
        document.cookie = `role=${roleString}; path=/; max-age=${
          7 * 24 * 60 * 60
        }; SameSite=Lax`;
        window.dispatchEvent(new Event("localStorageChange"));
      }

      toast.success(t("auth.loginSuccess"));

      window.setTimeout(() => {
        const role = userRole ? String(userRole).toLowerCase().trim() : null;
        const redirectPath = searchParams.get("redirect");

        if (redirectPath) {
          router.push(redirectPath);
        } else if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }, 1000);
    } catch {
      toast.error(t("auth.serverError"));
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_80px_rgba(30,64,175,0.15)] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#1d4ed8_0%,#2563eb_42%,#60a5fa_100%)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(191,219,254,0.28),_transparent_30%)]" />

          <div className="relative max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>{t("home.titleHighlight")}</span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight">
              {t("auth.welcomeBack")}
            </h1>
            <p className="mt-4 text-base leading-7 text-blue-100">
              Sign in to manage your products, favorites, and messages with a
              smoother marketplace experience.
            </p>
          </div>

          <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
            <div className="absolute inset-x-10 top-6 h-40 rounded-full bg-white/15 blur-3xl" />
            <Image
              src="/images/image.png"
              alt="Marketplace illustration"
              width={520}
              height={520}
              className="relative h-auto w-full max-w-sm object-contain drop-shadow-2xl"
              priority
            />
          </div>

          <div className="relative grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="font-semibold">Safe and trusted</p>
              <p className="mt-1 text-blue-100">
                Built for buying and selling across Cambodia.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="font-semibold">Fast account access</p>
              <p className="mt-1 text-blue-100">
                Continue with email or Google in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                {t("nav.login")}
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                {t("auth.welcomeBack")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {t("auth.loginSubtitle")}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t("auth.email")}
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.enterEmail")}
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t("auth.password")}
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.enterPassword")}
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")
                    }
                  >
                    {showPassword ? (
                      <EyeClosed className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                  <span>{t("auth.rememberMe")}</span>
                </label>
                <span className="text-xs text-slate-400">
                  Safe login for buying and selling in Cambodia
                </span>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                {t("nav.login")}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-slate-400">
                    {t("auth.orContinueWith")}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div id="google-login-button" className="w-full" />
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              {t("auth.noAccount")}{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                {t("nav.register")}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
