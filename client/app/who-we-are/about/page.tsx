"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  FileText,
  Flag,
  Globe,
  Leaf,
  Lock,
  ShieldCheck,
  TrendingUp,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import Footer from "@/components/Footer";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const PRIMARY = "#05627C";
const ACCENT = "#3FA9C8";
const GOLD = "#F5CF0B";
const MINT = "#E8F5F0";

const roadmap = [
  {
    year: "2022",
    icon: Flag,
    title: "Vision Ignited",
    desc: "Big Bull Energies conceived as a wind-led platform linking clean generation with transparent investor participation.",
  },
  {
    year: "2023",
    icon: Building2,
    title: "Foundation Set",
    desc: "Brand and digital platform established. First wind development pathways and partner network initiated.",
  },
  {
    year: "2024",
    icon: Wind,
    title: "Official Launch",
    desc: "Operations launched 22 June 2024. Registered entities in the United Kingdom and New Zealand.",
  },
  {
    year: "2025",
    icon: Zap,
    title: "Wind Portfolio Growth",
    desc: "Expanded turbine deployment focus, farm operations capability, and global investor community.",
  },
  {
    year: "2026",
    icon: Leaf,
    title: "Scale & Storage",
    desc: "Deepen wind farm capacity, integrate energy storage to firm output, and strengthen grid connections.",
  },
  {
    year: "2027",
    icon: Globe,
    title: "Smarter Wind Ops",
    desc: "Advance SCADA analytics, predictive maintenance, and multi-market wind operations excellence.",
  },
  {
    year: "2028",
    icon: ShieldCheck,
    title: "Wind Leadership",
    desc: "Establish Big Bull Energies as a recognized wind-powered investment and generation brand worldwide.",
    highlight: true,
  },
];

const missionFeatures = [
  {
    icon: Wind,
    title: "Wind-First Generation",
    desc: "Utility-scale wind is the core of how we produce clean electricity.",
  },
  {
    icon: BarChart3,
    title: "Transparent Growth",
    desc: "Structured participation programs aligned with real renewable operations.",
  },
  {
    icon: Users,
    title: "Community Impact",
    desc: "Partnering with communities where our wind assets operate and grow.",
  },
  {
    icon: Globe,
    title: "A Cleaner Grid",
    desc: "Delivering zero-fuel power that strengthens energy security worldwide.",
  },
];

const revenueCards = [
  {
    icon: Wind,
    title: "Wind Generation",
    value: "Core",
    suffix: "Asset Focus",
    desc: "Clean electricity from land-based wind farms and turbine systems",
  },
  {
    icon: Zap,
    title: "Platform Participation",
    value: "ROI",
    suffix: "Structured Programs",
    desc: "Investor packages linked to Big Bull Energies’ renewable operations",
  },
  {
    icon: TrendingUp,
    title: "Long-Term Value",
    value: "Growth",
    suffix: "Wind-Led Strategy",
    desc: "Scaling capacity, storage firming, and grid-ready delivery over time",
  },
];

function SectionWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1220px] mx-auto">{children}</div>
    </div>
  );
}

function PillBadge({
  children,
  variant = "light",
}: {
  children: React.ReactNode;
  variant?: "light" | "dark";
}) {
  return (
    <span
      className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 sm:mb-5"
      style={{
        backgroundColor:
          variant === "light" ? "#eef2f6" : "rgba(255,255,255,0.14)",
        color: variant === "light" ? PRIMARY : "rgba(255,255,255,0.9)",
      }}
    >
      {children}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="h-px w-8 sm:w-10" style={{ backgroundColor: GOLD }} />
      <span
        className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
        style={{ color: PRIMARY }}
      >
        {children}
      </span>
    </div>
  );
}

function ArrowButton({
  href,
  label,
  variant = "gold",
}: {
  href: string;
  label: string;
  variant?: "gold" | "navy";
}) {
  const isGold = variant === "gold";
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3 font-bold px-5 sm:px-6 py-3 sm:py-3.5 text-[11px] sm:text-xs uppercase tracking-wide transition hover:opacity-90 rounded-lg"
      style={{
        backgroundColor: isGold ? GOLD : PRIMARY,
        color: isGold ? "#1a1a1a" : "#fff",
      }}
    >
      {label}
      <span
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: isGold ? PRIMARY : GOLD,
          color: isGold ? "#fff" : "#1a1a1a",
        }}
      >
        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </span>
    </Link>
  );
}

export default function AboutPage() {
  const [roadmapRevealed, setRoadmapRevealed] = useState(false);
  const roadmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = roadmapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRoadmapRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]"
      style={{ fontFamily: FONT_STACK }}
    >
      {/* Hero */}
      <section className="relative w-full overflow-hidden min-h-[420px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[560px] flex items-center">
        <Image
          src="/wind-hero.png"
          alt="Big Bull Energies wind turbines across open landscape"
          fill
          priority
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,24,40,0.88) 0%, rgba(8,24,40,0.72) 55%, rgba(8,24,40,0.45) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,24,40,0.9) 0%, rgba(8,24,40,0.72) 32%, rgba(8,24,40,0.35) 55%, rgba(8,24,40,0.08) 72%, transparent 85%)",
          }}
        />
        <SectionWrap>
          <div className="relative z-10 max-w-xl py-8 sm:py-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="h-px w-8 sm:w-10" style={{ backgroundColor: GOLD }} />
              <span
                className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
                style={{ color: "#7DD3E8" }}
              >
                Who We Are
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-tight mb-3 sm:mb-4 text-white"
            >
              Building wealth through wind power and transparent participation
            </h1>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-6 text-white/80">
              Big Bull Energies is a wind-focused renewable company — developing
              turbine systems, wind farm operations, and investor programs that
              connect clean generation with long-term financial growth.
            </p>
            <ArrowButton href="#founding-vision" label="Discover Our Vision" />
          </div>
        </SectionWrap>
      </section>

      {/* Who We Are + Founding Vision + Approach */}
      <section
        id="founding-vision"
        className="relative w-full bg-white py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden"
      >
        <SectionWrap>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 lg:items-stretch">
            <div
              className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgba(5,98,124,0.08)] h-full flex flex-col justify-center"
              style={{ backgroundColor: "#fff" }}
            >
              <PillBadge>Who We Are</PillBadge>
              <h2
                className="text-2xl sm:text-3xl md:text-[2rem] font-bold leading-snug mb-4 sm:mb-5"
                style={{ color: PRIMARY }}
              >
                A wind energy company built for lasting impact
              </h2>
              <p
                className="text-sm sm:text-base leading-relaxed mb-6 sm:mb-8"
                style={{ color: "#64748b" }}
              >
                We specialize in wind power technologies — from modern turbines
                to farm operations and grid delivery — while offering structured
                participation programs that let investors share in renewable
                growth.
              </p>
              <Link
                href="/who-we-are/leadership"
                className="inline-flex items-center gap-2.5 font-bold px-6 sm:px-7 py-3 sm:py-3.5 text-xs uppercase tracking-wide rounded-full text-white transition hover:opacity-90 w-fit"
                style={{ backgroundColor: PRIMARY }}
              >
                Meet Leadership
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div
              className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(5,98,124,0.12)] flex flex-col sm:flex-row min-h-[300px] lg:min-h-[340px]"
              style={{ backgroundColor: "#083544" }}
            >
              <div className="relative w-full sm:w-[52%] min-h-[220px] sm:min-h-0 flex-shrink-0">
                <Image
                  src="/images/founding-vision.png"
                  alt="Big Bull Energies founding vision"
                  fill
                  className="object-cover object-left"
                />
              </div>
              <div className="flex flex-col justify-between p-6 sm:p-7 md:p-8 flex-1 bg-[#083544]">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 leading-snug">
                    Our Founding Vision
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Founded to accelerate clean power through wind, Big Bull
                    Energies partners with investors and communities to develop
                    turbine projects and wind farms that deliver reliable
                    renewable electricity and long-term shared value.
                  </p>
                </div>
                <Link
                  href="/energy-technologies/wind"
                  className="mt-6 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center self-end transition hover:scale-110"
                  style={{ backgroundColor: ACCENT }}
                  aria-label="Explore wind energy"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 lg:mt-10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_16px_48px_rgba(5,98,124,0.12)] border border-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div
                className="relative p-7 sm:p-9 md:p-10 lg:p-12 flex flex-col justify-center min-h-[380px] sm:min-h-[440px] lg:min-h-[480px]"
                style={{
                  background:
                    "linear-gradient(145deg, #05627C 0%, #044a5c 55%, #033d4d 100%)",
                }}
              >
                <Wind
                  className="absolute right-6 bottom-6 w-40 h-40 sm:w-48 sm:h-48 opacity-[0.06] text-white pointer-events-none"
                  strokeWidth={0.75}
                />
                <div className="relative z-10 max-w-lg">
                  <PillBadge variant="dark">Our Approach</PillBadge>
                  <h2 className="text-2xl sm:text-3xl md:text-[2rem] font-bold leading-snug mb-4 text-white">
                    Wind-led operations with security and transparency
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed mb-8 text-white/75">
                    We focus capital and expertise on wind generation, turbine
                    performance, and grid-ready delivery — minimizing distraction
                    from unrelated industries and maximizing clarity for our
                    investors.
                  </p>
                  <Link
                    href="/our-plan"
                    className="inline-flex items-center gap-3 font-bold pl-6 pr-2 py-2.5 text-xs uppercase tracking-wide rounded-full transition hover:brightness-105 w-fit"
                    style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
                  >
                    Explore Our Plan
                    <span className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md">
                      <ArrowRight
                        className="w-4 h-4"
                        style={{ color: PRIMARY }}
                      />
                    </span>
                  </Link>
                </div>
              </div>

              <div
                className="relative flex items-center justify-center min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] overflow-hidden py-8 sm:py-10"
                style={{ backgroundColor: "#f0f6f8" }}
              >
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(5,98,124,0.14) 1.5px, transparent 1.5px)",
                    backgroundSize: "18px 18px",
                  }}
                />
                <div
                  className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-40"
                  style={{ backgroundColor: ACCENT }}
                />

                <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] md:w-[400px] md:h-[400px]">
                  <div
                    className="absolute inset-0 rounded-full border border-dashed pointer-events-none opacity-30"
                    style={{ borderColor: "rgba(5,98,124,0.25)" }}
                  />

                  <div className="absolute inset-3 sm:inset-4 z-10">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-[6px] sm:border-[7px] border-white shadow-[0_20px_48px_rgba(5,98,124,0.22)]">
                      <Image
                        src="/wind-rounded-image1.webp"
                        alt="Big Bull Energies wind turbines"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 300px, 400px"
                      />
                    </div>
                  </div>

                  <div className="absolute left-0 top-[38%] z-20 -translate-x-1/4">
                    <div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(5,98,124,0.2)] border-[3px] border-white"
                      style={{ backgroundColor: "#fff" }}
                    >
                      <Lock
                        className="w-8 h-8 sm:w-9 sm:h-9"
                        style={{ color: PRIMARY }}
                      />
                    </div>
                  </div>

                  <div className="absolute right-0 top-[42%] z-20 translate-x-1/4">
                    <div
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(5,98,124,0.2)] border-[3px] border-white"
                      style={{ backgroundColor: "#fff" }}
                    >
                      <FileText
                        className="w-7 h-7 sm:w-8 sm:h-8"
                        style={{ color: PRIMARY }}
                      />
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
                        style={{ backgroundColor: ACCENT }}
                      >
                        <ShieldCheck
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionWrap>
      </section>

      {/* Mission */}
      <section className="relative w-full py-14 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        <Image
          src="/images/cta-turbines.png"
          alt="Big Bull Energies wind turbines at dusk"
          fill
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,98,124,0.94) 0%, rgba(5,98,124,0.88) 45%, rgba(5,98,124,0.55) 70%, rgba(5,98,124,0.25) 100%)",
          }}
        />
        <SectionWrap>
          <div className="relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-14 max-w-3xl mx-auto">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 border border-white/20"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <Wind className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                Our Mission is to Power Progress with Wind
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-white/75">
                We believe wind energy and transparent financial systems can work
                together — creating lasting value for investors while delivering
                clean power to grids and communities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {missionFeatures.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl p-5 sm:p-6 text-center backdrop-blur-sm border border-white/10"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                    style={{ backgroundColor: "rgba(245,207,11,0.15)" }}
                  >
                    <Icon
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: GOLD }}
                    />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-white/65">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionWrap>
      </section>

      {/* Roadmap */}
      <section className="relative w-full bg-white py-10 sm:py-12 md:py-16 lg:py-20">
        <SectionWrap>
          <div className="text-center mb-8 sm:mb-10 md:mb-14">
            <div className="flex justify-center">
              <PillBadge>Our Journey</PillBadge>
            </div>
            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold -mt-2"
              style={{ color: PRIMARY }}
            >
              Big Bull Energies Wind Roadmap (2022 – 2028)
            </h2>
          </div>

          <div ref={roadmapRef} className="relative overflow-x-auto pb-4">
            <div className="relative min-w-[900px] sm:min-w-[1000px] lg:min-w-0">
              <div
                className="absolute left-0 right-0 top-[1.65rem] sm:top-[1.85rem] h-0.5"
                style={{ backgroundColor: "rgba(5,98,124,0.2)" }}
              />
              <div className="relative grid grid-cols-7 gap-2 sm:gap-3">
                {roadmap.map((step, i) => {
                  const Icon = step.icon;
                  const isHighlight = step.highlight;
                  return (
                    <div
                      key={step.year}
                      className="flex flex-col items-center text-center transition-all duration-700 ease-out"
                      style={{
                        opacity: roadmapRevealed ? 1 : 0,
                        transform: roadmapRevealed
                          ? "translateY(0)"
                          : "translateY(16px)",
                        transitionDelay: `${i * 120}ms`,
                      }}
                    >
                      <div
                        className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 sm:mb-3 relative z-10 shadow-sm"
                        style={{
                          backgroundColor: isHighlight ? PRIMARY : "#fff",
                          border: isHighlight
                            ? "none"
                            : `2px solid ${PRIMARY}33`,
                          boxShadow: isHighlight
                            ? "0 4px 16px rgba(5,98,124,0.3)"
                            : undefined,
                        }}
                      >
                        <Icon
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          style={{ color: isHighlight ? "#fff" : PRIMARY }}
                        />
                      </div>
                      <span
                        className="text-xs sm:text-sm font-bold mb-2 sm:mb-3"
                        style={{ color: PRIMARY }}
                      >
                        {step.year}
                      </span>
                      <div
                        className="rounded-xl p-3 sm:p-4 w-full min-h-[130px] sm:min-h-[150px] flex flex-col"
                        style={{
                          backgroundColor: isHighlight ? PRIMARY : "#fff",
                          border: isHighlight
                            ? "none"
                            : "1px solid rgba(5,98,124,0.12)",
                          boxShadow: isHighlight
                            ? "0 8px 24px rgba(5,98,124,0.25)"
                            : "0 4px 16px rgba(5,98,124,0.07)",
                        }}
                      >
                        <h3
                          className="text-[11px] sm:text-xs md:text-sm font-bold mb-1.5 sm:mb-2 leading-snug"
                          style={{ color: isHighlight ? "#fff" : PRIMARY }}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="text-[10px] sm:text-[11px] leading-snug flex-1"
                          style={{
                            color: isHighlight
                              ? "rgba(255,255,255,0.8)"
                              : `${PRIMARY}AA`,
                          }}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionWrap>
      </section>

      {/* Business model */}
      <section className="relative w-full bg-white py-10 sm:py-12 md:py-16 lg:py-20">
        <SectionWrap>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 sm:mb-10 md:mb-12 text-center"
            style={{ color: PRIMARY }}
          >
            Our Wind-Led Business Model
          </h2>

          <div
            className="relative rounded-[1.75rem] p-6 sm:p-8 md:p-10 lg:p-12"
            style={{
              backgroundColor: "#fff",
              boxShadow:
                "0 24px 60px -12px rgba(5,98,124,0.12), 0 0 0 1px rgba(5,98,124,0.06)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {revenueCards.map(({ icon: Icon, title, value, suffix, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl p-5 sm:p-6 md:p-8 text-center"
                  style={{
                    backgroundColor: "#fff",
                    boxShadow: "0 8px 32px rgba(5,98,124,0.1)",
                  }}
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5"
                    style={{ backgroundColor: MINT }}
                  >
                    <Icon
                      className="w-6 h-6 sm:w-7 sm:h-7"
                      style={{ color: PRIMARY }}
                    />
                  </div>
                  <h3
                    className="text-base sm:text-lg font-bold mb-3 sm:mb-4"
                    style={{ color: PRIMARY }}
                  >
                    {title}
                  </h3>
                  <div
                    className="h-px mb-3 sm:mb-4 mx-auto w-12"
                    style={{ backgroundColor: PRIMARY, opacity: 0.2 }}
                  />
                  <div
                    className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold mb-1 leading-none"
                    style={{ color: GOLD }}
                  >
                    {value}
                  </div>
                  <p
                    className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 mt-2"
                    style={{ color: PRIMARY, opacity: 0.7 }}
                  >
                    {suffix}
                  </p>
                  <p
                    className="text-[11px] sm:text-xs leading-relaxed"
                    style={{ color: PRIMARY, opacity: 0.55 }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionWrap>
      </section>

      {/* CTA */}
      <section className="relative w-full overflow-hidden min-h-[420px] sm:min-h-[480px] lg:min-h-[560px] flex items-center">
        <Image
          src="/hero.png"
          alt="Big Bull Energies wind energy landscape"
          fill
          priority
          className="object-cover"
        />

        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(248,252,254,0.95) 0%, rgba(248,252,254,0.82) 45%, rgba(248,252,254,0.35) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(248,252,254,0.96) 0%, rgba(248,252,254,0.88) 28%, rgba(248,252,254,0.52) 52%, rgba(248,252,254,0.12) 75%, rgba(248,252,254,0) 100%)",
          }}
        />

        <SectionWrap>
          <div className="relative z-10 flex items-center min-h-[420px] sm:min-h-[480px] lg:min-h-[560px]">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="w-12 h-[2px]"
                  style={{ backgroundColor: GOLD }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-[0.3em]"
                  style={{ color: PRIMARY }}
                >
                  Build With Wind
                </span>
              </div>

              <h2
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-6"
                style={{ color: PRIMARY }}
              >
                Join us in powering
                <br />
                the{" "}
                <span style={{ color: ACCENT }}>wind energy future</span>
              </h2>

              <p
                className="max-w-xl text-base lg:text-lg leading-8 mb-10"
                style={{ color: "#475569" }}
              >
                Be part of Big Bull Energies — grow with a wind-led renewable
                platform that connects clean generation to transparent investor
                opportunity.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/our-plan"
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: GOLD,
                    color: "#111827",
                  }}
                >
                  View Our Plan
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all duration-300 hover:bg-white"
                  style={{
                    color: PRIMARY,
                    border: `1px solid ${PRIMARY}`,
                    background: "rgba(255,255,255,0.45)",
                    backdropFilter: "blur(14px)",
                  }}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </SectionWrap>
      </section>

      <Footer />
    </main>
  );
}
