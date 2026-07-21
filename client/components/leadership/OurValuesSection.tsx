"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const ORBIT_RINGS = [
  {
    cls: "values-orbit-outer",
    inset: "0%",
    dots: [0, 60, 120, 180, 240, 300],
    borderTop: "rgba(0,212,255,0.9)",
    borderRight: "rgba(0,212,255,0.45)",
    shadow: "0 0 22px rgba(0,212,255,0.28)",
  },
  {
    cls: "values-orbit-slow",
    inset: "4%",
    dots: [0, 72, 144, 216, 288],
    borderTop: "rgba(0,212,255,0.95)",
    borderRight: "rgba(0,212,255,0.55)",
    shadow: "0 0 20px rgba(0,212,255,0.25)",
  },
  {
    cls: "values-orbit-wide",
    inset: "7%",
    dots: [30, 110, 190, 270, 350],
    borderTop: "rgba(63,169,200,0.9)",
    borderRight: "rgba(0,212,255,0.4)",
    shadow: "0 0 18px rgba(63,169,200,0.2)",
  },
  {
    cls: "values-orbit-mid",
    inset: "10%",
    dots: [36, 126, 216, 306],
    borderTop: "rgba(63,169,200,0.85)",
    borderRight: "rgba(0,212,255,0.35)",
    shadow: "0 0 18px rgba(63,169,200,0.18)",
  },
  {
    cls: "values-orbit-fast",
    inset: "13%",
    dots: [18, 108, 198, 288],
    borderTop: "rgba(96,224,255,0.85)",
    borderRight: "rgba(0,212,255,0.3)",
    shadow: "0 0 16px rgba(96,224,255,0.16)",
  },
  {
    cls: "values-orbit-inner",
    inset: "16%",
    dots: [45, 135, 225, 315],
    borderTop: "rgba(96,224,255,0.8)",
    borderRight: "rgba(0,212,255,0.28)",
    shadow: "0 0 14px rgba(96,224,255,0.14)",
  },
  {
    cls: "values-orbit-tight",
    inset: "19%",
    dots: [0, 90, 180, 270],
    borderTop: "rgba(0,212,255,0.75)",
    borderRight: "rgba(0,212,255,0.25)",
    shadow: "0 0 12px rgba(0,212,255,0.12)",
  },
] as const;

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

    let globe: ReturnType<typeof createGlobe> | undefined;

    const initGlobe = () => {
      const width = canvas.offsetWidth || 320;
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
      className="relative w-full min-w-[280px] max-w-[560px] sm:max-w-[600px] lg:max-w-none lg:w-[105%] xl:w-[110%] aspect-square lg:-mr-2 xl:-mr-4 lg:ml-auto"
      style={{
        transform: `translate(${parallaxX * 12}px, ${parallaxY * 12}px)`,
        transition: "transform 0.15s ease-out",
      }}
    >
      <div className="values-globe-float relative w-full h-full">
        {/* Globe hub — all rings, particles & canvas share this center */}
        <div
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[82%] aspect-square"
          style={{ perspective: "900px", transformStyle: "preserve-3d" }}
        >
          {/* Radial bloom */}
          <div
            className="values-glow-pulse absolute inset-[-8%] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(0,180,255,0.35) 0%, rgba(0,100,200,0.12) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Orbit rings with dots locked to each ring line */}
          {ORBIT_RINGS.map((ring) => (
            <div
              key={ring.cls}
              className={`${ring.cls} absolute rounded-full border-[1.5px] border-cyan-400/25 pointer-events-none`}
              style={{
                inset: ring.inset,
                borderTopColor: ring.borderTop,
                borderRightColor: ring.borderRight,
                boxShadow: ring.shadow,
              }}
            >
              {ring.dots.map((angle, i) => (
                <div
                  key={angle}
                  className="absolute inset-0"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div
                    className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                    style={{
                      background: NEON,
                      opacity: 0.55 + i * 0.08,
                      boxShadow: `0 0 8px ${NEON}, 0 0 14px rgba(0,212,255,0.55)`,
                    }}
                  />
                </div>
              ))}
            </div>
          ))}

          {/* Cobe globe canvas */}
          <div className="absolute inset-[10%]">
            <canvas
              ref={canvasRef}
              className="w-full h-full opacity-0 transition-opacity duration-700"
              style={{ filter: "drop-shadow(0 0 30px rgba(0,180,255,0.4))" }}
            />
          </div>
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
          className="values-energy-pulse absolute left-1/2 bottom-[14%] -translate-x-1/2 w-[70%] h-8 rounded-full pointer-events-none"
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
    </div>
  );
}

export default function OurValuesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingLineRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      tl.fromTo(
        ".values-animate-item",
        { opacity: 0, y: 32, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        },
      );

      if (headingLineRef.current) {
        tl.fromTo(
          headingLineRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 1, ease: "power2.inOut" },
          "-=0.4",
        );
      }

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const st = tl.scrollTrigger;
        if (st && st.progress === 0) {
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85) {
            tl.progress(1);
          }
        }
      });
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
      className="relative w-full py-6 sm:py-8 md:py-10 lg:py-12 overflow-x-clip"
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

      {/* Background radial glow — anchored to right where globe sits */}
      <div
        className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[45%] h-[70%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,120,200,0.18) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 sm:gap-12 lg:gap-14 xl:gap-16 items-center">
          {/* Left — Text content */}
          <div className="relative lg:pr-6 xl:pr-10">
            <div className="values-animate-item flex items-center gap-3 mb-5">
              <div className="h-px w-10" style={{ backgroundColor: GOLD }} />
              <span
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: GOLD }}
              >
                Our Values
              </span>
            </div>

            <div className="values-animate-item relative mb-5 sm:mb-6">
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-[1.15] text-white">
                <span className="relative inline-block pr-4 sm:pr-6">
                  Diversity of ideas.
                  <span
                    ref={headingLineRef}
                    className="hidden sm:block absolute left-full top-1/2 -translate-y-1/2 w-16 sm:w-24 lg:w-32 h-px origin-left"
                    style={{
                      background: `linear-gradient(90deg, ${NEON}, transparent)`,
                      boxShadow: `0 0 10px rgba(0,212,255,0.35)`,
                    }}
                  />
                </span>{" "}
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
            </div>

            <p className="values-animate-item text-sm sm:text-base leading-relaxed text-slate-400 max-w-lg">
              We believe that our colleagues power Big Bull Energies&apos;
              success and our innovative solutions are generated by the
              diversity of ideas and perspectives that are shared by employees
              who bring their whole self to work.
            </p>
          </div>

          {/* Right — 3D Globe effect */}
          <div className="relative flex items-center justify-center lg:justify-end min-h-[340px] sm:min-h-[400px] lg:min-h-[520px] xl:min-h-[580px] overflow-visible">
            <HolographicGlobe parallaxX={parallax.x} parallaxY={parallax.y} />
          </div>
        </div>
      </div>
    </section>
  );
}
