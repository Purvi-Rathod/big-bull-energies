"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cog,
  Gauge,
  Settings2,
  Wind,
  Zap,
} from "lucide-react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import Footer from "@/components/Footer";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";
const DARK = "#0B1F2A";
const MUTED = "#6b7c85";
const ACCENT = "#3FA9C8";
const FONT_HEADING = "var(--font-font4), sans-serif";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const HERO_FEATURES = [
  {
    icon: Wind,
    title: "Rotor & blades",
    desc: "Optimized lift for more capture.",
  },
  {
    icon: Cog,
    title: "Nacelle systems",
    desc: "Generator, drive train, controls.",
  },
  {
    icon: Gauge,
    title: "Performance",
    desc: "High capacity factors on site.",
  },
  {
    icon: Settings2,
    title: "Smart control",
    desc: "Yaw, pitch, and SCADA ready.",
  },
];

const PILLARS = [
  {
    icon: Wind,
    title: "Blade technology",
    desc: "Aerodynamic profiles engineered to harvest more energy across a wider wind-speed range.",
  },
  {
    icon: Zap,
    title: "Power conversion",
    desc: "Efficient generators and converters that deliver grid-compatible electricity.",
  },
  {
    icon: Settings2,
    title: "Digital operations",
    desc: "Condition monitoring and remote SCADA keep turbines productive and maintainable.",
  },
];

const PROCESS_STEPS = [
  "Site assessment maps wind resource, terrain, and interconnection options.",
  "Turbine class and hub height are selected to match the local wind regime.",
  "Foundations, towers, and nacelles are installed to certified engineering standards.",
  "Blades are mounted and control systems are commissioned for safe startup.",
  "Each unit is tested under load and connected through the farm collection grid.",
  "Ongoing monitoring optimizes output and schedules predictive maintenance.",
];

const STATS = [
  { value: 3, suffix: "", label: "Core wind technology focus areas" },
  { value: 24, suffix: "/7", label: "Remote monitoring & control" },
  { value: 100, suffix: "%", label: "Renewable generation at the turbine" },
];

function AnimatedStat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
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
    <div ref={ref} className="flex flex-col gap-2 sm:gap-3 min-w-0">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(63,169,200,0.18)" }}
      >
        <Cog className="w-5 h-5" style={{ color: ACCENT }} />
      </div>
      <p
        className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tabular-nums leading-none text-white"
        style={{ fontFamily: FONT_HEADING }}
      >
        {text}
      </p>
      <p className="text-sm sm:text-[15px] text-white/70 leading-snug max-w-[200px]">
        {label}
      </p>
    </div>
  );
}

export default function TurbinesPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <section className="relative w-full min-h-[100svh] min-h-[100dvh] flex flex-col justify-end overflow-hidden pt-24 sm:pt-28 lg:pt-[126px]">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        >
          <Image
            src="/images/cta-turbines.png"
            alt="Big Bull Energies wind turbine systems"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
          />
        </motion.div>
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,24,40,0.8) 0%, rgba(8,24,40,0.48) 45%, rgba(8,24,40,0.15) 72%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(8,24,40,0.9) 0%, rgba(8,24,40,0.32) 40%, transparent 65%)",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center pb-6 sm:pb-8">
          <div className="max-w-[1220px] mx-auto w-full">
            <motion.div
              className="max-w-xl lg:max-w-[560px]"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.p
                variants={fadeUp}
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-5"
                style={{ color: "#7DD3E8" }}
              >
                Big Bull Energies · Turbine Systems
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="text-[2.15rem] sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem] font-bold leading-[1.08] mb-4 sm:mb-5 text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Turbines engineered for{" "}
                <span className="italic font-semibold" style={{ color: ACCENT }}>
                  clean output.
                </span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-md mb-7 sm:mb-8"
              >
                From blade design to nacelle controls, Big Bull Energies focuses
                on wind turbine systems that maximize capture, reliability, and
                lifetime performance.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link
                  href="#solutions"
                  className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg"
                  style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
                >
                  Explore Turbine Tech
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
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
        className="relative w-full bg-white py-14 sm:py-16 md:py-20 lg:py-24"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
            >
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-2 flex-wrap text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] mb-5"
                style={{ color: MUTED }}
              >
                <span>Energy Technologies</span>
                <span className="opacity-40">/</span>
                <span style={{ color: PRIMARY }}>Turbine Systems</span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-[1.85rem] sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.15] mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                The hardware behind{" "}
                <span style={{ color: PRIMARY }}>every megawatt</span>.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-sm sm:text-[15px] leading-[1.75] mb-8 max-w-lg"
                style={{ color: MUTED }}
              >
                Big Bull Energies selects and deploys turbine platforms suited to
                each site — balancing hub height, rotor diameter, and control
                software for durable wind performance.
              </motion.p>
              <div className="space-y-5">
                {PILLARS.map(({ icon: Icon, title, desc }) => (
                  <motion.div
                    key={title}
                    variants={fadeUp}
                    className="flex items-start gap-3.5"
                  >
                    <span
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
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
                      <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative w-full aspect-[4/5]"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{
                borderRadius: "1.25rem 2.5rem 1.25rem 2.5rem",
                overflow: "hidden",
                boxShadow: "0 28px 64px rgba(5,98,124,0.14)",
              }}
            >
              <Image
                src="/wind-hero.png"
                alt="Close view of wind turbine technology"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative w-full overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,20,32,0.95) 0%, rgba(8,20,32,0.75) 45%, rgba(8,20,32,0.35) 100%)",
            }}
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
            {STATS.map((stat) => (
              <AnimatedStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative w-full bg-white py-14 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-12"
              style={{ fontFamily: FONT_HEADING, color: DARK }}
            >
              From site to spinning rotor
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <ol className="flex flex-col gap-4">
                {PROCESS_STEPS.map((text, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {i + 1}
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
              <div className="relative w-full aspect-square">
                <Image
                  src="/wind1.svg"
                  alt="Wind turbine system diagram"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-[#F7F9FA] py-14 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto max-w-3xl">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8"
              style={{ fontFamily: FONT_HEADING, color: DARK }}
            >
              Why our <span style={{ color: PRIMARY }}>turbine approach</span>{" "}
              matters
            </h2>
            <div className="space-y-5">
              {[
                "Right-sized machines for each wind class improve energy yield and reduce unnecessary wear.",
                "Modern control systems protect assets in extreme weather while capturing more low-wind hours.",
                "Predictive maintenance keeps availability high — protecting both generation and investor returns.",
              ].map((text) => (
                <div key={text} className="flex items-start gap-3.5">
                  <CheckCircle2
                    className="w-6 h-6 shrink-0 mt-0.5"
                    style={{ color: PRIMARY }}
                  />
                  <p
                    className="text-sm sm:text-[15px] leading-[1.75]"
                    style={{ color: MUTED }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-white py-10 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="max-w-[1220px] mx-auto rounded-2xl sm:rounded-3xl px-6 sm:px-8 lg:px-10 py-7 sm:py-8 flex flex-col sm:flex-row items-center gap-5"
            style={{
              background:
                "linear-gradient(135deg, #05627C 0%, #0A4A5C 55%, #083D4A 100%)",
              boxShadow: "0 20px 50px rgba(5,98,124,0.28)",
            }}
          >
            <div
              className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Cog className="w-7 h-7" style={{ color: GOLD }} />
            </div>
            <h2
              className="flex-1 text-center sm:text-left text-xl sm:text-2xl font-bold text-white"
              style={{ fontFamily: FONT_HEADING }}
            >
              Talk to us about Big Bull turbine systems
            </h2>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg shrink-0"
              style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
            >
              Get In Touch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
