"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();

  const [name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    // Client-side validation
    if (!name.trim()) {
      return setMessage("Full name is required");
    }
    if (!email.trim()) {
      return setMessage("Email is required");
    }
    if (!phone.trim()) {
      return setMessage("Phone number is required");
    }
    // Basic phone validation (at least 8 digits)
    if (phone.trim().length < 8) {
      return setMessage("Phone number must be at least 8 digits");
    }
    if (!password) {
      return setMessage("Password is required");
    }
    if (password.length < 6) {
      return setMessage("Password must be at least 6 characters");
    }
    if (password !== confirmPassword) {
      return setMessage("Passwords do not match");
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
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
        return setMessage(
          `Registration failed: ${res.status} ${res.statusText}`
        );
      }

      if (!res.ok) {
        // Display the actual error message from the server
        // Backend returns: { status: 'error', message: '...' }
        const errorMessage =
          data.message || data.error || `Registration failed (${res.status})`;
        console.error("Registration error:", data);
        setMessage(errorMessage);
        return;
      }

      // Backend returns: { status: 'success', message: '...' }
      setMessage(
        data.message || "Account created successfully! Redirecting..."
      );
      setTimeout(() => router.push("/auth/login"), 1200);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Please check your connection and try again.";
      setMessage(`Network error: ${errorMessage}`);
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

          {message && (
            <p className="text-center text-red-500 font-semibold mb-4">
              {message}
            </p>
          )}

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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg shadow-blue-100 transition-colors mt-6"
            >
              Register
            </button>
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
