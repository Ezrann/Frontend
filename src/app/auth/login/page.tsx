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

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Load Google SDK on mount
  useEffect(() => {
    loadGoogleScript();
    
    // Initialize Google Sign-In button after script loads
    const checkGoogleLoaded = setInterval(() => {
      if (typeof window !== "undefined" && window.google) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn(
          "google-login-button",
          handleGoogleSignIn,
          () => console.log("Google Sign-In prompt closed")
        );
      }
    }, 100);

    return () => clearInterval(checkGoogleLoaded);
  }, []);

  const handleGoogleSignIn = async (response: any) => {
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

      toast.success("Google login successful!");

      setTimeout(() => {
        const role = localStorage.getItem("role")?.toLowerCase() || "user";
        router.push(role === "admin" ? "/admin/dashboard" : "/");
      }, 1000);
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Debug: Log full API response
      console.log("=== LOGIN API RESPONSE ===");
      console.log("Full response data:", data);
      console.log("Response keys:", Object.keys(data));
      console.log("data.role:", data.role);
      console.log("data.user:", data.user);
      console.log("data.user?.role:", data.user?.role);

      if (!res.ok) {
        toast.error(data.message || "Invalid email or password");
        return;
      }

      // Save token + role to localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
        // Also set cookie for middleware
        document.cookie = `token=${data.token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }; SameSite=Lax`;
        console.log("âœ… Token saved to localStorage and cookie");
      }

      // Handle role - check multiple possible locations in API response
      let userRole =
        data.role ||
        data.user?.role ||
        data.data?.role ||
        data.user?.user?.role;

      console.log("=== ROLE EXTRACTION ===");
      console.log("Extracted role:", userRole);
      console.log("Role type:", typeof userRole);
      console.log("Role value:", JSON.stringify(userRole));

      // If role not found in login response, fetch from profile API
      if (!userRole && data.token) {
        console.log("âš ï¸ Role not in login response, fetching from profile API...");
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
            console.log("âœ… Role fetched from profile API:", userRole);
          }
        } catch (err) {
          console.error("Failed to fetch role from profile API:", err);
        }
      }

      if (userRole) {
        // Ensure role is a string
        const roleString = String(userRole).trim();
        localStorage.setItem("role", roleString);
        // Also set cookie for middleware
        document.cookie = `role=${roleString}; path=/; max-age=${
          7 * 24 * 60 * 60
        }; SameSite=Lax`;
        console.log("âœ… Role saved to localStorage and cookie:", roleString);
        console.log("Role normalized (lowercase):", roleString.toLowerCase());
        console.log("Is admin?", roleString.toLowerCase() === "admin");
        
        // Dispatch custom event to notify Navbar of role change
        window.dispatchEvent(new Event("localStorageChange"));
      } else {
        console.warn("âš ï¸ No role found in API response or profile!");
        console.warn("Available data keys:", Object.keys(data));
      }

      toast.success("Login successfully...");

      // ðŸ§­ Role Based Navigation
      setTimeout(() => {
        const role = userRole ? String(userRole).toLowerCase().trim() : null;
        const redirectPath = searchParams.get("redirect");

        console.log("=== NAVIGATION DECISION ===");
        console.log("Role (normalized):", role);
        console.log("Redirect path from URL:", redirectPath);
        console.log("Is admin?", role === "admin");

        // If there's a redirect parameter (from middleware), use it
        if (redirectPath) {
          console.log("Redirecting to:", redirectPath);
          router.push(redirectPath);
        } else if (role === "admin") {
          console.log("âœ… Admin detected - redirecting to admin dashboard");
          router.push("/admin/dashboard"); // Admin dashboard
        } else {
          console.log("Regular user - redirecting to home");
          router.push("/"); // Normal user â†’ home page
        }
      }, 1000);
    } catch (error) {
      toast.error("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center bg-white p-8 md:p-16 rounded-xl shadow-sm">
        {/* Left Side Illustration */}
        <div className="hidden md:flex justify-center items-center">
          <div className="relative w-full aspect-square max-w-lg">
            <img
              src="/images/image.png"
              alt="Welcome Back Illustration"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-500 text-sm">Login to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email Address"
                className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" /> Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-colors mt-4"
            >
              Login
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div id="google-login-button" className="w-full"></div>
          </form>

          <div className="mt-10 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
