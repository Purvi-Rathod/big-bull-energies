"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        setIsLoading(false);
        // Start playing once video can play
        video.play().catch(() => {
          setIsPlaying(false);
        });
      };

      const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        setIsPlaying(false);
      };

      const handleLoadStart = () => {
        setIsLoading(true);
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.addEventListener('loadstart', handleLoadStart);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadstart', handleLoadStart);
      };
    }
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 md:pt-28 lg:pt-36">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}
        >
          <source src="/solar-plant-groningen.mp4" type="video/mp4" />
          {/* Fallback message if video fails to load */}
          Your browser does not support the video tag.
        </video>
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-sm">Loading video...</p>
            </div>
          </div>
        )}
        {/* Error fallback */}
        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
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

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-[#ffcf0B]"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? (
          // Pause icon (two vertical lines)
          <svg
            className="w-4 h-4 md:w-5 md:h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          // Play icon (triangle)
          <svg
            className="w-4 h-4 md:w-5 md:h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </section>
  );
}
