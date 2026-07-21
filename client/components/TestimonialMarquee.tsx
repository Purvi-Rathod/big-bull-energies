"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";
const DARK = "#1a2e35";
const FONT_HEADING = "var(--font-font4), sans-serif";

interface Testimonial {
  category: string;
  quote: string;
  name: string;
  title: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    category: "INVESTOR TESTIMONIAL",
    quote:
      "Big Bull Energies has transformed how I think about investment opportunities. The binary system is transparent, the returns are consistent, and the focus on sustainable energy makes me feel good about where my money is going. It's been a game-changer for my financial future.",
    name: "SARAH MITCHELL",
    title: "ACTIVE INVESTOR, BIG BULL ENERGIES",
    image: "/testimonial1.webp",
  },
  {
    category: "PARTNER TESTIMONIAL",
    quote:
      "Partnering with Big Bull Energies has been exceptional. Their commitment to renewable energy investments combined with their innovative binary MLM platform creates unique opportunities for growth. The team is professional, responsive, and truly dedicated to sustainable energy solutions.",
    name: "JAMES ANDERSON",
    title: "ENERGY PARTNER, BIG BULL ENERGIES",
    image: "/testimonial2.webp",
  },
];

function useInView(threshold = 0.1) {
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

export default function TestimonialMarquee() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const { ref: sectionRef, visible } = useInView();
  const current = testimonials[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      goTo((currentIndex + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const goTo = (index: number) => {
    if (animating || index === currentIndex) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setAnimating(false);
    }, 200);
  };

  const prev = () =>
    goTo((currentIndex - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((currentIndex + 1) % testimonials.length);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-14 sm:py-16 md:py-20 lg:py-24"
      style={{ backgroundColor: "#F5F7F8" }}
    >
      {/* Top-right faded solar farm background */}
      <div className="pointer-events-none absolute top-0 right-0 w-[50%] sm:w-[45%] lg:w-[42%] h-[280px] sm:h-[340px] opacity-60">
        <Image
          src="/images/cta-turbines.png"
          alt=""
          fill
          className="object-cover object-left-top"
          sizes="45vw"
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to left, transparent 10%, #F5F7F8 85%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 40%, #F5F7F8 100%)",
          }}
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1220px] mx-auto">
          {/* Header */}
          <div
            className={`mb-8 sm:mb-10 lg:mb-12 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em]"
                style={{ color: PRIMARY }}
              >
                {current.category}
              </span>
              <div className="h-px w-10 sm:w-12" style={{ backgroundColor: GOLD }} />
            </div>

            <h2
              className="text-[1.875rem] sm:text-[2.5rem] md:text-[2.75rem] lg:text-[3rem] font-bold leading-[1.15] mb-3 sm:mb-4"
              style={{ fontFamily: FONT_HEADING }}
            >
              <span style={{ color: DARK }}>How We Work </span>
              <span style={{ color: PRIMARY }}>with Partners</span>
            </h2>

            <p
              className="text-sm sm:text-[15px] leading-relaxed max-w-lg"
              style={{ color: "#6b7c85" }}
            >
              Strong partnerships drive sustainable impact. Here&apos;s what our
              partners say about working with us.
            </p>
          </div>

          {/* Testimonial card */}
          <div
            className={`relative rounded-[20px] sm:rounded-[24px] overflow-hidden transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ boxShadow: "0 12px 48px rgba(5,98,124,0.12)" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr]">
              {/* Left — teal photo panel */}
              <div
                className="relative flex flex-col items-center justify-center gap-10 py-12 sm:py-14 lg:py-16 px-6 min-h-[320px] lg:min-h-[420px] overflow-hidden"
                style={{ backgroundColor: PRIMARY }}
              >
                {/* Portrait + decorations */}
                <div className="relative z-10 flex items-center justify-center w-[168px] h-[168px] sm:w-[188px] sm:h-[188px]">
                  {/* Concentric rings — centered on portrait */}
                  {[100, 130, 160, 190].map((size) => (
                    <div
                      key={size}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 pointer-events-none"
                      style={{ width: size, height: size }}
                    />
                  ))}

                  {/* Gold orbit */}
                  <svg
                    className="testimonial-gold-orbit absolute left-1/2 top-1/2 w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none"
                    viewBox="0 0 100 100"
                    aria-hidden
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      fill="none"
                      stroke={GOLD}
                      strokeWidth="1.5"
                      strokeDasharray="36 260"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    <circle cx="86" cy="26" r="2.4" fill={GOLD} />
                  </svg>

                  {/* Circular photo — perfectly centered */}
                  <div className="relative z-10 w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-full overflow-hidden border-[3px] border-white shadow-lg shrink-0">
                    <Image
                      key={currentIndex}
                      src={current.image}
                      alt={current.name}
                      fill
                      className={`object-cover object-center transition-opacity duration-300 ${
                        animating ? "opacity-0" : "opacity-100"
                      }`}
                      sizes="160px"
                      style={{ objectPosition: "center center" }}
                    />
                  </div>
                </div>

                {/* Nav controls */}
                <div className="relative z-10 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={prev}
                    className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white transition-all duration-300 hover:bg-white/15 hover:border-white/70"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                  </button>

                  <span className="text-sm font-medium text-white/90 tabular-nums tracking-wide min-w-[48px] text-center">
                    {currentIndex + 1} / {testimonials.length}
                  </span>

                  <button
                    type="button"
                    onClick={next}
                    className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white transition-all duration-300 hover:bg-white/15 hover:border-white/70"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Right — quote content */}
              <div
                className="relative bg-[#F8FAFB] px-7 sm:px-10 lg:px-12 xl:px-14 py-10 sm:py-12 lg:py-14 flex flex-col justify-center min-h-[280px] lg:min-h-[420px]"
              >
                {/* Dot grid — top right */}
                <div
                  className="absolute top-6 right-6 sm:top-8 sm:right-10 grid grid-cols-6 gap-1.5 opacity-40 pointer-events-none"
                  aria-hidden
                >
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: "#b0c4cc" }}
                    />
                  ))}
                </div>

                {/* Large faint quote mark — bottom right */}
                <span
                  className="absolute bottom-2 right-6 sm:right-10 text-[120px] sm:text-[160px] leading-none font-serif select-none pointer-events-none opacity-[0.07]"
                  style={{ color: PRIMARY }}
                  aria-hidden
                >
                  &rdquo;
                </span>

                {/* Solid quote icon */}
                <div
                  className={`mb-5 sm:mb-6 transition-all duration-300 ${
                    animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}
                >
                  <svg
                    width="36"
                    height="28"
                    viewBox="0 0 36 28"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M0 28V16.8C0 11.2 1.4 6.8 4.2 3.6C7 0.4 10.8 -0.8 15.6 0V6.4C12.8 6.4 10.8 7.4 9.6 9.4C8.4 11.4 7.8 13.8 7.8 16.6H15.6V28H0ZM20.4 28V16.8C20.4 11.2 21.8 6.8 24.6 3.6C27.4 0.4 31.2 -0.8 36 0V6.4C33.2 6.4 31.2 7.4 30 9.4C28.8 11.4 28.2 13.8 28.2 16.6H36V28H20.4Z"
                      fill={PRIMARY}
                    />
                  </svg>
                </div>

                {/* Quote text */}
                <p
                  className={`text-[15px] sm:text-base md:text-lg leading-[1.75] mb-6 sm:mb-8 max-w-xl transition-all duration-300 ${
                    animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}
                  style={{ color: "#3d5058" }}
                >
                  &ldquo;{current.quote}&rdquo;
                </p>

                {/* Divider + attribution */}
                <div
                  className={`transition-all duration-300 ${
                    animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}
                >
                  <div className="h-px w-12 mb-4 bg-slate-300" />
                  <p
                    className="text-[13px] sm:text-sm font-bold uppercase tracking-[0.08em] mb-1"
                    style={{ color: PRIMARY }}
                  >
                    {current.name}
                  </p>
                  <p
                    className="text-[11px] sm:text-xs uppercase tracking-[0.1em]"
                    style={{ color: "#94a3ad" }}
                  >
                    {current.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
