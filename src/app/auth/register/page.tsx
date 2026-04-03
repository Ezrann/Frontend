"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import toast from "react-hot-toast";
import {
  PASSWORD_REQUIREMENTS_MESSAGE,
  validatePasswordStrength,
} from "../../../lib/validation";
import {
  loadGoogleScript,
  initializeGoogleSignIn,
  decodeGoogleResponse,
  handleGoogleLogin,
} from "../../../lib/google-auth";
import { useTranslation } from "../../../context/LanguageContext";

const RegisterPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleSignUp = async (response: { credential: string }) => {
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

      toast.success(t("auth.googleSignupSuccess"));

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Google sign-up error:", error);
      toast.error(t("auth.googleSignupFailed"));
    }
  };

  useEffect(() => {
    loadGoogleScript();

    const checkGoogleLoaded = setInterval(() => {
      if (typeof window !== "undefined" && window.google) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn(
          "google-register-button",
          handleGoogleSignUp,
          () => console.log(t("auth.googlePromptClosed"))
        );
      }
    }, 100);

    return () => clearInterval(checkGoogleLoaded);
  }, [handleGoogleSignUp, t]);

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
        toast.error(`${t("auth.registrationFailed")}: ${res.status} ${res.statusText}`);
        return;
      }

      if (!res.ok) {
        const errorMessage =
          data.message || data.error || `${t("auth.registrationFailed")} (${res.status})`;
        toast.error(errorMessage);
        return;
      }

      toast.success(data.message || t("auth.accountCreated"));
      setTimeout(() => router.push("/auth/login"), 1200);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("auth.connectionRetry");
      toast.error(`${t("auth.networkErrorPrefix")} ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center bg-white p-8 md:p-16 rounded-xl shadow-sm">
        <div className="hidden md:flex justify-center items-center">
          <div className="relative w-full aspect-square max-w-lg">
            <img
              src="/images/image.png"
              alt="Marketplace Illustration"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              {t("auth.createAccount")}
            </h1>
            <p className="text-gray-500 text-sm">{t("auth.registerSubtitle")}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                {t("auth.fullName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("auth.enterFullName")}
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.enterEmail")}
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                {t("auth.phoneNumber")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("auth.enterPhone")}
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.enterPassword")}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
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
              {password && validatePasswordStrength(password) && (
                <p className="mt-1 text-xs text-red-500">
                  {PASSWORD_REQUIREMENTS_MESSAGE}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                {t("auth.confirmPassword")}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("auth.retypePassword")}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showConfirmPassword
                      ? t("auth.hideConfirmPassword")
                      : t("auth.showConfirmPassword")
                  }
                >
                  {showConfirmPassword ? (
                    <EyeClosed className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg shadow-blue-100 transition-colors mt-6"
            >
              {t("nav.register")}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("auth.orSignUpWith")}</span>
              </div>
            </div>

            <div id="google-register-button" className="w-full"></div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 font-bold hover:underline"
            >
              {t("nav.login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
