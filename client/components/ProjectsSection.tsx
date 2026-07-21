"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import createGlobe, { type COBEOptions } from "cobe";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const GOLD = "#F5CF0B";
const NEON = "#00D4FF";
const PRIMARY = "#05627C";
const ACCENT = "#3FA9C8";
const FONT_HEADING = "var(--font-font4), sans-serif";

const STATS = [
  { value: 50, suffix: "+", label: "Active Projects", sub: "Deployed worldwide" },
  { value: 500, suffix: "+", label: "Megawatts", sub: "Clean energy capacity" },
  { value: 3, suffix: "", label: "Continents", sub: "Global reach" },
];

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.22,
  dark: 1,
  diffuse: 1.45,
  mapSamples: 20000,
  mapBrightness: 8.5,
  baseColor: [0.05, 0.16, 0.28],
  markerColor: [0.25, 0.88, 1],
  glowColor: [0.08, 0.55, 0.9],
  markers: [
    { location: [51.5074, -0.1278], size: 0.065 },
    { location: [48.8566, 2.3522], size: 0.055 },
    { location: [52.52, 13.405], size: 0.055 },
    { location: [30.0444, 31.2357], size: 0.055 },
    { location: [19.076, 72.8777], size: 0.07 },
    { location: [1.3521, 103.8198], size: 0.05 },
    { location: [40.7128, -74.006], size: 0.06 },
    { location: [-23.5505, -46.6333], size: 0.055 },
    { location: [53.2198, 6.5665], size: 0.05 },
    { location: [-33.8688, 151.2093], size: 0.045 },
  ],
  onRender: () => {},
};

function StatCard({
  value,
  suffix,
  label,
  sub,
  index,
}: {
  value: number;
  suffix: string;
  label: string;
  sub: string;
  index: number;
}) {
  const numRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const numEl = numRef.current;
    const cardEl = cardRef.current;
    if (!numEl || !cardEl) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.8,
      delay: index * 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: cardEl,
        start: "top 88%",
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        numEl.textContent = `${Math.round(obj.val)}${suffix}`;
      },
    });
  }, [value, suffix, index]);

  return (
    <div
      ref={cardRef}
      className="projects-stat-card group flex items-center gap-4 sm:gap-5 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 border border-white/[0.08] border-l-[3px] transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        borderLeftColor: "rgba(63,169,200,0.35)",
      }}
    >
      <span
        ref={numRef}
        className="text-2xl sm:text-[1.75rem] font-bold tabular-nums shrink-0 w-[72px] sm:w-[80px] bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105"
        style={{
          backgroundImage: `linear-gradient(135deg, #fff 0%, ${ACCENT} 100%)`,
          fontFamily: FONT_HEADING,
        }}
      >
        0{suffix}
      </span>
      <div className="min-w-0">
        <p className="text-sm sm:text-[15px] font-semibold text-white leading-tight">{label}</p>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function GlobeVisual({ parallaxX, parallaxY }: { parallaxX: number; parallaxY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);

  const onRender = useCallback((state: Record<string, unknown>) => {
    phiRef.current += 0.003;
    state.phi = phiRef.current;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe: ReturnType<typeof createGlobe> | undefined;

    const init = () => {
      const w = canvas.offsetWidth || 300;
      globe?.destroy();
      globe = createGlobe(canvas, {
        ...GLOBE_CONFIG,
        width: w * 2,
        height: w * 2,
        onRender,
      });
    };

    init();
    const t = window.setTimeout(() => {
      canvas.style.opacity = "1";
    }, 80);

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      globe?.destroy();
    };
  }, [onRender]);

  return (
    <div
      className="projects-globe-float relative w-full aspect-square max-w-[420px] mx-auto lg:max-w-none"
      style={{
        transform: `translate(${parallaxX * 8}px, ${parallaxY * 8}px)`,
        transition: "transform 0.2s ease-out",
      }}
    >
      {/* Ambient bloom */}
      <div
        className="projects-glow-pulse absolute inset-[8%] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,180,255,0.35) 0%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />

      {/* Two orbit rings + energy arc */}
      {[
        { cls: "projects-orbit-slow w-[92%] h-[92%]", opacity: 0.35 },
        { cls: "projects-orbit-mid w-[78%] h-[78%]", opacity: 0.22 },
        { cls: "projects-orbit-fast w-[88%] h-[88%]", opacity: 0.15 },
      ].map((ring, i) => (
        <div
          key={i}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none ${ring.cls}`}
          style={{
            borderTopColor: `rgba(0,212,255,${ring.opacity + 0.4})`,
            borderColor: `rgba(0,212,255,${ring.opacity * 0.5})`,
          }}
        />
      ))}

      {/* Floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="projects-star-drift absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: `${12 + i * 14}%`,
            top: `${8 + ((i * 19) % 75)}%`,
            background: i % 2 === 0 ? NEON : "rgba(255,255,255,0.8)",
            boxShadow: `0 0 6px ${NEON}`,
            opacity: 0.35,
            animationDuration: `${5 + i * 1.2}s`,
            animationDelay: `${i * -0.8}s`,
          }}
        />
      ))}

      {/* Globe */}
      <div className="absolute inset-[12%]">
        <canvas
          ref={canvasRef}
          className="w-full h-full opacity-0 transition-opacity duration-700"
          style={{ filter: "drop-shadow(0 0 40px rgba(0,180,255,0.45))" }}
        />
      </div>

      {/* Floor reflection */}
      <div
        className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[55%] h-3 rounded-[100%] pointer-events-none projects-energy-pulse"
        style={{
          background: "radial-gradient(ellipse, rgba(0,212,255,0.4) 0%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />
    </div>
  );
}

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".projects-reveal",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-16 sm:py-20 md:py-24"
      style={{
        background: "linear-gradient(180deg, #031525 0%, #061e38 50%, #0a2848 100%)",
      }}
      onMouseMove={(e) => {
        if (!sectionRef.current) return;
        const r = sectionRef.current.getBoundingClientRect();
        setParallax({
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
        });
      }}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
    >
      {/* Grid texture + noise */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(5,98,124,0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1220px] mx-auto">
          {/* Unified panel */}
          <div
            className="projects-panel relative rounded-2xl sm:rounded-3xl border border-white/[0.1] overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 100%)",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* Top shine */}
            <div
              className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
              }}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Content */}
              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12 xl:p-14 order-2 lg:order-1">
                <div className="projects-reveal flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${PRIMARY}cc` }}
                  >
                    <Globe2 className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                    Global Projects
                  </span>
                  <div className="h-px flex-1 max-w-[48px]" style={{ backgroundColor: GOLD }} />
                </div>

                <h2
                  className="projects-reveal text-2xl sm:text-3xl lg:text-[2.125rem] xl:text-4xl font-bold leading-[1.15] text-white mb-2"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  Powering the world through{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${ACCENT} 0%, ${NEON} 100%)`,
                    }}
                  >
                    renewable energy
                  </span>
                </h2>

                <div
                  className="projects-reveal h-[2px] w-10 mb-4 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />

                <p className="projects-reveal text-sm sm:text-[15px] text-slate-400 leading-relaxed mb-7 max-w-md">
                  From solar farms to wind installations — we deliver sustainable
                  energy solutions that power a cleaner tomorrow across the globe.
                </p>

                <div className="projects-reveal space-y-2.5 sm:space-y-3 mb-8">
                  {STATS.map((s, i) => (
                    <StatCard key={s.label} {...s} index={i} />
                  ))}
                </div>

                <Link
                  href="/gallery"
                  className="projects-cta-btn group relative z-20 inline-flex items-center gap-2.5 self-start font-bold pl-6 pr-2 py-2.5 text-xs sm:text-sm uppercase tracking-wide rounded-full transition-all duration-300 shadow-[0_4px_24px_rgba(245,207,11,0.4)]"
                  style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
                >
                  See Our Projects
                  <span className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1a1a1a]/10 transition-transform duration-300 group-hover:scale-105">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" style={{ color: "#1a1a1a" }} />
                  </span>
                </Link>
              </div>

              {/* Globe */}
              <div
                className="relative flex items-center justify-center p-6 sm:p-8 lg:p-10 order-1 lg:order-2 min-h-[320px] lg:min-h-[440px]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,120,180,0.14) 0%, transparent 72%)",
                }}
              >
                {/* Live badge */}
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/70">
                    Live Deployments
                  </span>
                </div>

                {/* Vertical divider glow on desktop */}
                <div
                  className="hidden lg:block absolute left-0 top-[12%] bottom-[12%] w-px"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(63,169,200,0.3), transparent)",
                  }}
                />

                <div className="projects-reveal w-full max-w-[360px] sm:max-w-[400px] lg:max-w-full lg:w-[90%]">
                  <GlobeVisual parallaxX={parallax.x} parallaxY={parallax.y} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
