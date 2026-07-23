"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  Target,
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
    icon: Leaf,
    title: "Zero-Fuel Power",
    desc: "Clean electricity from the wind.",
  },
  {
    icon: Zap,
    title: "Grid-Ready Output",
    desc: "Reliable renewable generation.",
  },
  {
    icon: Wind,
    title: "Modern Turbines",
    desc: "High-efficiency wind systems.",
  },
  {
    icon: ShieldCheck,
    title: "Long-Term Value",
    desc: "Built for lasting impact.",
  },
];

const INTRO_PILLARS = [
  {
    icon: Wind,
    title: "Wind-first strategy",
    desc: "Utility-scale wind sits at the centre of Big Bull Energies’ renewable portfolio.",
  },
  {
    icon: Zap,
    title: "Investor-aligned growth",
    desc: "Clean generation that underpins structured participation programs on our platform.",
  },
  {
    icon: ShieldCheck,
    title: "Global standards",
    desc: "Operated under registered entities in the United Kingdom and New Zealand.",
  },
];

const PROCESS_STEPS = [
  "Steady wind flows across aerodynamically designed blades, creating lift that turns the rotor.",
  "The rotor drives a shaft and gearbox (or a direct-drive system) to reach generator speed.",
  "The generator converts mechanical motion into electricity inside the nacelle.",
  "On-site transformers step voltage up for efficient transfer across the wind farm network.",
  "A collection system moves power to the substation for grid-quality conditioning.",
  "Electricity is delivered to the transmission network, supplying homes, businesses, and markets.",
];

const WHY_POINTS = [
  {
    title: "Abundant & renewable",
    desc: "Wind is a naturally replenished resource with no fuel cost and no combustion emissions at the point of generation.",
  },
  {
    title: "Scalable clean capacity",
    desc: "Land-based wind farms can be expanded in phases as demand grows, pairing well with storage and hybrid solar assets.",
  },
  {
    title: "Community & climate impact",
    desc: "Projects support local energy security while advancing Big Bull Energies’ mission for a cleaner global energy mix.",
  },
];

const STATS = [
  { value: 2, suffix: "", label: "Core renewable generation hubs in operation" },
  { value: 125, suffix: "", label: "Average MWh of clean electricity per day" },
  { value: 7000, suffix: "+", label: "Households & businesses powered daily" },
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
  const display = useTransform(spring, (v) =>
    value >= 1000
      ? `${Math.round(v).toLocaleString()}${suffix}`
      : `${Math.round(v)}${suffix}`,
  );
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
        <Wind className="w-5 h-5" style={{ color: "#3FA9C8" }} />
      </div>
      <p
        className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tabular-nums leading-none text-white"
        style={{ fontFamily: FONT_HEADING }}
      >
        {text}
      </p>
      <p className="text-sm sm:text-[15px] text-white/70 leading-snug max-w-[220px]">
        {label}
      </p>
    </div>
  );
}

export default function WindPage() {
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
            src="/wind-hero.png"
            alt="Big Bull Energies wind turbines at sunrise"
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
              "linear-gradient(90deg, rgba(8,24,40,0.82) 0%, rgba(8,24,40,0.5) 42%, rgba(8,24,40,0.18) 70%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(8,24,40,0.92) 0%, rgba(8,24,40,0.35) 38%, transparent 62%)",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center pb-6 sm:pb-8">
          <div className="max-w-[1220px] mx-auto w-full">
            <motion.div
              className="max-w-xl lg:max-w-[580px]"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.p
                variants={fadeUp}
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-5"
                style={{ color: "#7DD3E8" }}
              >
                Big Bull Energies · Wind Power
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="text-[2.15rem] sm:text-5xl md:text-[3.25rem] lg:text-[3.6rem] font-bold leading-[1.08] mb-4 sm:mb-5 text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Powering progress.{" "}
                <span
                  className="italic font-semibold"
                  style={{ color: ACCENT }}
                >
                  By wind.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-md mb-7 sm:mb-8"
              >
                Big Bull Energies develops and operates wind energy solutions —
                from modern turbine systems to grid-connected farms — delivering
                clean power and long-term renewable value.
              </motion.p>

              <motion.div variants={fadeUp}>
                <Link
                  href="#solutions"
                  className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300"
                  style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
                >
                  Explore Wind Solutions
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="relative z-10 border-t border-white/10"
          style={{
            background: "rgba(8,24,40,0.55)",
            backdropFilter: "blur(14px)",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
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
        </motion.div>
      </section>

      <section
        id="solutions"
        className="relative w-full bg-white py-14 sm:py-16 md:py-20 lg:py-24"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
            >
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-2 flex-wrap text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] mb-5 sm:mb-6"
                style={{ color: MUTED }}
              >
                <span>Energy Technologies</span>
                <span className="opacity-40">/</span>
                <span style={{ color: PRIMARY }}>Wind Energy</span>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="text-[1.85rem] sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.15] mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Wind is the core of{" "}
                <span style={{ color: PRIMARY }}>Big Bull Energies</span>.
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-sm sm:text-[15px] leading-[1.75] mb-8 sm:mb-10 max-w-lg"
                style={{ color: MUTED }}
              >
                We specialize in wind power technologies — planning, developing,
                and operating land-based wind assets that convert natural airflow
                into dependable clean electricity for grids and communities.
              </motion.p>

              <div className="space-y-5 sm:space-y-6">
                {INTRO_PILLARS.map(({ icon: Icon, title, desc }) => (
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
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: MUTED }}
                      >
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative w-full"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="relative w-full overflow-hidden aspect-[4/5] sm:aspect-[5/6]"
                style={{
                  borderRadius: "1.25rem 2.5rem 1.25rem 2.5rem",
                  boxShadow: "0 28px 64px rgba(5,98,124,0.14)",
                }}
              >
                <Image
                  src="/wind-rounded-image1.webp"
                  alt="Big Bull Energies wind turbines across open landscape"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative w-full overflow-hidden min-h-[420px] sm:min-h-[460px] lg:min-h-[480px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cta-turbines.png"
            alt=""
            fill
            className="object-cover object-[72%_center] sm:object-[68%_center] lg:object-right"
            sizes="100vw"
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,20,32,0.97) 0%, rgba(8,20,32,0.92) 28%, rgba(8,20,32,0.72) 48%, rgba(8,20,32,0.35) 68%, rgba(8,20,32,0.15) 85%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0 sm:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,20,32,0.88) 0%, rgba(8,20,32,0.75) 55%, rgba(8,20,32,0.55) 100%)",
            }}
          />
        </div>

        <motion.div
          className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-[1220px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-9 sm:mb-11 max-w-3xl lg:max-w-4xl">
              <h2
                className="text-2xl sm:text-3xl lg:text-[2rem] font-bold leading-snug text-white max-w-md"
                style={{ fontFamily: FONT_HEADING }}
              >
                Clean capacity that{" "}
                <span style={{ color: ACCENT }}>powers real demand</span>
              </h2>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] shrink-0 hover:opacity-80 transition"
                style={{ color: "#7DD3E8" }}
              >
                View Our Projects
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-10 max-w-3xl lg:max-w-4xl">
              {STATS.map((stat) => (
                <AnimatedStat key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative w-full bg-white py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-center mb-10 sm:mb-12 lg:mb-14"
              style={{ fontFamily: FONT_HEADING, color: DARK }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              How Big Bull wind energy works
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
              <motion.ol
                className="flex flex-col gap-4 sm:gap-5 order-2 lg:order-1"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                {PROCESS_STEPS.map((text, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    className="flex items-start gap-3.5 sm:gap-4"
                  >
                    <motion.span
                      className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm sm:text-base font-bold text-white"
                      style={{ backgroundColor: PRIMARY }}
                      whileHover={{ scale: 1.08 }}
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 18,
                      }}
                    >
                      {i + 1}
                    </motion.span>
                    <p
                      className="text-sm sm:text-[15px] md:text-base leading-relaxed pt-2"
                      style={{ color: MUTED }}
                    >
                      {text}
                    </p>
                  </motion.li>
                ))}
              </motion.ol>

              <motion.div
                className="relative w-full aspect-square sm:aspect-[5/4] lg:aspect-square order-1 lg:order-2"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.75 }}
              >
                <Image
                  src="/img5.webp"
                  alt="How wind turbines generate electricity"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-[#F7F9FA] py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
            >
              <motion.h2
                variants={fadeUp}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold mb-7 sm:mb-8"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Why <span style={{ color: PRIMARY }}>wind energy</span>
              </motion.h2>

              <div className="space-y-6 sm:space-y-7">
                {WHY_POINTS.map(({ title, desc }) => (
                  <motion.div
                    key={title}
                    variants={fadeUp}
                    className="flex items-start gap-3.5"
                  >
                    <CheckCircle2
                      className="w-6 h-6 shrink-0 mt-0.5"
                      style={{ color: PRIMARY }}
                    />
                    <div>
                      <p
                        className="text-sm font-bold mb-1"
                        style={{ color: DARK }}
                      >
                        {title}
                      </p>
                      <p
                        className="text-sm sm:text-[15px] md:text-base leading-[1.75]"
                        style={{ color: MUTED }}
                      >
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative w-full aspect-[5/4] sm:aspect-[4/3] lg:aspect-[5/4]"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <Image
                src="/wind1.svg"
                alt="Wind energy benefits for communities and the grid"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-white py-10 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-[1220px] mx-auto rounded-2xl sm:rounded-3xl px-6 sm:px-8 lg:px-10 py-7 sm:py-8 lg:py-9 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 lg:gap-8"
            style={{
              background:
                "linear-gradient(135deg, #05627C 0%, #0A4A5C 55%, #083D4A 100%)",
              boxShadow: "0 20px 50px rgba(5,98,124,0.28)",
            }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <div
              className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Target className="w-7 h-7" style={{ color: GOLD }} />
            </div>

            <h2
              className="flex-1 text-center sm:text-left text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white leading-snug"
              style={{ fontFamily: FONT_HEADING }}
            >
              Ready to explore Big Bull wind solutions?
            </h2>

            <Link
              href="/contact"
              className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300 shrink-0"
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
