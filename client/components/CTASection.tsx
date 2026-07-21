"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Leaf,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";
const DARK = "#1a2e35";
const FONT_HEADING = "var(--font-font4), sans-serif";

const featureCards = [
  {
    icon: Sprout,
    title: "Meaningful Impact",
    desc: "Work on projects that create a cleaner, greener and brighter tomorrow.",
  },
  {
    icon: BarChart3,
    title: "Grow Your Career",
    desc: "Opportunities to learn, lead and advance in a fast-growing industry.",
  },
  {
    icon: Users,
    title: "Innovative Culture",
    desc: "Collaborate with passionate people driving real change through innovation.",
  },
  {
    icon: ShieldCheck,
    title: "Better Future",
    desc: "Be part of a global movement building a reliable and renewable energy future.",
  },
];

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export default function CTASection() {
  const { ref: sectionRef, visible } = useInView();
  const clipId = useId().replace(/:/g, "");

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-white">
      {/* ── Hero ── */}
      <div className="relative lg:min-h-[540px]">
        {/* Left text */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-[1220px] mx-auto">
            <div
              className={`max-w-[440px] lg:max-w-[460px] py-10 sm:py-12 lg:py-[72px] transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {/* Careers badge */}
              <div className="flex items-center gap-2.5 mb-6">
                <div
                  className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Users className="w-[17px] h-[17px]" style={{ color: GOLD }} strokeWidth={2} />
                </div>
                <span
                  className="text-[13px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "#5a6a72" }}
                >
                  CAREERS
                </span>
                <div className="h-px w-11" style={{ backgroundColor: GOLD }} />
              </div>

              {/* Heading */}
              <h2
                className="text-[34px] sm:text-[40px] lg:text-[44px] font-bold leading-[1.14] mb-5"
                style={{ fontFamily: FONT_HEADING }}
              >
                <span style={{ color: DARK }}>Join us in</span>
                <br />
                <span style={{ color: PRIMARY }}>building the</span>
                <br />
                <span style={{ color: PRIMARY }}>
                  energy future
                  <span style={{ color: GOLD }}>.</span>
                </span>
              </h2>

              {/* Gold line */}
              <div className="h-[2px] w-[52px] mb-5" style={{ backgroundColor: GOLD }} />

              {/* Body */}
              <p
                className="text-[14px] sm:text-[15px] leading-[1.7] mb-8 max-w-[380px]"
                style={{ color: "#6b7c85" }}
              >
                At Big Bull Energies, we combine innovative binary investment
                systems with sustainable energy projects. Join thousands of
                investors building wealth while supporting renewable energy
                initiatives worldwide.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="cta-primary-btn group inline-flex items-center justify-center gap-2 font-bold px-6 py-[13px] text-[12px] uppercase tracking-[0.06em] rounded-[8px] transition-all duration-300"
                  style={{ backgroundColor: PRIMARY, color: "#fff" }}
                >
                  GET STARTED
                  <ArrowRight className="w-[15px] h-[15px]" style={{ color: GOLD }} strokeWidth={2.5} />
                </Link>
                <Link
                  href="/career-rewards"
                  className="cta-outline-btn group inline-flex items-center justify-center gap-2 font-bold px-6 py-[13px] text-[12px] uppercase tracking-[0.06em] rounded-[8px] border transition-all duration-300 bg-white"
                  style={{ borderColor: "#d1d9de", color: PRIMARY }}
                >
                  CAREER REWARDS
                  <ArrowRight className="w-[15px] h-[15px]" style={{ color: PRIMARY }} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / tablet image */}
        <div
          className={`lg:hidden relative mx-4 sm:mx-6 mb-8 h-[280px] sm:h-[340px] rounded-2xl overflow-hidden transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Image
            src="/images/cta.png"
            alt="Big Bull Energies team at solar farm"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute bottom-0 right-0 left-0 p-4"
            style={{
              background:
                "linear-gradient(to top, rgba(5,98,124,0.92) 0%, rgba(5,98,124,0.7) 60%, transparent 100%)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                <Leaf className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <p className="text-[13px] leading-snug text-white/95">
                Investing today for a{" "}
                <span className="font-bold" style={{ color: GOLD }}>
                  sustainable
                </span>{" "}
                tomorrow.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop image — full bleed with organic clip */}
        <div
          className={`hidden lg:block absolute top-0 right-0 bottom-0 w-[62%] xl:w-[58%] transition-all duration-1000 delay-100 ${
            visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
          }`}
        >
          <svg className="absolute w-0 h-0" aria-hidden>
            <defs>
              <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                <path d="M 0.22 0 C 0.11 0.04, 0.06 0.26, 0.05 0.46 C 0.03 0.66, 0.02 0.84, 0 1 L 1 1 L 1 0 Z" />
              </clipPath>
            </defs>
          </svg>

          {/* Decorative arc lines on curve edge */}
          <svg
            className="absolute left-[14%] sm:left-[12%] lg:left-[10%] top-[18%] h-[64%] w-[60px] sm:w-[72px] z-30 pointer-events-none"
            viewBox="0 0 60 320"
            fill="none"
            aria-hidden
          >
            <path
              d="M52 8 C28 70, 28 250, 52 312"
              stroke={PRIMARY}
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />
            <path
              d="M42 28 C22 82, 22 238, 42 292"
              stroke={PRIMARY}
              strokeWidth="0.8"
              strokeOpacity="0.28"
            />
            <path
              d="M32 48 C16 92, 16 228, 32 272"
              stroke={PRIMARY}
              strokeWidth="0.6"
              strokeOpacity="0.18"
            />
          </svg>

          {/* Clipped image container */}
          <div
            className="relative w-full h-full min-h-[540px]"
            style={{ clipPath: `url(#${clipId})` }}
          >
            <Image
              src="/images/cta.png"
              alt="Big Bull Energies team at solar farm"
              fill
              className="object-cover object-[center_30%]"
              sizes="(max-width: 1024px) 88vw, 58vw"
              priority
            />

            {/* Bottom-right teal overlay zone */}
            <div
              className="absolute bottom-0 right-0 w-[55%] sm:w-[50%] h-[42%] sm:h-[44%] pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(5,98,124,0.88) 0%, rgba(4,55,70,0.92) 100%)",
                borderTopLeftRadius: "120px 80px",
              }}
            >
              {/* Concentric circle pattern */}
              <svg
                className="absolute bottom-0 right-0 w-full h-full opacity-30"
                viewBox="0 0 200 200"
                preserveAspectRatio="xMaxYMax meet"
                aria-hidden
              >
                {[20, 40, 60, 80, 100, 120, 140].map((r) => (
                  <circle
                    key={r}
                    cx="200"
                    cy="200"
                    r={r}
                    fill="none"
                    stroke="white"
                    strokeWidth="0.6"
                    opacity={0.15 + (140 - r) * 0.002}
                  />
                ))}
              </svg>
            </div>

            {/* Glass info card */}
            <div className="absolute bottom-6 sm:bottom-8 right-5 sm:right-8 z-10 max-w-[260px] sm:max-w-[280px]">
              <div
                className="flex items-start gap-3 rounded-xl px-4 py-3.5 backdrop-blur-sm"
                style={{
                  background: "rgba(5,98,124,0.55)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <Leaf className="w-[18px] h-[18px]" style={{ color: GOLD }} strokeWidth={1.75} />
                </div>
                <p className="text-[13px] sm:text-[14px] leading-[1.45] text-white/95 pt-0.5">
                  Investing today for a{" "}
                  <span className="font-bold" style={{ color: GOLD }}>
                    sustainable
                  </span>{" "}
                  tomorrow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature cards ── */}
      <div className="bg-[#F4F6F7] py-10 sm:py-12 lg:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {featureCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={`cta-feature-card rounded-[16px] bg-white p-6 sm:p-7 transition-all duration-500 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{
                    boxShadow: "0 4px 24px rgba(5,98,124,0.07)",
                    transitionDelay: `${250 + i * 80}ms`,
                  }}
                >
                  {/* Filled teal icon circle */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    <Icon className="w-[22px] h-[22px]" style={{ color: GOLD }} strokeWidth={1.75} />
                  </div>

                  <h3
                    className="text-[17px] sm:text-[18px] font-bold mb-2.5 leading-snug"
                    style={{ color: PRIMARY }}
                  >
                    {card.title}
                  </h3>

                  <div className="h-[2px] w-9 mb-3" style={{ backgroundColor: GOLD }} />

                  <p className="text-[13px] sm:text-[14px] leading-[1.65]" style={{ color: "#7a8a92" }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
