"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Battery,
  BatteryCharging,
  CheckCircle2,
  Gauge,
  ShieldCheck,
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
    title: "Firms Wind Output",
    desc: "Smooth intermittent generation.",
  },
  {
    icon: BatteryCharging,
    title: "Store Surplus",
    desc: "Capture wind when it is strongest.",
  },
  {
    icon: Gauge,
    title: "Dispatch When Needed",
    desc: "Release power at peak demand.",
  },
  {
    icon: ShieldCheck,
    title: "Grid Confidence",
    desc: "More reliable renewable supply.",
  },
];

const INTRO_PILLARS = [
  {
    icon: Battery,
    title: "Capture",
    desc: "Store excess wind energy during high-output periods.",
  },
  {
    icon: Zap,
    title: "Balance",
    desc: "Manage charge and discharge around wind variability.",
  },
  {
    icon: ShieldCheck,
    title: "Deliver",
    desc: "Supply steadier power when the wind eases.",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    text: "Big Bull wind farms generate clean electricity when wind conditions are strong.",
  },
  {
    num: "02",
    text: "Surplus output that the grid cannot take immediately is directed into battery storage.",
  },
  {
    num: "03",
    text: "Smart controls manage charge and discharge to firm intermittent wind profiles.",
  },
  {
    num: "04",
    text: "Stored energy is released when demand rises or wind output dips.",
  },
  {
    num: "05",
    text: "Markets and communities receive more dependable renewable power from the portfolio.",
  },
];

const FLOW_STEPS = [
  { icon: Wind, label: "Wind Generation" },
  { icon: Battery, label: "Energy Storage" },
  { icon: Gauge, label: "Smart Dispatch" },
  { icon: Zap, label: "Firmed Power" },
];

const WHY_POINTS = [
  "Firms intermittent wind so output better matches market and grid needs",
  "Reduces curtailment by capturing surplus wind generation",
  "Supports peak demand with stored clean energy when wind output dips",
  "Strengthens Big Bull Energies’ wind-led renewable portfolio",
];

const STATS = [
  {
    value: 2,
    suffix: "",
    label: "Wind hubs paired with storage planning",
    icon: Wind,
  },
  {
    value: 4,
    suffix: "+ hr",
    label: "Typical discharge window for firming wind",
    icon: Battery,
  },
  {
    value: 1,
    suffix: "",
    label: "Integrated strategy: wind first, storage support",
    icon: Zap,
  },
  {
    value: 24,
    suffix: "/7",
    label: "Monitoring of storage with wind assets",
    icon: ShieldCheck,
  },
];

function AnimatedStat({
  value,
  suffix,
  label,
  icon: Icon,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: typeof Battery;
  decimals?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 55, damping: 22 });
  const display = useTransform(spring, (v) =>
    decimals > 0 ? v.toFixed(decimals) : `${Math.round(v)}`,
  );
  const [text, setText] = useState(decimals > 0 ? (0).toFixed(decimals) : "0");

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, motionVal, value]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setText(v));
    return () => unsub();
  }, [display]);

  return (
    <div ref={ref} className="flex flex-col gap-3 py-2">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(5,98,124,0.1)" }}
      >
        <Icon className="w-5 h-5" style={{ color: PRIMARY }} strokeWidth={1.75} />
      </div>
      <p
        className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tabular-nums leading-none"
        style={{ fontFamily: FONT_HEADING, color: DARK }}
      >
        {text}
        {suffix}
      </p>
      <p className="text-sm leading-snug max-w-[200px]" style={{ color: MUTED }}>
        {label}
      </p>
    </div>
  );
}

export default function StoragePage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <section className="relative w-full min-h-[100svh] min-h-[100dvh] flex flex-col justify-end overflow-hidden pt-24 sm:pt-28 lg:pt-[156px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/storage-hero.png"
            alt="Energy storage supporting Big Bull Energies wind farms"
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
                Big Bull Energies · Energy Storage for Wind
              </p>

              <h1
                className="text-[2.15rem] sm:text-5xl md:text-[3.15rem] lg:text-[3.45rem] font-bold leading-[1.1] mb-4 sm:mb-5 text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Storage that{" "}
                <span style={{ color: ACCENT }}>firms the wind.</span>
              </h1>

              <p className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-md mb-7 sm:mb-8">
                Battery systems designed to firm Big Bull Energies wind output —
                capturing surplus generation and releasing clean power when the
                grid needs it most.
              </p>

              <Link
                href="#solutions"
                className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300"
                style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
              >
                Explore Storage for Wind
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
                <span className="opacity-40">/</span>
                <span>Energy Storage for Wind</span>
              </div>

              <h2
                className="text-[1.85rem] sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.15] mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Batteries that back Big Bull{" "}
                <span style={{ color: PRIMARY }}>wind.</span>
              </h2>

              <p
                className="text-sm sm:text-[15px] leading-[1.75] mb-8 sm:mb-10 max-w-lg"
                style={{ color: MUTED }}
              >
                Energy storage is not a standalone story for Big Bull Energies —
                it is how we firm intermittent wind, cut curtailment, and deliver
                cleaner power with greater confidence to grids and participants.
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
                  src="/img4.webp"
                  alt="Battery storage paired with Big Bull wind infrastructure"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 520px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-[#F4F6F7] py-14 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold max-w-md"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Storage aligned to our wind portfolio
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

            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-12 items-center">
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-10">
                {STATS.map((stat) => (
                  <AnimatedStat key={stat.label} {...stat} />
                ))}
              </div>

              <div className="relative w-full aspect-[5/4] sm:aspect-[4/3]">
                <Image
                  src="/Storage1.svg"
                  alt="Energy storage supporting wind generation"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 40vw"
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
              How storage firms Big Bull wind
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
              <ol className="flex flex-col gap-3.5 sm:gap-4 order-2 lg:order-1">
                {PROCESS_STEPS.map(({ num, text }) => (
                  <li key={num} className="flex items-start gap-3.5 sm:gap-4">
                    <span
                      className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {num}
                    </span>
                    <p
                      className="text-sm sm:text-[15px] leading-relaxed pt-2"
                      style={{ color: MUTED }}
                    >
                      {text}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="order-1 lg:order-2">
                <div className="relative w-full aspect-[5/4] sm:aspect-[4/3] mb-6 sm:mb-8">
                  <Image
                    src="/image copy.png"
                    alt="How energy storage firms wind generation"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2">
                  {FLOW_STEPS.map(({ icon: Icon, label }, i) => (
                    <div
                      key={label}
                      className="relative flex flex-col items-center text-center gap-2 px-1"
                    >
                      <span
                        className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(5,98,124,0.1)" }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: PRIMARY }}
                          strokeWidth={1.75}
                        />
                      </span>
                      <p
                        className="text-[11px] sm:text-xs font-medium leading-snug"
                        style={{ color: MUTED }}
                      >
                        {label}
                      </p>
                      {i < FLOW_STEPS.length - 1 && (
                        <ArrowRight
                          className="hidden sm:block absolute top-3.5 -right-2 w-3.5 h-3.5 opacity-40"
                          style={{ color: PRIMARY }}
                        />
                      )}
                    </div>
                  ))}
                </div>
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
                Why storage for{" "}
                <span style={{ color: PRIMARY }}>wind</span>
              </h2>

              <p
                className="text-sm sm:text-[15px] leading-[1.75] mb-6 sm:mb-7 max-w-lg"
                style={{ color: MUTED }}
              >
                For a wind-first platform, storage is the bridge between variable
                generation and dependable delivery.
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

            <div className="relative w-full aspect-[5/4] sm:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_24px_56px_rgba(5,98,124,0.14)]">
              <Image
                src="/img6.webp"
                alt="Storage containers supporting renewable wind energy"
                fill
                className="object-cover"
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
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 85% 30%, rgba(245,207,11,0.25), transparent 40%)",
              }}
            />

            <div
              className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Battery className="w-7 h-7" style={{ color: GOLD }} />
            </div>

            <h2
              className="relative flex-1 text-center sm:text-left text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white leading-snug"
              style={{ fontFamily: FONT_HEADING }}
            >
              Ready to firm Big Bull wind with storage?
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
