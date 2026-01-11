"use client";

import Image from "next/image";
import Link from "next/link";

export default function ImpactSection() {
  return (
    <section className="relative w-full min-h-screen bg-white overflow-hidden py-8 sm:py-12 md:py-16 lg:py-20">
      {/* Background Images */}
      <div className="absolute inset-0">
        {/* Top Left Image - banner.jpeg */}
        <div className="absolute top-0 left-0 w-full sm:w-1/2 h-1/3 sm:h-1/2 z-0">
          <Image
            src="/banner.jpeg"
            alt="Community workers"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Bottom Right Image - banner2.jpeg */}
        <div className="absolute bottom-0 right-0 w-full sm:w-1/2 h-1/3 sm:h-1/2 z-0">
          <Image
            src="/banner2.jpeg"
            alt="Community member"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Light Green Gradient in White Space - Bottom Left */}
        <div className="absolute bottom-0 left-0 w-full sm:w-1/2 h-1/3 sm:h-1/2 bg-gradient-to-tr from-[#E8F5F0]/60 to-[#E8F5F0]/30 z-0"></div>
      </div>

      {/* Content Overlay - Centered */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center py-12 sm:py-16 md:py-20">
        <div className="w-full max-w-lg lg:max-w-xl">
          {/* Dark Green Text Box */}
          <div
            className="p-6 sm:p-8 md:p-10 lg:p-12 mb-4 sm:mb-6"
            style={{ backgroundColor: "#042B19" }}
          >
            <p
              className="text-xs sm:text-sm font-medium mb-3 sm:mb-4 uppercase tracking-wide"
              style={{ color: "#ffffff" }}
            >
              INVENERGY IMPACT
            </p>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal leading-tight"
              style={{
                color: "#ffffff",
                fontFamily: "var(--font-custom), 'CustomFont', sans-serif",
              }}
            >
              Making a positive difference in the communities we serve.
            </h2>
          </div>

          {/* Yellow Button */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg group"
            style={{
              backgroundColor: "#ffcf0B",
              color: "#042B19",
            }}
          >
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              GET STARTED
            </span>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
