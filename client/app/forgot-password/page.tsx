"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.forgotPassword(userId);
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send password reset email. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Left — brand panel */}
      <div
        className="relative hidden md:flex flex-col justify-between overflow-hidden px-14 py-12"
        style={{
          background:
            "linear-gradient(160deg, #081148 0%, #0C1A6B 50%, #05627C 130%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#FBF676 1px, transparent 1px), linear-gradient(90deg, #FBF676 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

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
            Account Recovery
          </p>
          <h1
            className="text-4xl lg:text-[2.75rem] leading-[1.1] mb-5 text-[#F6F5EC]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            Reset access,
            <br />
            stay in control.
          </h1>
          <p className="text-sm leading-relaxed text-[#9FB8C9] max-w-xs">
            Enter your User ID and we&apos;ll email you a secure link to set a
            new password.
          </p>

          <svg
            viewBox="0 0 420 160"
            className="mt-10 w-full max-w-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <defs>
              <linearGradient id="lineGlowForgot" x1="0" y1="0" x2="1" y2="0">
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
              stroke="url(#lineGlowForgot)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              className="bull-dot"
              cx="420"
              cy="12"
              r="4"
              fill="#FBF676"
            />
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
        />

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

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#9FB8C9] hover:text-[#FBF676] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {success ? (
            <div className="space-y-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: "rgba(251,246,118,0.12)" }}
              >
                <CheckCircle2 className="w-7 h-7" style={{ color: "#FBF676" }} />
              </div>

              <div>
                <p
                  className="text-xs font-semibold tracking-[0.3em] uppercase mb-3"
                  style={{ color: "#FBF676" }}
                >
                  Check Your Inbox
                </p>
                <h2
                  className="text-3xl mb-3 text-[#F6F5EC]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                >
                  Reset link sent
                </h2>
                <p className="text-sm leading-relaxed text-[#9FB8C9]">
                  A password reset link has been sent to the email associated
                  with your User ID. Follow the instructions to set a new
                  password.
                </p>
              </div>

              <div
                className="flex items-start gap-3 border-l-2 px-4 py-3 rounded-r-md"
                style={{
                  borderColor: "#FBF676",
                  backgroundColor: "rgba(251,246,118,0.08)",
                }}
              >
                <Mail
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: "#FBF676" }}
                />
                <p className="text-sm text-[#F6F5EC]/90">
                  Don&apos;t see it? Check spam or request another link in a few
                  minutes.
                </p>
              </div>

              <Link
                href="/login"
                className="cta-shimmer relative overflow-hidden w-full flex justify-center items-center py-3.5 px-4 rounded-md text-sm font-semibold tracking-[0.08em] uppercase transition-transform duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: "#FBF676", color: "#0C1A6B" }}
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <p
                className="text-xs font-semibold tracking-[0.3em] uppercase mb-3"
                style={{ color: "#FBF676" }}
              >
                Forgot Password
              </p>
              <h2
                className="text-3xl mb-2 text-[#F6F5EC]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                Recover access
              </h2>
              <p className="text-sm text-[#9FB8C9] mb-9">
                Enter your User ID and we&apos;ll send a secure reset link.
              </p>

              <form className="space-y-7" onSubmit={handleSubmit}>
                {error && (
                  <div className="border-l-2 border-red-400 bg-red-400/10 px-4 py-3 rounded-r-md">
                    <p className="text-sm font-medium text-red-300">{error}</p>
                  </div>
                )}

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
                    autoComplete="username"
                    className="underline-input w-full py-2.5 text-[#F6F5EC] placeholder-[#9FB8C9]/50 text-sm font-medium"
                    placeholder="BIGBULL-XXXXXX"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cta-shimmer relative overflow-hidden w-full flex justify-center items-center py-3.5 px-4 rounded-md text-sm font-semibold tracking-[0.08em] uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ backgroundColor: "#FBF676", color: "#0C1A6B" }}
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
