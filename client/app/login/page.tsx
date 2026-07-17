"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import BigBullLoader from "@/components/BigBullLoader";

function LoginContent() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, admin, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for signup success message
  useEffect(() => {
    if (searchParams.get("signup") === "success") {
      setSuccessMessage(
        "Account created successfully! Please login to continue.",
      );
      // Clear the query parameter from URL
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router]);

  // Redirect after successful login - use replace to avoid history issues
  useEffect(() => {
    if (!authLoading) {
      if (admin) {
        // Admin account login
        router.replace("/admin/dashboard");
      } else if (user) {
        // Regular user login
        if (user.userId === "BIGBULL-000000" || user.userId === "CROWN-000000" || user.userId === "CNEOX-000000") {
          // BIGBULL-000000 or BIGBULL-000000 user should be redirected to admin dashboard
          router.replace("/admin/dashboard");
        } else {
          router.replace("/dashboard");
        }
      }
    }
  }, [user, admin, router, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(userId, password);
      // Redirect will be handled by useEffect when user/admin state updates
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          background: "linear-gradient(160deg, #081148 0%, #0C1A6B 45%, #05627C 100%)",
        }}
      >
        <div className="relative z-10 text-center">
          <div
            className="inline-block animate-spin rounded-full h-10 w-10 border-b-2"
            style={{ borderColor: "#FBF676" }}
          ></div>
          <p className="mt-4 text-sm tracking-[0.2em] uppercase text-[#9FB8C9]">
            Loading
          </p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect via useEffect)
  if (user || admin) {
    return null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.1fr_1fr] font-[var(--font-body)]">
      <style jsx global>{`
        :root {
          --font-display: var(--font-fraunces), serif;
          --font-body: var(--font-inter), sans-serif;
        }
        @keyframes drawLine {
          from {
            stroke-dashoffset: 900;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes dotPulse {
          0%,
          100% {
            opacity: 0.4;
            r: 4;
          }
          50% {
            opacity: 1;
            r: 6;
          }
        }
        @keyframes shimmer {
          from {
            transform: translateX(-120%);
          }
          to {
            transform: translateX(220%);
          }
        }
        .bull-line {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: drawLine 2.2s cubic-bezier(0.65, 0, 0.35, 1) 0.3s forwards;
        }
        .bull-dot {
          animation: dotPulse 2.4s ease-in-out 2.3s infinite;
        }
        .fade-up {
          opacity: 0;
          animation: fadeUp 0.7s ease-out forwards;
        }
        .cta-shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            110deg,
            transparent 0%,
            rgba(255, 255, 255, 0.55) 50%,
            transparent 100%
          );
          transform: translateX(-120%);
        }
        .cta-shimmer:hover::after {
          animation: shimmer 1s ease-in-out forwards;
        }
        .underline-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(159, 184, 201, 0.35);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .underline-input:focus {
          outline: none;
          border-bottom-color: #fbf676;
          box-shadow: 0 1px 0 0 #fbf676;
        }
        @media (prefers-reduced-motion: reduce) {
          .bull-line,
          .bull-dot,
          .fade-up,
          .cta-shimmer::after {
            animation: none !important;
          }
        }
      `}</style>

      {/* Left — brand / signature panel */}
      <div
        className="relative hidden md:flex flex-col justify-between overflow-hidden px-14 py-12"
        style={{
          background:
            "linear-gradient(160deg, #081148 0%, #0C1A6B 50%, #05627C 130%)",
        }}
      >
        {/* fine grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#FBF676 1px, transparent 1px), linear-gradient(90deg, #FBF676 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        ></div>

        <Link href="/" className="relative z-10 w-fit">
          <Image
            src="/image.png"
            alt="Big Bull Energies Logo"
            width={168}
            height={56}
            className="h-11 w-auto"
            priority
          />
        </Link>

        <div className="relative z-10 max-w-md">
          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-5"
            style={{ color: "#FBF676" }}
          >
            Member Access
          </p>
          <h1
            className="text-4xl lg:text-[2.75rem] leading-[1.1] mb-5 text-[#F6F5EC]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            Command your
            <br />
            energy, with conviction.
          </h1>
          <p className="text-sm leading-relaxed text-[#9FB8C9] max-w-xs">
            Portfolio tracking, market signals, and settlement — built for
            operators who move first.
          </p>

          {/* Signature: ascending bull-market line */}
          <svg
            viewBox="0 0 420 160"
            className="mt-10 w-full max-w-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#05627C" />
                <stop offset="100%" stopColor="#FBF676" />
              </linearGradient>
            </defs>
            {[30, 70, 110, 150].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="420"
                y2={y}
                stroke="#F6F5EC"
                strokeOpacity="0.06"
              />
            ))}
            <path
              className="bull-line"
              d="M0 130 L60 118 L100 132 L150 90 L190 100 L240 55 L290 68 L340 30 L420 12"
              stroke="url(#lineGlow)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle className="bull-dot" cx="420" cy="12" r="4" fill="#FBF676" />
          </svg>
        </div>

        <p className="relative z-10 text-xs text-[#9FB8C9]/70">
          © {new Date().getFullYear()} Big Bull Energies
        </p>
      </div>

      {/* Right — form panel */}
      <div
        className="relative flex items-center justify-center px-6 py-16 sm:px-10"
        style={{ backgroundColor: "#0C1A6B" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] md:hidden"
          style={{
            backgroundImage:
              "linear-gradient(#FBF676 1px, transparent 1px), linear-gradient(90deg, #FBF676 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        ></div>

        <div className="relative z-10 w-full max-w-sm fade-up">
          <div className="flex md:hidden justify-center mb-8">
            <Link href="/">
              <Image
                src="/image.png"
                alt="Big Bull Energies Logo"
                width={150}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-3"
            style={{ color: "#FBF676" }}
          >
            Sign In
          </p>
          <h2
            className="text-3xl mb-2 text-[#F6F5EC]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            Welcome back
          </h2>
          <p className="text-sm text-[#9FB8C9] mb-9">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-semibold transition-colors hover:opacity-80"
              style={{ color: "#FBF676" }}
            >
              Create one
            </a>
          </p>

          <form className="space-y-7" onSubmit={handleSubmit}>
            {successMessage && (
              <div
                className="border-l-2 px-4 py-3 rounded-r-md"
                style={{
                  borderColor: "#FBF676",
                  backgroundColor: "rgba(251,246,118,0.08)",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "#FBF676" }}>
                  {successMessage}
                </p>
              </div>
            )}
            {error && (
              <div className="border-l-2 border-red-400 bg-red-400/10 px-4 py-3 rounded-r-md">
                <p className="text-sm font-medium text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="user-id"
                  className="block text-xs font-semibold tracking-[0.15em] uppercase mb-2 text-[#9FB8C9]"
                >
                  User ID
                </label>
                <input
                  id="user-id"
                  name="user-id"
                  type="text"
                  required
                  className="underline-input w-full py-2.5 text-[#F6F5EC] placeholder-[#9FB8C9]/50 text-sm font-medium"
                  placeholder="BIGBULL-XXXXXX"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold tracking-[0.15em] uppercase mb-2 text-[#9FB8C9]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="underline-input w-full py-2.5 pr-10 text-[#F6F5EC] placeholder-[#9FB8C9]/50 text-sm font-medium"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center text-[#9FB8C9] hover:text-[#FBF676] focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href="/forgot-password"
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "#FBF676" }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cta-shimmer relative overflow-hidden w-full flex justify-center items-center py-3.5 px-4 rounded-md text-sm font-semibold tracking-[0.08em] uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: "#FBF676",
                color: "#0C1A6B",
              }}
            >
              {loading ? (
                <span className="flex items-center normal-case tracking-normal">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4"
                    style={{ color: "#0C1A6B" }}
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
                  Signing in
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-[#9FB8C9]">
            Administrator?{" "}
            <Link
              href="/admin/login"
              className="font-semibold transition-colors hover:opacity-80"
              style={{ color: "#FBF676" }}
            >
              Admin login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<BigBullLoader fullScreen />}>
      <LoginContent />
    </Suspense>
  );
}
