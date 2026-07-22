"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Gauge,
  Leaf,
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
    icon: Zap,
    title: "Reliable Energy",
    desc: "24/7 power you can trust.",
  },
  {
    icon: Leaf,
    title: "Lower Emissions",
    desc: "Cleanest fossil fuel option.",
  },
  {
    icon: Gauge,
    title: "High Efficiency",
    desc: "Advanced, efficient technology.",
  },
  {
    icon: Flame,
    title: "Sustainable Future",
    desc: "Supporting a cleaner tomorrow.",
  },
];

const INTRO_PILLARS = [
  {
    icon: Zap,
    title: "Reliable",
    desc: "Dispatchable power when the grid needs it most.",
  },
  {
    icon: Gauge,
    title: "Efficient",
    desc: "High-efficiency plants that maximize every fuel unit.",
  },
  {
    icon: Flame,
    title: "Versatile",
    desc: "Flexible generation that complements renewables.",
  },
];

const PROCESS_STEPS = [
  "Ambient air is filtered to remove dust and contaminants.",
  "Air is compressed to high pressure by a compressor.",
  "Fuel is injected into the compressed air and combusted to heat the air.",
  "The hot compressed air is expanded through a turbine to turn a generator and produce electrical power.",
  "The electric output of the generator is transformed to a high voltage.",
  "The electrical power is transmitted via transmission lines.",
];

const STATS = [
  { value: 13, suffix: "", label: "Operational natural gas facilities" },
  { value: 9500, suffix: "+", label: "Gigawatts of power" },
  { value: 23, suffix: "K", label: "Gigawatt hours produced in 2024" },
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
        <Flame className="w-5 h-5" style={{ color: "#3FA9C8" }} />
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

export default function NaturalGasPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* ── Hero ── */}
      <section className="relative w-full min-h-[100svh] min-h-[100dvh] flex flex-col justify-end overflow-hidden pt-24 sm:pt-28 lg:pt-[126px]">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        >
          <Image
            src="/images/natural-gas-hero.png"
            alt="Natural gas facility at sunset"
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
              "linear-gradient(90deg, rgba(8,24,40,0.78) 0%, rgba(8,24,40,0.45) 42%, rgba(8,24,40,0.15) 70%, transparent 100%)",
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
                Cleaner Energy. Stronger Tomorrow.
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="text-[2.15rem] sm:text-5xl md:text-[3.25rem] lg:text-[3.6rem] font-bold leading-[1.08] mb-4 sm:mb-5 text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Powering progress.{" "}
                <span
                  className="italic font-semibold"
                  style={{ color: "#3FA9C8" }}
                >
                  Naturally.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-md mb-7 sm:mb-8"
              >
                Innovative natural gas solutions that deliver reliable,
                dispatchable power — supporting grids and communities as we
                transition to a cleaner energy future.
              </motion.p>

              <motion.div variants={fadeUp}>
                <Link
                  href="#solutions"
                  className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300"
                  style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
                >
                  Explore Our Solutions
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Hero feature strip */}
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

      {/* ── Intro ── */}
      <section id="solutions" className="relative w-full bg-white py-14 sm:py-16 md:py-20 lg:py-24">
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
                <span style={{ color: PRIMARY }}>Natural Gas</span>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="text-[1.85rem] sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.15] mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                A core component of{" "}
                <span style={{ color: PRIMARY }}>Big Bull Energies&apos;</span>{" "}
                energy mix.
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-sm sm:text-[15px] leading-[1.75] mb-8 sm:mb-10 max-w-lg"
                style={{ color: MUTED }}
              >
                Natural gas is a useful asset in the multi-technology generation
                mix, providing additional, dispatchable energy to meet the
                electricity needs of consumers — bridging renewables with
                reliable baseload and peaking capacity.
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
                      <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
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
                className="relative w-full overflow-hidden bg-[#EEF3F5]"
                style={{
                  borderRadius: "1.25rem 2.5rem 1.25rem 2.5rem",
                  boxShadow: "0 28px 64px rgba(5,98,124,0.14)",
                }}
              >
                <Image
                  src="/img1.png"
                  alt="Natural gas industrial facility"
                  width={900}
                  height={1100}
                  className="w-full h-auto object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats — full-bleed bg image, no outer box ── */}
      <section className="relative w-full overflow-hidden min-h-[420px] sm:min-h-[460px] lg:min-h-[480px]">
        {/* Full-bleed background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/natural-gas-hero.png"
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
                Our proven track record in{" "}
                <span style={{ color: "#3FA9C8" }}>natural gas</span>
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

      {/* ── How it works ── */}
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
              How natural gas works
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
                      transition={{ type: "spring", stiffness: 320, damping: 18 }}
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
                  src="/gas2.webp"
                  alt="How natural gas works diagram"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why natural gas ── */}
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
                Why <span style={{ color: PRIMARY }}>natural gas</span>
              </motion.h2>

              <div className="space-y-6 sm:space-y-7">
                <motion.div variants={fadeUp} className="flex items-start gap-3.5">
                  <CheckCircle2
                    className="w-6 h-6 shrink-0 mt-0.5"
                    style={{ color: PRIMARY }}
                  />
                  <p
                    className="text-sm sm:text-[15px] md:text-base leading-[1.75]"
                    style={{ color: MUTED }}
                  >
                    Fast-start peaking plants provide essential, dispatchable
                    energy that can respond quickly to demand fluctuations.
                    These facilities ramp up or down quickly, making this
                    technology a reliability backstop for modern grids.
                  </p>
                </motion.div>
                <motion.div variants={fadeUp} className="flex items-start gap-3.5">
                  <CheckCircle2
                    className="w-6 h-6 shrink-0 mt-0.5"
                    style={{ color: PRIMARY }}
                  />
                  <p
                    className="text-sm sm:text-[15px] md:text-base leading-[1.75]"
                    style={{ color: MUTED }}
                  >
                    Combined-cycle plants offer a stable and highly efficient
                    generation solution for baseload power, helping diversify
                    the energy mix — including facilities that use liquefied
                    natural gas as their primary source.
                  </p>
                </motion.div>
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
                src="/gas3.svg"
                alt="Community powered by natural gas"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
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
              <Flame className="w-7 h-7" style={{ color: GOLD }} />
            </div>

            <h2
              className="flex-1 text-center sm:text-left text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white leading-snug"
              style={{ fontFamily: FONT_HEADING }}
            >
              Ready to explore natural gas solutions?
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
