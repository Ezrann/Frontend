"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
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
        setMessage(data.message || "Invalid email or password");
        return;
      }

      // Save token + role to localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
        // Also set cookie for middleware
        document.cookie = `token=${data.token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }; SameSite=Lax`;
        console.log("✅ Token saved to localStorage and cookie");
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
        console.log("⚠️ Role not in login response, fetching from profile API...");
        try {
          const profileRes = await fetch("http://localhost:5001/api/users/me", {
            headers: {
              Authorization: `Bearer ${data.token}`,
              "Content-Type": "application/json",
            },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            userRole = profileData.role;
            console.log("✅ Role fetched from profile API:", userRole);
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
        console.log("✅ Role saved to localStorage and cookie:", roleString);
        console.log("Role normalized (lowercase):", roleString.toLowerCase());
        console.log("Is admin?", roleString.toLowerCase() === "admin");
        
        // Dispatch custom event to notify Navbar of role change
        window.dispatchEvent(new Event("localStorageChange"));
      } else {
        console.warn("⚠️ No role found in API response or profile!");
        console.warn("Available data keys:", Object.keys(data));
      }

      setMessage("Login successfully...");

      // 🧭 Role Based Navigation
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
          console.log("✅ Admin detected - redirecting to admin dashboard");
          router.push("/admin/dashboard"); // Admin dashboard
        } else {
          console.log("Regular user - redirecting to home");
          router.push("/"); // Normal user → home page
        }
      }, 1000);
    } catch (error) {
      setMessage("Server error. Try again later.");
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

          {message && (
            <p className="text-center text-sm mb-4 text-red-500 font-semibold">
              {message}
            </p>
          )}

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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" /> Remember me
              </label>
              <Link
                href="/forgot-password"
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
