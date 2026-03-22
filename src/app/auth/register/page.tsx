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

const RegisterPage = () => {
  const router = useRouter();

  const [name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Load Google SDK on mount
  useEffect(() => {
    loadGoogleScript();

    // Initialize Google Sign-In button after script loads
    const checkGoogleLoaded = setInterval(() => {
      if (typeof window !== "undefined" && window.google) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn(
          "google-register-button",
          handleGoogleSignUp,
          () => console.log("Google Sign-In prompt closed")
        );
      }
    }, 100);

    return () => clearInterval(checkGoogleLoaded);
  }, []);

  const handleGoogleSignUp = async (response: any) => {
    try {
      setGoogleLoading(true);
      const decoded = decodeGoogleResponse(response.credential);

      if (!decoded) {
        toast.error("Failed to decode Google response");
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

      toast.success("Account created with Google! Redirecting...");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Google sign-up error:", error);
      toast.error("Google sign-up failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (!name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    // Basic phone validation (at least 8 digits)
    if (phone.trim().length < 8) {
      toast.error("Phone number must be at least 8 digits");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }
    const passwordValidationError = validatePasswordStrength(password);
    if (passwordValidationError) {
      toast.error(passwordValidationError);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
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
          role: "user", // Default role for new registrations
        }),
      });

      // Handle non-JSON responses
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        toast.error(`Registration failed: ${res.status} ${res.statusText}`);
        return;
      }

      if (!res.ok) {
        // Display the actual error message from the server
        // Backend returns: { status: 'error', message: '...' }
        const errorMessage =
          data.message || data.error || `Registration failed (${res.status})`;
        console.error("Registration error:", data);
        toast.error(errorMessage);
        return;
      }

      // Backend returns: { status: 'success', message: '...' }
      toast.success(
        data.message || "Account created successfully! Redirecting..."
      );
      setTimeout(() => router.push("/auth/login"), 1200);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Please check your connection and try again.";
      toast.error(`Network error: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center bg-white p-8 md:p-16 rounded-xl shadow-sm">
        {/* Left Image */}
        <div className="hidden md:flex justify-center items-center">
          <div className="relative w-full aspect-square max-w-lg">
            <img
              src="/images/image.png"
              alt="Marketplace Illustration"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              Create an Account
            </h1>
            <p className="text-gray-500 text-sm">Join our marketplace</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <EyeClosed className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg shadow-blue-100 transition-colors mt-6"
            >
              Register
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Google Sign-Up Button */}
            <div id="google-register-button" className="w-full"></div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 font-bold hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
