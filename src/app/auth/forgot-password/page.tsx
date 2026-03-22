"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
	PASSWORD_REQUIREMENTS_MESSAGE,
	validatePasswordStrength,
} from "../../../lib/validation";

const ForgotPasswordPage = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
	const isResetMode = Boolean(token);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [devResetLink, setDevResetLink] = useState("");

	const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!email.trim()) {
			toast.error("Email is required");
			return;
		}

		try {
			setLoading(true);
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: email.trim() }),
				}
			);

			const data = await res.json();
			if (!res.ok) {
				toast.error(data.message || "Failed to request password reset");
				return;
			}

			setDevResetLink(data.resetLink || "");
			toast.success(data.message || "Reset request submitted");
		} catch (error) {
			console.error("Forgot password request failed:", error);
			toast.error("Network error while requesting reset");
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!password || !confirmPassword) {
			toast.error("Please fill in both password fields");
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
			setLoading(true);
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token, password }),
				}
			);

			const data = await res.json();
			if (!res.ok) {
				toast.error(data.message || "Failed to reset password");
				return;
			}

			toast.success(data.message || "Password reset successful");
			setTimeout(() => router.push("/auth/login"), 800);
		} catch (error) {
			console.error("Reset password failed:", error);
			toast.error("Network error while resetting password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
			<div className="w-full max-w-md bg-white shadow-sm rounded-xl p-8">
				<h1 className="text-2xl font-bold text-blue-600 mb-2">
					{isResetMode ? "Set New Password" : "Forgot Password"}
				</h1>
				<p className="text-sm text-gray-500 mb-6">
					{isResetMode
						? "Enter your new password to complete reset."
						: "Enter your account email to generate a reset link."}
				</p>

				{!isResetMode ? (
					<form onSubmit={handleForgotPassword} className="space-y-4">
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-1">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your account email"
								className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70"
						>
							{loading ? "Sending..." : "Send Reset Link"}
						</button>
					</form>
				) : (
					<form onSubmit={handleResetPassword} className="space-y-4">
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-1">
								New Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter new password"
								className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
							/>
						</div>
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-1">
								Confirm New Password
							</label>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Re-enter new password"
								className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
							/>
							{password && validatePasswordStrength(password) && (
								<p className="mt-1 text-xs text-red-500">
									{PASSWORD_REQUIREMENTS_MESSAGE}
								</p>
							)}
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70"
						>
							{loading ? "Updating..." : "Reset Password"}
						</button>
					</form>
				)}

				{devResetLink && (
					<div className="mt-6 p-3 rounded-md bg-blue-50 border border-blue-200 text-sm text-blue-700 break-all">
						<p className="font-semibold mb-1">Development reset link:</p>
						<a href={devResetLink} className="underline">
							{devResetLink}
						</a>
					</div>
				)}

				<div className="mt-6 text-sm text-center text-gray-600">
					Back to{" "}
					<Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
						Login
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
