"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import toast from "react-hot-toast";
import {
  loadGoogleScript,
  initializeGoogleSignIn,
  decodeGoogleResponse,
  handleGoogleLogin,
} from "../../../lib/google-auth";
import { useTranslation } from "../../../context/LanguageContext";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async (response: { credential: string }) => {
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

      setTimeout(() => {
        const role = localStorage.getItem("role")?.toLowerCase() || "user";
        router.push(role === "admin" ? "/admin/dashboard" : "/");
      }, 1000);
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error(t("auth.googleLoginFailed"));
    }
  };

  useEffect(() => {
    loadGoogleScript();

    const checkGoogleLoaded = setInterval(() => {
      if (typeof window !== "undefined" && window.google) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn(
          "google-login-button",
          handleGoogleSignIn,
          () => console.log(t("auth.googlePromptClosed"))
        );
      }
    }, 100);

    return () => clearInterval(checkGoogleLoaded);
  }, [handleGoogleSignIn, t]);

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
        } catch (err) {
          console.error("Failed to fetch role from profile API:", err);
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

      setTimeout(() => {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center bg-white p-8 md:p-16 rounded-xl shadow-sm">
        <div className="hidden md:flex justify-center items-center">
          <div className="relative w-full aspect-square max-w-lg">
            <img
              src="/images/image.png"
              alt="Welcome Back Illustration"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              {t("auth.welcomeBack")}
            </h1>
            <p className="text-gray-500 text-sm">{t("auth.loginSubtitle")}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.enterEmail")}
                className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.enterPassword")}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                  }
                >
                  {showPassword ? (
                    <EyeClosed className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" /> {t("auth.rememberMe")}
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-colors mt-4"
            >
              {t("nav.login")}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("auth.orContinueWith")}</span>
              </div>
            </div>

            <div id="google-login-button" className="w-full"></div>
          </form>

          <div className="mt-10 text-center text-sm text-gray-600">
            {t("auth.noAccount")}{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 font-bold hover:underline"
            >
              {t("nav.register")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
