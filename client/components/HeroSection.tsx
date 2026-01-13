"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  // YouTube video ID extracted from URL: https://youtu.be/EWeTt4RbTVU?si=MjfxIk5ic-kFYBEu
  const youtubeVideoId = "EWeTt4RbTVU";

  useEffect(() => {
    // YouTube iframe API loads faster than local video
    const timer = setTimeout(() => {
      setIsLoading(false);
      setVideoReady(true);
    }, 500); // Small delay to show loading state

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 md:pt-28 lg:pt-36">
      {/* Background Video - YouTube Embed */}
      <div className="absolute inset-0 z-0">
        {/* YouTube iframe embed - optimized for performance */}
        <iframe
          className="absolute inset-0 w-full h-full object-cover"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
          title="Crown Bankers Solar Plant Video"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            pointerEvents: 'none', // Prevent interaction with video
          }}
          loading="lazy"
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-sm">Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 to-gray-800/40 z-0"></div>
      </div>

      {/* Centered Text */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-8 md:py-12">
        <h1
          className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight font-normal mb-6 md:mb-8"
          style={{
            fontFamily: "var(--font-font4), 'Font4', sans-serif",
            textShadow:
              "0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)",
          }}
        >
          Accelerating cleaner, more
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          reliable, affordable energy
        </h1>
        {/* Sign Up Button */}
        <Link
          href="/signup"
          className="inline-block bg-[#ffcf0B] text-gray-900 font-bold px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 text-sm sm:text-base md:text-lg uppercase tracking-wide transition hover:opacity-90 shadow-lg"
          style={{ borderRadius: "0" }}
        >
          SIGN UP NOW
        </Link>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-white text-xs tracking-widest uppercase mb-1">
          SCROLL
        </span>
        <div className="w-px h-8 md:h-10 bg-white"></div>
        <svg
          className="w-4 h-4 text-white animate-bounce mt-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* YouTube Link Button */}
      <a
        href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-[#ffcf0B] group"
        aria-label="Watch on YouTube"
        title="Watch on YouTube"
      >
        <svg
          className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:text-gray-900"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </a>
    </section>
  );
}
