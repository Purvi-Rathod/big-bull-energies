"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  LineChart,
  ShieldCheck,
  Sprout,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphingText } from "./MorphingText";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";
const DARK = "#1a2e35";
const MUTED = "#6b7c85";
const LABEL = "#5a6a72";
const FONT_HEADING = "var(--font-font4), sans-serif";

const MORPHING_WORDS = [
  "innovators",
  "developers",
  "entrepreneurs",
  "builders",
];

const FEATURES = [
  {
    icon: Sprout,
    label: "100% Sustainable Focus",
  },
  {
    icon: ShieldCheck,
    label: "Secure Transparent Investments",
  },
  {
    icon: LineChart,
    label: "Long Term Wealth Creation",
  },
] as const;

export default function ExpertiseSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".expertise-reveal",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-x-clip bg-white"
    >
      {/* Intro */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 md:pt-20 lg:pt-24">
        <div className="max-w-[1220px] mx-auto">
          <p
            className="expertise-reveal mx-auto mb-10 sm:mb-12 lg:mb-14 max-w-3xl text-center text-sm sm:text-[15px] md:text-base leading-[1.7]"
            style={{ color: MUTED }}
          >
            Big Bull Energies combines innovative binary investment systems with
            sustainable energy projects. We provide secure, transparent
            investment opportunities backed by renewable energy infrastructure,
            empowering investors to build wealth while supporting the global
            transition to clean energy.
          </p>
        </div>
      </div>

      {/* Main — text centered in left half, image flush to right edge */}
      <div className="relative lg:min-h-[560px] xl:min-h-[600px] pb-14 sm:pb-16 md:pb-20 lg:pb-24 lg:flex lg:items-center">
        {/* Left copy — centered in the left half */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="max-w-[1220px] mx-auto">
            <div className="w-full lg:w-[46%] xl:w-[44%] flex justify-center">
              <div className="relative w-full max-w-[440px] xl:max-w-[460px]">
              <div className="expertise-reveal flex items-center gap-2.5 mb-5 sm:mb-6">
                <div
                  className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Zap
                    className="w-[17px] h-[17px]"
                    style={{ color: GOLD }}
                    strokeWidth={2}
                  />
                </div>
                <span
                  className="text-[13px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: LABEL }}
                >
                  Expertise
                </span>
                <div className="h-px w-11" style={{ backgroundColor: GOLD }} />
              </div>

              <h2
                className="expertise-reveal text-[34px] sm:text-[40px] lg:text-[44px] font-bold leading-[1.14] mb-4 sm:mb-5"
                style={{ fontFamily: FONT_HEADING }}
              >
                <span style={{ color: DARK }}>We are</span>
                <span
                  className="block min-h-[1.15em] relative"
                  style={{ color: PRIMARY }}
                >
                  {/* Reserve width for longest word to avoid layout jump */}
                  <span
                    className="invisible block pointer-events-none select-none"
                    aria-hidden
                  >
                    entrepreneurs
                  </span>
                  <span className="absolute left-0 top-0">
                    <MorphingText
                      texts={MORPHING_WORDS}
                      inline
                      className="font-bold"
                      style={{
                        fontFamily: FONT_HEADING,
                        color: PRIMARY,
                        fontSize: "inherit",
                        lineHeight: "inherit",
                        fontWeight: 700,
                      }}
                    />
                  </span>
                </span>
                <span style={{ color: DARK }}>at heart</span>
                <span style={{ color: GOLD }}>.</span>
              </h2>

              <div
                className="expertise-reveal h-[2px] w-[52px] mb-5"
                style={{ backgroundColor: GOLD }}
              />

              <p
                className="expertise-reveal text-[14px] sm:text-[15px] leading-[1.7] max-w-[420px] mb-8 sm:mb-9"
                style={{ color: MUTED }}
              >
                Building wealth through innovative investment systems and
                sustainable energy solutions.
              </p>

              <div className="expertise-reveal grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-0 mb-8 sm:mb-10">
                {FEATURES.map(({ icon: Icon, label }, i) => (
                  <div
                    key={label}
                    className={`flex sm:flex-col items-center sm:items-start gap-3 sm:gap-3.5 sm:pr-3 lg:pr-4 ${
                      i > 0
                        ? "sm:border-l sm:border-[#e4eaed] sm:pl-3 lg:pl-4"
                        : ""
                    }`}
                  >
                    <span
                      className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      <Icon
                        className="w-[22px] h-[22px]"
                        style={{ color: GOLD }}
                        strokeWidth={1.75}
                      />
                    </span>
                    <p
                      className="text-[11px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.06em] leading-snug text-center sm:text-left"
                      style={{ color: PRIMARY }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/how-it-works"
                className="expertise-reveal expertise-cta group inline-flex items-center justify-center gap-2 font-bold px-6 py-[13px] text-[12px] uppercase tracking-[0.06em] rounded-[8px] transition-all duration-300"
                style={{ backgroundColor: PRIMARY, color: "#fff" }}
              >
                See How We Work
                <ArrowRight
                  className="w-[15px] h-[15px] transition-transform duration-300 group-hover:translate-x-0.5"
                  style={{ color: GOLD }}
                  strokeWidth={2.5}
                />
              </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / tablet — full-bleed image */}
        <div className="expertise-reveal lg:hidden relative w-full mt-10 sm:mt-12 mb-0 h-[300px] sm:h-[380px] md:h-[420px] overflow-hidden">
          <Image
            src="/rightside.png"
            alt="Big Bull Energies engineers at a clean energy facility"
            fill
            className="object-cover object-[center_30%]"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(5,98,124,0.88) 0%, rgba(5,98,124,0.35) 50%, transparent 100%)",
            }}
          />
          <div className="absolute left-4 right-4 bottom-4 sm:left-6 sm:bottom-6 z-10 max-w-[300px]">
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3.5 backdrop-blur-sm"
              style={{
                background: "rgba(5,98,124,0.72)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <Leaf
                  className="w-[18px] h-[18px]"
                  style={{ color: GOLD }}
                  strokeWidth={1.75}
                />
              </div>
              <p className="text-[13px] sm:text-[14px] leading-[1.45] text-white/95 pt-0.5">
                Driving a cleaner, more{" "}
                <span className="font-bold" style={{ color: GOLD }}>
                  sustainable
                </span>{" "}
                future for generations to come.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop — image flush to right page edge */}
        <div className="expertise-reveal hidden lg:block absolute top-0 right-0 bottom-0 w-[54%] xl:w-[52%]">
          <div
            className="expertise-image-frame relative w-full h-full overflow-hidden"
            style={{
              boxShadow: "0 24px 60px rgba(5,98,124,0.16)",
              borderRadius: "0 0 0 0",
            }}
          >
            {/* Soft left curve scoop */}
            <div
              className="pointer-events-none absolute top-0 left-0 z-[1] w-28 h-28 xl:w-32 xl:h-32 rounded-br-full bg-white"
              aria-hidden
            />

            <Image
              src="/rightside.png"
              alt="Big Bull Energies engineers at a clean energy facility"
              fill
              className="object-cover object-[center_30%]"
              sizes="54vw"
              priority
            />

            <div
              className="absolute bottom-0 left-0 right-0 h-[42%] pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(5,98,124,0.88) 0%, rgba(5,98,124,0.45) 55%, transparent 100%)",
              }}
            />

            <div className="absolute left-5 bottom-6 xl:left-8 xl:bottom-8 z-20 max-w-[270px]">
              <div
                className="flex items-start gap-3 rounded-xl px-4 py-3.5 backdrop-blur-sm"
                style={{
                  background: "rgba(5,98,124,0.72)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <Leaf
                    className="w-[18px] h-[18px]"
                    style={{ color: GOLD }}
                    strokeWidth={1.75}
                  />
                </div>
                <p className="text-[13px] sm:text-[14px] leading-[1.45] text-white/95 pt-0.5">
                  Driving a cleaner, more{" "}
                  <span className="font-bold" style={{ color: GOLD }}>
                    sustainable
                  </span>{" "}
                  future for generations to come.
                </p>
              </div>
            </div>
          </div>

          {/* Vertical badge tucked on the image, not past the page edge */}
          <div
            className="absolute right-3 top-1/2 z-20 flex items-center gap-2.5 rounded-full px-3 py-4"
            style={{
              backgroundColor: PRIMARY,
              boxShadow: "0 12px 32px rgba(5,98,124,0.35)",
              transform: "translateY(-50%) rotate(180deg)",
              writingMode: "vertical-rl",
            }}
          >
            <Leaf className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white whitespace-nowrap">
              Clean Energy, Better Tomorrow
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
