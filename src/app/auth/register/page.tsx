"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed, Lock, Mail, Phone, ShieldCheck, User } from "lucide-react";
import toast from "react-hot-toast";
import {
  PASSWORD_REQUIREMENTS_MESSAGE,
  validatePasswordStrength,
} from "../../../lib/validation";
import {
  handleGoogleLogin,
  initializeGoogleSignIn,
  loadGoogleScript,
} from "../../../lib/google-auth";
import { useTranslation } from "../../../context/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    async function handleGoogleSignUp(response: { credential: string }) {
      try {
        const result = await handleGoogleLogin({
          credential: response.credential,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(t("auth.googleSignupSuccess"));

        window.setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error) {
        console.error("Google sign-up error:", error);
        toast.error(t("auth.googleSignupFailed"));
      }
    }

    loadGoogleScript();

    const checkGoogleLoaded = window.setInterval(() => {
      if (typeof window !== "undefined" && window.google) {
        window.clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn("google-register-button", handleGoogleSignUp, () =>
          console.log(t("auth.googlePromptClosed"))
        );
      }
    }, 100);

    return () => window.clearInterval(checkGoogleLoaded);
  }, [router, t]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t("auth.fullNameRequired"));
      return;
    }
    if (!email.trim()) {
      toast.error(t("auth.emailRequired"));
      return;
    }
    if (!phone.trim()) {
      toast.error(t("auth.phoneRequired"));
      return;
    }
    if (phone.trim().length < 8) {
      toast.error(t("auth.phoneMinLength"));
      return;
    }
    if (!password) {
      toast.error(t("auth.passwordRequired"));
      return;
    }

    const passwordValidationError = validatePasswordStrength(password);
    if (passwordValidationError) {
      toast.error(passwordValidationError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role: "user",
        }),
      });

      let data;
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        toast.error(
          `${t("auth.registrationFailed")}: ${res.status} ${res.statusText}`
        );
        return;
      }

      if (!res.ok) {
        const errorMessage =
          data.message ||
          data.error ||
          `${t("auth.registrationFailed")} (${res.status})`;
        toast.error(errorMessage);
        return;
      }

      toast.success(data.message || t("auth.accountCreated"));
      window.setTimeout(() => router.push("/auth/login"), 1200);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("auth.connectionRetry");
      toast.error(`${t("auth.networkErrorPrefix")} ${errorMessage}`);
    }
  };

  const passwordHasError = Boolean(password && validatePasswordStrength(password));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,#f8fafc_55%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-4xl border border-white/70 bg-white shadow-[0_30px_80px_rgba(30,64,175,0.15)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#eff6ff_0%,#dbeafe_45%,#bfdbfe_100%)] px-10 py-12 text-slate-900 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_32%)]" />

          <div className="relative max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>{t("nav.register")}</span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900">
              {t("auth.createAccount")}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Join the marketplace and start posting products in just a few
              simple steps.
            </p>
          </div>

          <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
            <div className="absolute inset-x-10 top-8 h-40 rounded-full bg-blue-200/60 blur-3xl" />
            <Image
              src="/images/hero.png"
              alt="Marketplace illustration"
              width={520}
              height={520}
              className="relative h-auto w-full max-w-sm object-contain drop-shadow-xl"
              priority
            />
          </div>

          <div className="relative space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm">
              <p className="font-semibold text-slate-900">Post faster</p>
              <p className="mt-1 text-sm text-slate-600">
                Create your seller profile and start listing in minutes.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm">
              <p className="font-semibold text-slate-900">Reach more buyers</p>
              <p className="mt-1 text-sm text-slate-600">
                Keep your products, favorites, and messages in one account.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                {t("nav.register")}
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                {t("auth.createAccount")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {t("auth.registerSubtitle")}
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t("auth.fullName")}
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <User className="h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("auth.enterFullName")}
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

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
                  {t("auth.phoneNumber")}
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("auth.enterPhone")}
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

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t("auth.confirmPassword")}
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.retypePassword")}
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showConfirmPassword
                        ? t("auth.hideConfirmPassword")
                        : t("auth.showConfirmPassword")
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeClosed className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  passwordHasError
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-blue-100 bg-blue-50 text-slate-600"
                }`}
              >
                {PASSWORD_REQUIREMENTS_MESSAGE}
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                {t("nav.register")}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-slate-400">
                    {t("auth.orSignUpWith")}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex justify-center">
                  <div id="google-register-button" />
                </div>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                {t("nav.login")}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
