"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Network,
  ShieldCheck,
  TowerControl,
  Wind,
  Zap,
} from "lucide-react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Footer from "@/components/Footer";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";
const DARK = "#0B1F2A";
const MUTED = "#6b7c85";
const ACCENT = "#3FA9C8";
const FONT_HEADING = "var(--font-font4), sans-serif";

const HERO_FEATURES = [
  {
    icon: Wind,
    title: "Wind to Grid",
    desc: "Connecting farms to markets.",
  },
  {
    icon: Zap,
    title: "Efficient Transfer",
    desc: "Moving clean power with less loss.",
  },
  {
    icon: Activity,
    title: "Live Oversight",
    desc: "Monitoring interconnection paths.",
  },
  {
    icon: ShieldCheck,
    title: "Market Access",
    desc: "Reliable delivery for buyers.",
  },
];

const INTRO_PILLARS = [
  {
    icon: Network,
    title: "Interconnect",
    desc: "Link Big Bull wind assets to the wider grid.",
  },
  {
    icon: Zap,
    title: "Deliver",
    desc: "Move farm output safely from substation to market.",
  },
  {
    icon: ShieldCheck,
    title: "Enable",
    desc: "Give communities and offtakers dependable renewable supply.",
  },
];

const PROCESS_STEPS = [
  "Wind turbines generate electricity that is collected across the farm network.",
  "On-site transformers and the substation step voltage up for grid connection.",
  "Interconnection lines carry Big Bull wind power toward the transmission system.",
  "Grid substations condition and route energy into regional networks.",
  "Monitoring systems track flow, availability, and interconnection performance.",
  "Clean power reaches markets and demand centres from Big Bull wind assets.",
];

const WHY_POINTS = [
  "Moves remote wind generation to the markets that need it",
  "Improves delivery reliability for Big Bull Energies wind farms",
  "Supports renewable growth without stranded turbine capacity",
  "Builds a clearer path from wind resource to customer demand",
];

const STATS = [
  {
    value: 2,
    suffix: "",
    label: "Core wind hubs planned for grid connection",
    icon: Wind,
  },
  {
    value: 1,
    suffix: "",
    label: "Focus: farm-to-market interconnection for wind",
    icon: Network,
  },
  {
    value: 125,
    suffix: "",
    label: "Average MWh/day of clean power to move to grid",
    icon: Zap,
  },
];

function AnimatedStat({
  value,
  suffix,
  label,
  icon: Icon,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: typeof Zap;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 55, damping: 22 });
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);
  const [text, setText] = useState(`0${suffix}`);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, motionVal, value]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setText(v));
    return () => unsub();
  }, [display]);

  return (
    <div
      ref={ref}
      className="flex items-start gap-4 sm:gap-5 py-5 border-b border-[#d8e2e6] last:border-b-0"
    >
      <div
        className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(5,98,124,0.1)" }}
      >
        <Icon className="w-5 h-5" style={{ color: PRIMARY }} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p
          className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tabular-nums leading-none mb-1.5"
          style={{ fontFamily: FONT_HEADING, color: DARK }}
        >
          {text}
        </p>
        <p className="text-sm sm:text-[15px] leading-snug" style={{ color: MUTED }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export default function TransmissionPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <section className="relative w-full min-h-[100svh] min-h-[100dvh] flex flex-col justify-end overflow-hidden pt-24 sm:pt-28 lg:pt-[156px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/Transmission-hero.webp"
            alt="Grid connection infrastructure for Big Bull Energies wind farms"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
          />
        </div>

        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,24,40,0.82) 0%, rgba(8,24,40,0.55) 38%, rgba(8,24,40,0.2) 65%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(8,24,40,0.9) 0%, rgba(8,24,40,0.3) 42%, transparent 68%)",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center pb-6 sm:pb-8">
          <div className="max-w-[1220px] mx-auto w-full">
            <motion.div
              className="max-w-xl lg:max-w-[580px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-5"
                style={{ color: "#7DD3E8" }}
              >
                Big Bull Energies · Grid Connection
              </p>

              <h1
                className="text-[2.1rem] sm:text-5xl md:text-[3.15rem] lg:text-[3.4rem] font-bold leading-[1.1] mb-4 sm:mb-5 text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Wind farms{" "}
                <span style={{ color: ACCENT }}>connected</span> to markets.
              </h1>

              <p className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-md mb-7 sm:mb-8">
                Grid connection infrastructure that carries Big Bull Energies
                wind power from farm substations into regional networks and
                energy markets.
              </p>

              <Link
                href="#solutions"
                className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300"
                style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
              >
                Explore Grid Connection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>

        <div
          className="relative z-10 border-t border-white/10"
          style={{
            background: "rgba(8,24,40,0.55)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1220px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-0 py-5 sm:py-6">
              {HERO_FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className={`flex items-start gap-3 sm:px-4 lg:px-5 ${
                    i > 0 ? "lg:border-l lg:border-white/15" : ""
                  }`}
                >
                  <span
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border"
                    style={{
                      borderColor: "rgba(63,169,200,0.45)",
                      color: "#7DD3E8",
                    }}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-white/65 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="solutions"
        className="relative w-full bg-white py-14 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 xl:gap-16 items-center">
            <div>
              <div
                className="flex items-center gap-2.5 flex-wrap text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] mb-5 sm:mb-6"
                style={{ color: MUTED }}
              >
                <span style={{ color: PRIMARY }}>Energy Technologies</span>
                <span className="opacity-40">&gt;</span>
                <span>Grid Connection</span>
              </div>

              <h2
                className="text-[1.85rem] sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.15] mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Connecting Big Bull wind to the{" "}
                <span style={{ color: PRIMARY }}>grid.</span>
              </h2>

              <p
                className="text-sm sm:text-[15px] leading-[1.75] mb-8 sm:mb-10 max-w-lg"
                style={{ color: MUTED }}
              >
                Grid connection is how Big Bull Energies wind farms reach buyers.
                From collection systems and substations to interconnection
                pathways, every link is designed to move clean power safely and
                efficiently into the market.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4">
                {INTRO_PILLARS.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex sm:flex-col items-center sm:items-start gap-3"
                  >
                    <span
                      className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(5,98,124,0.1)" }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: PRIMARY }}
                        strokeWidth={1.75}
                      />
                    </span>
                    <div>
                      <p
                        className="text-sm font-bold mb-0.5"
                        style={{ color: PRIMARY }}
                      >
                        {title}
                      </p>
                      <p
                        className="text-xs sm:text-[13px] leading-relaxed"
                        style={{ color: MUTED }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-[520px] mx-auto lg:max-w-none lg:justify-self-end">
              <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_28px_64px_rgba(5,98,124,0.16)]">
                <Image
                  src="/img3.webp"
                  alt="Grid connection lines serving Big Bull wind farms"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 520px"
                />
              </div>

              <div
                className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-10 w-[48%] max-w-[200px] rounded-2xl px-4 py-4 text-center"
                style={{
                  background:
                    "linear-gradient(145deg, #05627C 0%, #0A4A5C 100%)",
                  boxShadow: "0 16px 40px rgba(5,98,124,0.35)",
                }}
              >
                <Zap className="w-6 h-6 mx-auto mb-2" style={{ color: GOLD }} />
                <p className="text-[10px] sm:text-[11px] leading-snug text-white/95 font-medium">
                  From turbine to market.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-[#F4F6F7] py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold max-w-md"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Grid connection for our wind assets
              </h2>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] hover:opacity-80 transition"
                style={{ color: PRIMARY }}
              >
                View All Projects
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
              <div>
                {STATS.map((stat) => (
                  <AnimatedStat key={stat.label} {...stat} />
                ))}
              </div>

              <div className="relative w-full aspect-[5/4] sm:aspect-[4/3]">
                <Image
                  src="/Transmission1.svg"
                  alt="Grid connection infrastructure for wind farms"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-white py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-center mb-10 sm:mb-12 lg:mb-14"
              style={{ fontFamily: FONT_HEADING, color: DARK }}
            >
              How wind farm grid connection works
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
              <ol className="flex flex-col gap-3.5 sm:gap-4 order-2 lg:order-1">
                {PROCESS_STEPS.map((text, i) => (
                  <li key={i} className="flex items-start gap-3.5 sm:gap-4">
                    <span
                      className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p
                      className="text-sm sm:text-[15px] leading-relaxed pt-1.5"
                      style={{ color: MUTED }}
                    >
                      {text}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] order-1 lg:order-2 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_24px_56px_rgba(5,98,124,0.14)]">
                <Image
                  src="/img6.webp"
                  alt="Power lines connecting wind farms to the grid"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-[#F7F9FA] py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
            <div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold mb-4 sm:mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Why <span style={{ color: PRIMARY }}>grid connection</span>
              </h2>

              <p
                className="text-sm sm:text-[15px] leading-[1.75] mb-6 sm:mb-7 max-w-lg"
                style={{ color: MUTED }}
              >
                Without a strong path to the grid, wind capacity stays stranded.
                Big Bull Energies treats interconnection as core to wind value:
              </p>

              <div className="space-y-4 sm:space-y-5">
                {WHY_POINTS.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5"
                      style={{ color: PRIMARY }}
                    />
                    <p
                      className="text-sm sm:text-[15px] md:text-base leading-relaxed"
                      style={{ color: MUTED }}
                    >
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full aspect-[5/4] sm:aspect-[4/3]">
              <Image
                src="/Transmission1.svg"
                alt="Grid connection benefits for Big Bull wind farms"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-white py-10 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-[1220px] mx-auto rounded-2xl sm:rounded-3xl px-6 sm:px-8 lg:px-10 py-7 sm:py-8 lg:py-9 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 lg:gap-8 overflow-hidden relative"
            style={{
              background:
                "linear-gradient(135deg, #05627C 0%, #0A4A5C 55%, #083D4A 100%)",
              boxShadow: "0 20px 50px rgba(5,98,124,0.28)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55 }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 50%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 88% 30%, rgba(245,207,11,0.22), transparent 40%)",
              }}
            />

            <div
              className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <TowerControl className="w-7 h-7" style={{ color: GOLD }} />
            </div>

            <h2
              className="relative flex-1 text-center sm:text-left text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white leading-snug"
              style={{ fontFamily: FONT_HEADING }}
            >
              Ready to connect Big Bull wind to the grid?
            </h2>

            <Link
              href="/contact"
              className="relative gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300 shrink-0"
              style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
            >
              Get In Touch
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
