"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { admin, user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (admin) router.replace("/admin/dashboard");
    else if (user) router.replace("/dashboard");
  }, [admin, user, loading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password, true);
    } catch (err: any) {
      setError(err.message || "Admin login failed. Please check your credentials.");
      setSubmitting(false);
    }
  };

  if (loading || admin || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#081148] text-[#FBF676]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#FBF676] border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[linear-gradient(160deg,#081148_0%,#0C1A6B_55%,#05627C_130%)] px-6 py-12">
      <section className="w-full max-w-md rounded-xl border border-[#FBF676]/20 bg-[#0C1A6B]/90 p-8 shadow-2xl sm:p-10">
        <Link href="/" className="mb-10 flex justify-center">
          <Image
            src="/image.png"
            alt="Big Bull Energies Logo"
            width={240}
            height={80}
            className="h-16 w-auto"
            priority
            quality={95}
            
          />
        </Link>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#FBF676]">
          Restricted access
        </p>
        <h1 className="mb-2 text-3xl font-medium text-[#F6F5EC]">Admin login</h1>
        <p className="mb-8 text-sm text-[#9FB8C9]">
          Sign in with your administrator email and password.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <p className="rounded-md border-l-2 border-red-400 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#9FB8C9]">
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="mt-2 w-full border-0 border-b border-[#9FB8C9]/40 bg-transparent py-3 text-sm text-[#F6F5EC] outline-none transition focus:border-[#FBF676]"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#9FB8C9]">
            Password
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full border-0 border-b border-[#9FB8C9]/40 bg-transparent py-3 pr-12 text-sm text-[#F6F5EC] outline-none transition focus:border-[#FBF676]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-[#FBF676]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-[#FBF676] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#0C1A6B] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in as admin"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#9FB8C9]">
          Member account? <Link href="/login" className="font-semibold text-[#FBF676]">User login</Link>
        </p>
      </section>
    </main>
  );
}
