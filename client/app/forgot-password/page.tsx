"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.forgotPassword(userId);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message || "Failed to send password reset email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/signinbg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full space-y-8 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-yellow-500/30">
        <div>
          <div className="flex justify-center mb-6">
            <Image
              src="/image.png"
              alt="Big Bull Energies Logo"
              width={180}
              height={60}
              className="h-14 w-auto"
              priority
            />
          </div>
          <h2 className="text-center text-3xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Forgot Password
            </span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Enter your User ID and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-600/15 to-yellow-500/20 border-2 border-yellow-500/40 text-white px-4 py-3 rounded-xl">
              <p className="font-bold text-yellow-300">
                Password reset link has been sent to your email. Please check
                your inbox and follow the instructions.
              </p>
            </div>
            <div className="text-center">
              <Link
                href="/login"
                className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 border-2 border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                <p className="font-bold">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="user-id"
                className="block text-sm font-bold text-yellow-400 mb-2"
              >
                User ID
              </label>
              <input
                id="user-id"
                name="user-id"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                placeholder="User ID (CROWN-XXXXXX)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
