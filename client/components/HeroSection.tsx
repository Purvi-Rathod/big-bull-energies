"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  Leaf,
  Play,
  Sun,
  Users,
  Wind,
  X,
} from "lucide-react";
import gsap from "gsap";

const GOLD = "#F5CF0B";
const FONT_HEADING = "var(--font-font4), 'Font4', sans-serif";
const YOUTUBE_VIDEO_ID = "EWeTt4RbTVU";

const STATS = [
  { icon: Sun, label: "500+ MW Installed Capacity" },
  { icon: Wind, label: "20+ Projects Completed" },
  { icon: Users, label: "10K+ Investors Worldwide" },
  { icon: Globe2, label: "5 Countries Operated" },
  { icon: Leaf, label: "100% Commitment to Clean Energy" },
] as const;

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [showVideo, setShowVideo] = useState(false);
  const [canParallax, setCanParallax] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanParallax(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!showVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowVideo(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [showVideo]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced || !contentRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-reveal",
        { opacity: 0, y: 28, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.1,
        },
      ).fromTo(
        ".hero-stat-item",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
        },
        "-=0.3",
      );
    }, contentRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!canParallax || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setParallax({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      className="relative w-full overflow-hidden flex flex-col justify-end min-h-[100svh] min-h-[100dvh] pt-24 sm:pt-28 md:pt-32 lg:pt-[9.75rem]"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-[-3%] sm:inset-[-4%] will-change-transform"
          style={{
            transform: canParallax
              ? `translate(${parallax.x * -14}px, ${parallax.y * -10}px)`
              : undefined,
            transition: canParallax ? "transform 0.45s ease-out" : undefined,
          }}
        >
          <div className="hero-bg-drift absolute inset-0">
            <Image
              src="/images/hero-emblem.png"
              alt="Big Bull Energies — clean energy landmark"
              fill
              priority
              className="object-cover object-[72%_40%] sm:object-[62%_center] md:object-[58%_center] lg:object-center"
              sizes="100vw"
              quality={90}
            />
          </div>
        </div>

        <div className="hero-light-sweep pointer-events-none absolute inset-0 z-[1] hidden sm:block" />

        {/* Mobile: stronger vertical wash so text stays readable over emblem */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none lg:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,14,26,0.55) 0%, rgba(3,14,26,0.28) 28%, rgba(3,14,26,0.45) 58%, rgba(3,14,26,0.88) 100%)",
          }}
        />

        {/* Desktop: left-side text veil, emblem stays clear on the right */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none hidden lg:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(4,18,32,0.82) 0%, rgba(4,18,32,0.58) 26%, rgba(4,18,32,0.2) 46%, transparent 62%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[48%] sm:h-[40%] lg:h-[38%] z-[2] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(3,14,26,0.92) 0%, rgba(3,14,26,0.4) 55%, transparent 100%)",
          }}
        />

        <div
          className="hero-sun-glow pointer-events-none absolute left-[-12%] sm:left-[-8%] top-[12%] sm:top-[18%] w-[55%] sm:w-[42%] h-[40%] sm:h-[50%] z-[1] opacity-70 sm:opacity-100"
          style={{
            background:
              "radial-gradient(ellipse, rgba(245,207,11,0.22) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 w-full flex-1 flex flex-col justify-end"
      >
        <div className="w-full pb-2 sm:pb-3 md:pb-4 lg:pb-5 pt-4 sm:pt-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1220px] mx-auto">
              {/* Copy */}
              <div className="w-full max-w-xl lg:max-w-[540px] xl:max-w-[580px] mb-10 sm:mb-14 lg:mb-20">
                <div className="hero-reveal flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
                  <span
                    className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.22em] leading-snug"
                    style={{ color: GOLD }}
                  >
                    Clean Energy. Stronger Tomorrow.
                  </span>
                  <div
                    className="hidden sm:block h-px flex-shrink-0 w-10 md:w-16"
                    style={{ backgroundColor: GOLD }}
                  />
                </div>

                <h1
                  className="hero-reveal text-[1.85rem] sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.6rem] font-extrabold leading-[1.1] tracking-tight mb-3 sm:mb-4 md:mb-5 text-white"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  Powering a Sustainable{" "}
                  <span className="hero-future-glow" style={{ color: GOLD }}>
                    Future
                  </span>
                </h1>

                <p className="hero-reveal text-[13px] sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-[34rem] mb-5 sm:mb-7 md:mb-8">
                  Big Bull Energies combines innovative investment systems with
                  sustainable energy projects. Together, we build wealth while
                  supporting the global transition to clean energy.
                </p>

                <div className="hero-reveal flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                  <Link
                    href="/signup"
                    className="hero-cta-primary group inline-flex items-center justify-between sm:justify-start gap-2.5 font-bold pl-5 sm:pl-6 pr-2 py-2 text-xs sm:text-sm uppercase tracking-wide rounded-full transition-all duration-300 w-full sm:w-auto"
                    style={{
                      backgroundColor: GOLD,
                      color: "#1a1a1a",
                      boxShadow: "0 8px 28px rgba(245,207,11,0.35)",
                    }}
                  >
                    Get Started
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-black/10 transition-transform duration-300 group-hover:scale-105">
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                  </Link>

                  {/* <button
                    type="button"
                    onClick={() => setShowVideo(true)}
                    className="hero-cta-video group inline-flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-white text-[11px] sm:text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 w-full sm:w-auto py-1.5"
                  >
                    <span className="hero-play-pulse relative w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/55 flex items-center justify-center bg-white/10 backdrop-blur-sm shrink-0">
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white ml-0.5" />
                    </span>
                    Watch Intro Video
                  </button> */}
                </div>
              </div>
            </div>
          </div>

          {/* Full-bleed stats marquee — no box, sits lower */}
          <div className="hero-reveal hero-stats-marquee relative w-full mt-2 sm:mt-4 overflow-hidden">
            <div className="hero-stats-track flex w-max py-2 sm:py-2.5">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="flex items-center shrink-0"
                  aria-hidden={copy === 1}
                >
                  {STATS.map(({ icon: Icon, label }) => (
                    <div
                      key={`${copy}-${label}`}
                      className="hero-stat-item flex items-center gap-2.5 sm:gap-3 px-5 sm:px-7 lg:px-8 whitespace-nowrap"
                    >
                      <span
                        className="hero-stat-icon shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border border-cyan-300/30"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(63,169,200,0.28) 0%, rgba(5,98,124,0.22) 100%)",
                          color: "#7DD3E8",
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          strokeWidth={1.75}
                        />
                      </span>
                      <span className="text-[11px] sm:text-xs md:text-[13px] font-medium text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video modal */}
      {showVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowVideo(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Intro video"
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
              title="Big Bull Energies intro video"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
            <button
              type="button"
              onClick={() => setShowVideo(false)}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
              aria-label="Close video"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
