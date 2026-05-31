"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Save,
} from "lucide-react";
import {
  PASSWORD_REQUIREMENTS_MESSAGE,
  validatePasswordStrength,
} from "../../../lib/validation";

interface UserData {
  name: string;
  email: string;
  role?: string;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default function ProfileSecurityPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordStrengthError = password
    ? validatePasswordStrength(password)
    : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const safeJsonParse = async (response: Response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    return null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let res = await fetch(`${apiUrl}/api/users/me`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (!res.ok) {
          res = await fetch(`${apiUrl}/api/auth/me`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });

          if (res.status === 401) {
            router.push("/auth/login");
            return;
          }
        }

        if (res.ok) {
          const data = await safeJsonParse(res);
          if (data) {
            setUser({
              name: data.name || "",
              email: data.email || "",
              role: data.role || "user",
            });
          }
        } else {
          const errorData = await safeJsonParse(res);
          setError(errorData?.message || "Unable to load your profile.");
        }
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiUrl, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!password) {
      setError("Enter a new password to continue.");
      return;
    }

    if (passwordStrengthError) {
      setError(passwordStrengthError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/me`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        setError(data?.message || "Failed to update password.");
        return;
      }

      setMessage("Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(""), 3000);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to update password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrengthOk = password ? !passwordStrengthError : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eff6ff,transparent_30%),linear-gradient(135deg,#f8fafc,#e0f2fe_45%,#dbeafe)] flex items-center justify-center px-4">
        <div className="rounded-4xl border border-white/70 bg-white/80 px-8 py-10 text-center shadow-[0_25px_80px_rgba(37,99,235,0.14)] backdrop-blur">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-600">Loading security page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eff6ff,transparent_30%),linear-gradient(135deg,#f8fafc,#e0f2fe_45%,#dbeafe)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden rounded-4xl border border-white/70 bg-[linear-gradient(160deg,#0f172a_0%,#1d4ed8_55%,#60a5fa_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(191,219,254,0.24),transparent_28%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to profile
              </Link>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" />
                Security settings
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
                Change your password in a focused space.
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-blue-100">
                Keep your account details separate from your password update so the form stays cleaner and easier to trust.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <KeyRound className="h-5 w-5 text-blue-100" />
                <p className="mt-3 text-sm font-semibold">Dedicated flow</p>
                <p className="mt-1 text-sm text-blue-100">
                  Password changes no longer compete with profile edits.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-blue-100" />
                <p className="mt-3 text-sm font-semibold">Cleaner preview</p>
                <p className="mt-1 text-sm text-blue-100">
                  A simpler layout makes the action easier to scan on mobile.
                </p>
              </div>
            </div>

            {user && (
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-blue-100">
                  Signed in as
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{user.name}</p>
                    <p className="text-sm text-blue-100">{user.email}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-sm font-bold text-white">
                    {getInitials(user.name)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="rounded-4xl border border-white/70 bg-white/90 p-6 shadow-[0_30px_90px_rgba(30,64,175,0.14)] backdrop-blur sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                Account security
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                Update password
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use a strong password you do not reuse on other accounts.
              </p>
            </div>
            <div className="hidden rounded-2xl bg-blue-50 p-3 text-blue-700 sm:block">
              <Lock className="h-5 w-5" />
            </div>
          </div>

          {message && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-700">
                  New password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a new password"
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-semibold text-slate-700">
                  Confirm password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype the new password"
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showConfirmPassword ? "Hide confirmation" : "Show confirmation"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                passwordStrengthOk
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : password
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-blue-100 bg-blue-50 text-slate-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {passwordStrengthOk ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                </div>
                <p>{passwordStrengthOk ? "Password looks strong." : PASSWORD_REQUIREMENTS_MESSAGE}</p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}