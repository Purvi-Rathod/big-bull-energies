"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import createGlobe, { type COBEOptions } from "cobe";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const GOLD = "#F5CF0B";
const NEON = "#00D4FF";

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.22,
  dark: 1,
  diffuse: 1.4,
  mapSamples: 20000,
  mapBrightness: 8,
  baseColor: [0.08, 0.22, 0.38],
  markerColor: [0.15, 0.75, 1],
  glowColor: [0.12, 0.55, 0.95],
  markers: [
    { location: [40.7128, -74.006], size: 0.06 },
    { location: [51.5074, -0.1278], size: 0.05 },
    { location: [52.52, 13.405], size: 0.05 },
    { location: [19.076, 72.8777], size: 0.06 },
    { location: [1.3521, 103.8198], size: 0.04 },
    { location: [35.6762, 139.6503], size: 0.05 },
    { location: [-23.5505, -46.6333], size: 0.05 },
    { location: [53.2198, 6.5665], size: 0.04 },
    { location: [-33.8688, 151.2093], size: 0.04 },
    { location: [25.2048, 55.2708], size: 0.04 },
  ],
  onRender: () => {},
};

function HolographicGlobe({
  parallaxX,
  parallaxY,
}: {
  parallaxX: number;
  parallaxY: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);

  const onRender = useCallback((state: Record<string, unknown>) => {
    phiRef.current += 0.004;
    state.phi = phiRef.current;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth;
    let globe: ReturnType<typeof createGlobe> | undefined;

    const initGlobe = () => {
      width = canvas.offsetWidth || 320;
      globe?.destroy();
      globe = createGlobe(canvas, {
        ...GLOBE_CONFIG,
        width: width * 2,
        height: width * 2,
        onRender,
      });
    };

    initGlobe();
    const showTimer = window.setTimeout(() => {
      canvas.style.opacity = "1";
    }, 50);

    const observer = new ResizeObserver(() => initGlobe());
    observer.observe(canvas);

    return () => {
      window.clearTimeout(showTimer);
      observer.disconnect();
      globe?.destroy();
    };
  }, [onRender]);

  return (
    <div
      className="values-globe-float relative w-full max-w-[480px] mx-auto aspect-square"
      style={{
        transform: `translate(${parallaxX * 12}px, ${parallaxY * 12}px)`,
        transition: "transform 0.15s ease-out",
        perspective: "900px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Radial bloom behind globe */}
      <div
        className="values-glow-pulse absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,180,255,0.35) 0%, rgba(0,100,200,0.12) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Orbit rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`absolute left-1/2 top-[38%] rounded-full border pointer-events-none ${
            i === 0
              ? "values-orbit-slow w-[88%] h-[88%] border-cyan-400/30"
              : i === 1
                ? "values-orbit-mid w-[96%] h-[96%] border-cyan-300/20"
                : "values-orbit-fast w-[78%] h-[78%] border-blue-400/25"
          }`}
          style={{
            // Make rotation visibly directional (a full symmetric border can look static).
            borderTopColor: i === 0 ? "rgba(0,212,255,0.95)" : i === 1 ? "rgba(63,169,200,0.85)" : "rgba(96,224,255,0.85)",
            borderRightColor: i === 0 ? "rgba(0,212,255,0.55)" : i === 1 ? "rgba(0,212,255,0.35)" : "rgba(0,212,255,0.3)",
            boxShadow:
              i === 0
                ? "0 0 20px rgba(0,212,255,0.25)"
                : i === 1
                  ? "0 0 18px rgba(63,169,200,0.18)"
                  : "0 0 16px rgba(96,224,255,0.16)",
          }}
        />
      ))}

      {/* Orbiting particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-[38%] w-[68%] h-[68%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div
            className="values-particle-orbit absolute inset-0"
            style={{
              animationDuration: `${14 + i * 2}s`,
              animationDelay: `${i * -1.5}s`,
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
              style={{
                background: NEON,
                opacity: 0.45 + i * 0.04,
                boxShadow: `0 0 8px ${NEON}, 0 0 16px rgba(0,212,255,0.5)`,
                transform: `translate(-50%, -50%) translateX(${110 + i * 14}px)`,
              }}
            />
          </div>
        </div>
      ))}

      {/* Cobe globe canvas */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[68%] h-[68%]">
        <canvas
          ref={canvasRef}
          className="w-full h-full opacity-0 transition-opacity duration-700"
          style={{ filter: "drop-shadow(0 0 30px rgba(0,180,255,0.4))" }}
        />
      </div>

      {/* Volumetric light beam */}
      <div
        className="absolute left-1/2 bottom-[18%] -translate-x-1/2 w-[40%] h-[45%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,180,255,0.25) 0%, rgba(0,120,255,0.08) 50%, transparent 100%)",
          clipPath: "polygon(20% 100%, 80% 100%, 60% 0%, 40% 0%)",
          filter: "blur(8px)",
        }}
      />

      {/* Energy pulse from platform */}
      <div
        className="values-energy-pulse absolute left-1/2 bottom-[14%] w-[70%] h-8 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,212,255,0.45) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />

      {/* Pedestal */}
      <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[76%]">
        <div className="values-platform-pulse relative">
          <div
            className="h-6 sm:h-7 rounded-full mx-auto relative overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, #1e3a4f 0%, #0c1824 50%, #060e16 100%)",
              boxShadow:
                "0 0 20px rgba(0,180,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="absolute inset-x-[10%] top-1/2 -translate-y-1/2 h-[3px] rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`,
                boxShadow: `0 0 12px ${NEON}`,
              }}
            />
          </div>
          <div
            className="mx-auto w-[58%] h-10 sm:h-12 -mt-0.5 rounded-b-xl"
            style={{
              background:
                "linear-gradient(180deg, #152535 0%, #081018 60%, #040a10 100%)",
              boxShadow: "inset 0 2px 4px rgba(255,255,255,0.05)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function OurValuesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const accentLineRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      tl.from(".values-animate-item", {
        opacity: 0,
        y: 32,
        filter: "blur(8px)",
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      }).from(
        accentLineRef.current,
        { scaleX: 0, duration: 1, ease: "power2.inOut" },
        "-=0.3",
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x, y });
  };

  const handleMouseLeave = () => setParallax({ x: 0, y: 0 });

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden"
      style={{
        background:
          "linear-gradient(165deg, #021122 0%, #071A35 45%, #0B2246 100%)",
      }}
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(2,17,34,0.85) 100%)",
        }}
      />

      {/* Background radial glow */}
      <div
        className="absolute left-[15%] top-1/2 -translate-y-1/2 w-[55%] h-[70%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,120,200,0.18) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — 3D Globe */}
          <div className="relative order-2 lg:order-1">
            <HolographicGlobe parallaxX={parallax.x} parallaxY={parallax.y} />
          </div>

          {/* Right — Content */}
          <div className="order-1 lg:order-2 relative">
            <div className="values-animate-item flex items-center gap-3 mb-5">
              <div className="h-px w-10" style={{ backgroundColor: GOLD }} />
              <span
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: GOLD }}
              >
                Our Values
              </span>
            </div>

            <h2 className="values-animate-item text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-[1.15] mb-5 sm:mb-6 text-white">
              Diversity of ideas.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #00D4FF 0%, #3FA9C8 50%, #60E0FF 100%)",
                }}
              >
                Powering success.
              </span>
            </h2>

            <p className="values-animate-item text-sm sm:text-base leading-relaxed text-slate-400 max-w-lg mb-8">
              We believe that our colleagues power Big Bull Energies&apos;
              success. Our innovative solutions are generated by the diversity
              of ideas and perspectives shared by employees who bring their
              whole self to work. Fostering an inclusive environment enables
              everyone to grow to their full potential.
            </p>

            <div
              ref={accentLineRef}
              className="values-animate-item h-px w-full max-w-xs mb-8 origin-left"
              style={{
                background: `linear-gradient(90deg, ${NEON}, transparent)`,
                boxShadow: `0 0 12px rgba(0,212,255,0.4)`,
              }}
            />

            <Link
              href="/contact"
              className="values-animate-item values-cta-btn group inline-flex items-center gap-3 font-bold pl-6 pr-2 py-2.5 text-xs uppercase tracking-widest rounded-full border border-cyan-400/30 transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,180,255,0.15) 0%, rgba(0,100,180,0.08) 100%)",
                color: "#fff",
              }}
            >
              Explore Our Culture
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.6)]"
                style={{ backgroundColor: GOLD }}
              >
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  style={{ color: "#1a1a1a" }}
                />
              </span>
            </Link>

            {/* Decorative horizontal accent — far right */}
            <div
              className="hidden lg:block absolute right-0 top-8 w-24 h-px origin-right opacity-60"
              style={{
                background: `linear-gradient(270deg, ${NEON}, transparent)`,
                boxShadow: `0 0 10px rgba(0,212,255,0.35)`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
