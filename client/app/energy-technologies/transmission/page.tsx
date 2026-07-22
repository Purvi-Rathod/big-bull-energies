"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Network,
  ShieldCheck,
  TowerControl,
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
    icon: ShieldCheck,
    title: "Reliable Delivery",
    desc: "Power where it's needed.",
  },
  {
    icon: Zap,
    title: "Efficient Network",
    desc: "Minimizing losses.",
  },
  {
    icon: Activity,
    title: "Smart Monitoring",
    desc: "Real-time infrastructure.",
  },
  {
    icon: Leaf,
    title: "Sustainable Future",
    desc: "Building for generations.",
  },
];

const INTRO_PILLARS = [
  {
    icon: Network,
    title: "Connect",
    desc: "Link generation to the wider grid.",
  },
  {
    icon: Zap,
    title: "Deliver",
    desc: "Move power safely across every mile.",
  },
  {
    icon: ShieldCheck,
    title: "Empower",
    desc: "Strengthen communities with reliable supply.",
  },
];

const PROCESS_STEPS = [
  "Electricity is generated at power plants and stepped up to high voltage.",
  "High-voltage transmission lines carry electricity over long distances.",
  "Substations step down voltage for distribution to local areas.",
  "Distribution lines deliver electricity to homes and businesses.",
  "Smart grid technologies monitor and optimize power flow.",
  "Transmission infrastructure enables reliability and renewable integration.",
];

const WHY_POINTS = [
  "Delivers renewable energy from remote generation sites",
  "Improves grid reliability and reduces congestion",
  "Supports economic development and energy access",
  "Builds a stronger, more flexible power system",
];

const STATS = [
  {
    value: 15,
    suffix: "+",
    label: "Transmission projects developed",
    icon: TowerControl,
  },
  {
    value: 500,
    suffix: "+",
    label: "Miles of transmission lines",
    icon: Network,
  },
  {
    value: 10,
    suffix: "+",
    label: "GW of capacity in development",
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
      {/* Hero */}
      <section className="relative w-full min-h-[100svh] min-h-[100dvh] flex flex-col justify-end overflow-hidden pt-24 sm:pt-28 lg:pt-[126px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/Transmission-hero.webp"
            alt="High-voltage transmission towers at sunset"
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
                Powering Connections
              </p>

              <h1
                className="text-[2.1rem] sm:text-5xl md:text-[3.15rem] lg:text-[3.4rem] font-bold leading-[1.1] mb-4 sm:mb-5 text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Reliable transmission.{" "}
                <span style={{ color: ACCENT }}>Stronger</span> communities.
              </h1>

              <p className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-md mb-7 sm:mb-8">
                Efficient transmission infrastructure that delivers electricity
                safely, reliably and sustainably across every mile.
              </p>

              <Link
                href="#solutions"
                className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300"
                style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
              >
                Explore Transmission Solutions
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

      {/* Intro */}
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
                <span>Transmission</span>
              </div>

              <h2
                className="text-[1.85rem] sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.15] mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                A core component of Big Bull Energies&apos; energy mix.
              </h2>

              <p
                className="text-sm sm:text-[15px] leading-[1.75] mb-8 sm:mb-10 max-w-lg"
                style={{ color: MUTED }}
              >
                Transmission infrastructure connects energy generation
                facilities to the power grid, enabling reliable delivery of
                electricity to homes, businesses, and communities.
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
                  alt="Transmission lines across open landscape"
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
                  Building a stronger grid for a better tomorrow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track record */}
      <section className="relative w-full bg-[#F4F6F7] py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold max-w-md"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Our proven track record in transmission
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
                  alt="Transmission infrastructure illustration"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative w-full bg-white py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-center mb-10 sm:mb-12 lg:mb-14"
              style={{ fontFamily: FONT_HEADING, color: DARK }}
            >
              How transmission works
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
                  alt="Power lines against a sunset sky"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why transmission */}
      <section className="relative w-full bg-[#F7F9FA] py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
            <div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold mb-4 sm:mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Why <span style={{ color: PRIMARY }}>transmission</span>
              </h2>

              <p
                className="text-sm sm:text-[15px] leading-[1.75] mb-6 sm:mb-7 max-w-lg"
                style={{ color: MUTED }}
              >
                Transmission infrastructure is essential for a modern, reliable
                power grid. Key benefits include:
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
                alt="Transmission benefits illustration"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
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
              Ready to explore{" "}
              <span style={{ color: ACCENT }}>transmission</span> solutions?
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
