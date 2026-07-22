"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Battery,
  Flame,
  Globe2,
  Mountain,
  Network,
  Sun,
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

const PROJECT_TYPES = [
  {
    icon: Sun,
    title: "Solar",
    description:
      "Utility-scale solar farms delivering clean electricity to communities and businesses.",
    count: "150+",
    href: "/energy-technologies/solar",
    image: "/hero-solar.webp",
  },
  {
    icon: Wind,
    title: "Wind",
    description:
      "Land-based wind projects harnessing reliable, renewable generation.",
    count: "80+",
    href: "/energy-technologies/wind",
    image: "/wind-hero.png",
  },
  {
    icon: Battery,
    title: "Storage",
    description:
      "Battery systems that balance the grid and unlock more renewables.",
    count: "45+",
    href: "/energy-technologies/storage",
    image: "/storage-hero.png",
  },
  {
    icon: Flame,
    title: "Natural Gas",
    description:
      "Efficient natural gas facilities supporting a flexible energy mix.",
    count: "30+",
    href: "/energy-technologies/natural-gas",
    image: "/hero-gas.webp",
  },
  {
    icon: Network,
    title: "Transmission",
    description:
      "Infrastructure connecting generation assets to the power grid.",
    count: "25+",
    href: "/energy-technologies/transmission",
    image: "/Transmission-hero.webp",
  },
  {
    icon: Mountain,
    title: "Geothermal",
    description:
      "Baseload geothermal projects powered by the Earth's natural heat.",
    count: "5+",
    href: "/energy-technologies/geothermal",
    image: "/Geothermal-hero.webp",
  },
];

const FEATURED = [
  {
    name: "Solar Farm Initiative",
    location: "Multiple Locations",
    capacity: "500 MW",
    type: "Solar",
    status: "Operating" as const,
    href: "/energy-technologies/solar",
  },
  {
    name: "Wind Energy Complex",
    location: "Coastal Regions",
    capacity: "300 MW",
    type: "Wind",
    status: "In Development" as const,
    href: "/energy-technologies/wind",
  },
  {
    name: "Energy Storage Network",
    location: "Strategic Locations",
    capacity: "200 MWh",
    type: "Storage",
    status: "Operating" as const,
    href: "/energy-technologies/storage",
  },
];

const STATS = [
  { value: 50, suffix: "+", label: "Projects worldwide", icon: Zap },
  { value: 3, suffix: "", label: "Continents served", icon: Globe2 },
  { value: 500, suffix: "+", label: "MW of capacity", icon: Sun },
  { value: 5, suffix: "+", label: "Years of experience", icon: Wind },
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
    <div ref={ref} className="flex flex-col items-start gap-3">
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
      </p>
      <p className="text-sm leading-snug" style={{ color: MUTED }}>
        {label}
      </p>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* Hero */}
      <section className="relative w-full min-h-[100svh] min-h-[100dvh] flex flex-col justify-end overflow-hidden pt-24 sm:pt-28 lg:pt-[126px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-solar.webp"
            alt="Big Bull Energies renewable energy projects"
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
              "linear-gradient(90deg, rgba(8,24,40,0.84) 0%, rgba(8,24,40,0.55) 40%, rgba(8,24,40,0.18) 68%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(8,24,40,0.88) 0%, rgba(8,24,40,0.25) 45%, transparent 70%)",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center pb-14 sm:pb-16 lg:pb-20">
          <div className="max-w-[1220px] mx-auto w-full">
            <motion.div
              className="max-w-xl lg:max-w-[600px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-5"
                style={{ color: "#7DD3E8" }}
              >
                Our Projects
              </p>

              <h1
                className="text-[2.15rem] sm:text-5xl md:text-[3.15rem] lg:text-[3.4rem] font-bold leading-[1.1] mb-4 sm:mb-5 text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Powering the future through{" "}
                <span style={{ color: ACCENT }}>innovative</span> energy
                projects.
              </h1>

              <p className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-md mb-7 sm:mb-8">
                Big Bull Energies develops, owns, and operates renewable energy
                projects across multiple continents — delivering clean power to
                communities worldwide.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="#portfolio"
                  className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300"
                  style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
                >
                  Explore Portfolio
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg border border-white/35 text-white hover:bg-white/10 transition"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio grid */}
      <section
        id="portfolio"
        className="relative w-full bg-white py-14 sm:py-16 md:py-20 lg:py-24"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <div className="max-w-2xl mb-10 sm:mb-12">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Our project portfolio
              </h2>
              <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: MUTED }}>
                Explore renewable energy projects spanning solar, wind, storage,
                transmission, and more.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {PROJECT_TYPES.map(
                ({ icon: Icon, title, description, count, href, image }) => (
                  <Link
                    key={title}
                    href={href}
                    className="group relative overflow-hidden rounded-2xl min-h-[280px] sm:min-h-[300px] flex flex-col justify-end"
                  >
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(8,24,40,0.92) 0%, rgba(8,24,40,0.45) 48%, rgba(8,24,40,0.15) 100%)",
                      }}
                    />

                    <div className="relative z-10 p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center border border-white/25"
                          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                        >
                          <Icon
                            className="w-[18px] h-[18px] text-white"
                            strokeWidth={1.75}
                          />
                        </span>
                        <span className="text-2xl font-bold text-white tabular-nums">
                          {count}
                        </span>
                      </div>
                      <h3
                        className="text-xl font-bold text-white mb-1.5"
                        style={{ fontFamily: FONT_HEADING }}
                      >
                        {title}
                      </h3>
                      <p className="text-sm text-white/75 leading-relaxed mb-3">
                        {description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white/90">
                        Learn more
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="relative w-full bg-[#F4F6F7] py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
                  style={{ fontFamily: FONT_HEADING, color: DARK }}
                >
                  Featured projects
                </h2>
                <p className="text-sm sm:text-[15px]" style={{ color: MUTED }}>
                  Highlighting significant renewable energy initiatives.
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {FEATURED.map((project) => (
                <Link
                  key={project.name}
                  href={project.href}
                  className="group flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6 bg-white rounded-2xl px-5 sm:px-6 lg:px-7 py-5 sm:py-6 border transition-colors hover:border-[rgba(5,98,124,0.28)]"
                  style={{ borderColor: "rgba(5,98,124,0.1)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <h3
                        className="text-lg sm:text-xl font-bold"
                        style={{ fontFamily: FONT_HEADING, color: DARK }}
                      >
                        {project.name}
                      </h3>
                      <span
                        className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide rounded-md"
                        style={{
                          backgroundColor:
                            project.status === "Operating"
                              ? "rgba(5,98,124,0.1)"
                              : "rgba(245,207,11,0.2)",
                          color:
                            project.status === "Operating" ? PRIMARY : "#8A7400",
                        }}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div
                      className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm"
                      style={{ color: MUTED }}
                    >
                      <span>
                        <span className="font-semibold" style={{ color: PRIMARY }}>
                          Location:
                        </span>{" "}
                        {project.location}
                      </span>
                      <span>
                        <span className="font-semibold" style={{ color: PRIMARY }}>
                          Capacity:
                        </span>{" "}
                        {project.capacity}
                      </span>
                      <span>
                        <span className="font-semibold" style={{ color: PRIMARY }}>
                          Type:
                        </span>{" "}
                        {project.type}
                      </span>
                    </div>
                  </div>

                  <span
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] shrink-0"
                    style={{ color: PRIMARY }}
                  >
                    View technology
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative w-full bg-white py-14 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {STATS.map((stat) => (
              <AnimatedStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative w-full bg-white pb-12 sm:pb-14 lg:pb-16">
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
              <Zap className="w-7 h-7" style={{ color: GOLD }} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2
                className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white leading-snug mb-1"
                style={{ fontFamily: FONT_HEADING }}
              >
                Interested in our projects?
              </h2>
              <p className="text-sm text-white/75">
                Explore investment opportunities or talk with our team.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/our-plan"
                className="inline-flex items-center gap-2 font-bold px-5 py-3 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg border border-white/30 text-white hover:bg-white/10 transition"
              >
                View Plans
              </Link>
              <Link
                href="/contact"
                className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300"
                style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
              >
                Get In Touch
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
