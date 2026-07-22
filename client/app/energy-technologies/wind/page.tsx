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
    icon: Leaf,
    title: "Clean & Renewable",
    desc: "Zero emissions power.",
  },
  {
    icon: Zap,
    title: "Cost Effective",
    desc: "Lower operating costs.",
  },
  {
    icon: Wind,
    title: "Reliable Performance",
    desc: "Built for the long run.",
  },
  {
    icon: ShieldCheck,
    title: "Sustainable Impact",
    desc: "Powering a better future.",
  },
];

const INTRO_PILLARS = [
  {
    icon: Wind,
    title: "Renewable",
    desc: "Naturally replenished resource with no fuel cost.",
  },
  {
    icon: Zap,
    title: "Efficient",
    desc: "Modern turbines that maximize every gust of wind.",
  },
  {
    icon: ShieldCheck,
    title: "Sustainable",
    desc: "Clean generation that strengthens energy security.",
  },
];

const PROCESS_STEPS = [
  "Wind flows over the turbine blades, creating lift and causing them to rotate.",
  "The rotating blades spin a shaft connected to a gearbox that increases rotational speed.",
  "The gearbox drives a generator that converts mechanical energy into electrical energy.",
  "The electrical output is transformed to high voltage through a transformer.",
  "Electricity is transmitted via transmission lines to the power grid.",
  "Wind farms are connected to the grid to provide clean energy to consumers.",
];

const WHY_POINTS = [
  "Abundant and naturally replenished",
  "Strengthens energy independence",
  "Clean, reliable and sustainable power",
];

const STATS = [
  {
    value: 121,
    suffix: "",
    label: "Wind turbines installed",
    icon: Wind,
  },
  {
    value: 20,
    suffix: "",
    label: "Operational wind projects",
    icon: Target,
  },
  {
    value: 6,
    suffix: "M",
    label: "Megawatts of capacity under management",
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
  icon: typeof Wind;
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
    <div ref={ref} className="flex items-start gap-4 sm:gap-5 py-5 border-b border-[#d8e2e6] last:border-b-0">
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

export default function WindPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* Hero — light entrance motion only */}
      <section className="relative w-full min-h-[100svh] min-h-[100dvh] flex flex-col justify-end overflow-hidden pt-24 sm:pt-28 lg:pt-[126px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/wind-hero.png"
            alt="Wind farm at sunrise"
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
              className="max-w-xl lg:max-w-[560px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-5"
                style={{ color: "#7DD3E8" }}
              >
                Clean Energy. Limitless Future.
              </p>

              <h1
                className="text-[2.1rem] sm:text-5xl md:text-[3.15rem] lg:text-[3.4rem] font-bold leading-[1.1] mb-4 sm:mb-5 text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Affordable,{" "}
                <span style={{ color: ACCENT }}>clean energy</span> powered by
                nature.
              </h1>

              <p className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-md mb-7 sm:mb-8">
                Smart wind energy solutions that deliver reliable clean power,
                competitive returns, and lasting impact for communities and the
                grid.
              </p>

              <Link
                href="#solutions"
                className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300"
                style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
              >
                Explore Wind Solutions
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

      {/* Investment / intro — no motion */}
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
                <span className="opacity-40">|</span>
                <span>Wind Energy</span>
              </div>

              <h2
                className="text-[1.85rem] sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.15] mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                A core component of Big Bull Energies&apos; investment
                portfolio.
              </h2>

              <p
                className="text-sm sm:text-[15px] leading-[1.75] mb-4 max-w-lg"
                style={{ color: MUTED }}
              >
                Land-based wind energy is a carbon-free, cost-competitive
                resource that creates jobs and strengthens energy security.
                Backed by growing customer demand, it&apos;s part of the energy
                mix we need to power economies.
              </p>

              <p
                className="text-sm sm:text-[15px] leading-[1.75] mb-8 sm:mb-10 max-w-lg"
                style={{ color: MUTED }}
              >
                From utility-scale farms to contracted projects, our wind
                investments deliver clean megawatts with long-term value for
                investors and communities.
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

            <div className="relative w-full max-w-[420px] sm:max-w-[460px] mx-auto lg:max-w-none lg:justify-self-end">
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 rounded-full overflow-hidden shadow-[0_28px_64px_rgba(5,98,124,0.18)]">
                  <Image
                    src="/wind-rounded-image1.webp"
                    alt="Wind turbines and clean energy landscape"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 460px"
                  />
                </div>

                <div
                  className="absolute bottom-3 right-0 sm:bottom-6 sm:right-2 z-10 w-[44%] max-w-[190px] rounded-2xl px-4 py-4 text-center"
                  style={{
                    background:
                      "linear-gradient(145deg, #05627C 0%, #0A4A5C 100%)",
                    boxShadow: "0 16px 40px rgba(5,98,124,0.35)",
                  }}
                >
                  <Wind className="w-6 h-6 mx-auto mb-2" style={{ color: GOLD }} />
                  <p className="text-[10px] sm:text-[11px] leading-snug text-white/95 font-medium">
                    Building a cleaner future, together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track record — count-up motion only */}
      <section className="relative w-full bg-[#F4F6F7] py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold max-w-md"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Our proven track record in wind energy
              </h2>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] hover:opacity-80 transition"
                style={{ color: PRIMARY }}
              >
                View All Wind Projects
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
                  src="/wind1.svg"
                  alt="Wind energy infrastructure illustration"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How wind works — static */}
      <section className="relative w-full bg-white py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-center mb-10 sm:mb-12 lg:mb-14"
              style={{ fontFamily: FONT_HEADING, color: DARK }}
            >
              How wind energy works
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
              <ol className="flex flex-col gap-3.5 sm:gap-4 order-2 lg:order-1">
                {PROCESS_STEPS.map((text, i) => (
                  <li key={i} className="flex items-start gap-3.5 sm:gap-4">
                    <span
                      className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {i + 1}
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

              <div className="relative w-full aspect-square sm:aspect-[5/4] lg:aspect-square order-1 lg:order-2">
                <Image
                  src="/img5.webp"
                  alt="How wind energy works diagram"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why wind — static */}
      <section className="relative w-full bg-[#F7F9FA] py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
            <div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold mb-4 sm:mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Why <span style={{ color: PRIMARY }}>wind energy</span>
              </h2>

              <p
                className="text-sm sm:text-[15px] leading-[1.75] mb-6 sm:mb-7 max-w-lg"
                style={{ color: MUTED }}
              >
                Wind energy is one of the most cost-effective renewable sources
                available today. Key benefits include:
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
                src="/wind1.svg"
                alt="Wind energy benefits illustration"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA — subtle fade-in once */}
      <section className="relative w-full bg-white py-10 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-[1220px] mx-auto rounded-2xl sm:rounded-3xl px-6 sm:px-8 lg:px-10 py-7 sm:py-8 lg:py-9 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 lg:gap-8"
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
              className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Leaf className="w-7 h-7" style={{ color: GOLD }} />
            </div>

            <h2
              className="flex-1 text-center sm:text-left text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white leading-snug"
              style={{ fontFamily: FONT_HEADING }}
            >
              Ready to explore wind energy solutions?
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
