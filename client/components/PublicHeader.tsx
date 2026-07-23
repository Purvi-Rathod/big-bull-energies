"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicHeader() {
  const { user } = useAuth();

  return (
    <nav className="relative z-50 px-6 py-4 backdrop-blur-md bg-black/90 border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image
            src="/image.png"
            alt="Big Bull Energies Logo"
            width={180}
            height={60}
            className="h-14 w-auto"
            priority
            quality={95}
          />
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          <Link
            href="/how-to-start"
            className="px-3 py-2 text-white/90 hover:text-yellow-400 transition-colors font-medium text-sm"
          >
            How to Start
          </Link>
          <Link
            href="/how-it-works"
            className="px-3 py-2 text-white/90 hover:text-yellow-400 transition-colors font-medium text-sm"
          >
            How It Works
          </Link>
          <Link
            href="/binary-investment-system"
            className="px-3 py-2 text-white/90 hover:text-yellow-400 transition-colors font-medium text-sm"
          >
            Binary Investment System
          </Link>
          <Link
            href="/support"
            className="px-3 py-2 text-white/90 hover:text-yellow-400 transition-colors font-medium text-sm"
          >
            Support
          </Link>
          <Link
            href="/about-us"
            className="px-3 py-2 text-white/90 hover:text-yellow-400 transition-colors font-medium text-sm"
          >
            About Us
          </Link>
          <Link
            href="/policy"
            className="px-3 py-2 text-white/90 hover:text-yellow-400 transition-colors font-medium text-sm"
          >
            Privacy & Terms
          </Link>
          <Link
            href="/legal"
            className="px-3 py-2 text-white/90 hover:text-yellow-400 transition-colors font-medium text-sm"
          >
            Legal
          </Link>
        </div>

        {/* Mobile Navigation - Dropdown or Hidden */}
        <div className="lg:hidden flex-1"></div>

        {/* Auth Buttons */}
        <div className="flex gap-4 flex-shrink-0">
          {user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-white hover:text-yellow-400 transition-colors font-medium text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-white hover:text-yellow-400 transition-colors font-medium text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg hover:shadow-yellow-500/50 font-semibold text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
