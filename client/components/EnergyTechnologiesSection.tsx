"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Technology {
  title: string;
  slug: string;
  description: string;
  image: string;
  icon: JSX.Element;
}

const technologies: Technology[] = [
  {
    title: "Wind Energy",
    slug: "wind",
    description:
      "Land-based wind is the core of Big Bull Energies — converting natural airflow into clean, grid-ready electricity with scalable turbine farms.",
    image: "/wind-hero.png",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#05627C" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.364-6.364l-1.414 1.414M8.05 15.95l-1.414 1.414m12.728 0l-1.414-1.414M8.05 8.05 6.636 6.636"
        />
      </svg>
    ),
  },
  {
    title: "Turbine Systems",
    slug: "turbines",
    description:
      "Modern blades, nacelles, and control systems engineered to maximize capture across real-world wind regimes.",
    image: "/images/cta-turbines.png",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#05627C" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    title: "Energy Storage",
    slug: "storage",
    description:
      "Battery systems that firm wind output — storing surplus generation and releasing power when the grid needs it most.",
    image: "/storage-hero.png",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#05627C" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Grid Connection",
    slug: "transmission",
    description:
      "Substations and transmission links that move Big Bull wind power safely from the farm to energy markets.",
    image: "/Transmission-hero.webp",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#05627C" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    title: "Hybrid Solar",
    slug: "solar",
    description:
      "Solar capacity that complements our wind-led portfolio — diversifying clean generation across daylight hours.",
    image: "/hero-solar.webp",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#05627C" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
];

export default function EnergyTechnologiesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInViewport, setIsInViewport] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInViewport(entry.isIntersecting);
        });
      },
      { threshold: 0.3, rootMargin: "0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !isInViewport) return;

    let scrollProgress = 0;
    let isScrolling = false;
    const scrollThreshold = 80;
    const lastSlideIndex = technologies.length - 1;

    const animateSlideChange = (direction: "up" | "down") => {
      isScrolling = true;

      gsap.to(imageRef.current, {
        opacity: 0,
        y: direction === "down" ? -20 : 20,
        duration: 0.25,
        ease: "power2.out",
        onComplete: () => {
          gsap.fromTo(
            imageRef.current,
            { opacity: 0, y: direction === "down" ? 20 : -20 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          );
        },
      });

      gsap.to(textRef.current, {
        opacity: 0,
        y: direction === "down" ? -15 : 15,
        duration: 0.25,
        ease: "power2.out",
        onComplete: () => {
          gsap.fromTo(
            textRef.current,
            { opacity: 0, y: direction === "down" ? 15 : -15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
              onComplete: () => {
                isScrolling = false;
              },
            },
          );
        },
      });
    };

    const handleWheel = (e: WheelEvent) => {
      if (currentIndex === lastSlideIndex && e.deltaY > 0) return;
      if (currentIndex === 0 && e.deltaY < 0) return;

      e.preventDefault();
      if (isScrolling) return;

      const delta = e.deltaY;
      scrollProgress += delta;

      if (Math.abs(scrollProgress) >= scrollThreshold) {
        if (delta > 0 && currentIndex < lastSlideIndex) {
          setCurrentIndex(currentIndex + 1);
          animateSlideChange("down");
        } else if (delta < 0 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          animateSlideChange("up");
        }
        scrollProgress = 0;
      }
    };

    section.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      section.removeEventListener("wheel", handleWheel);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [currentIndex, isInViewport]);

  const currentTech = technologies[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-white overflow-hidden py-8 md:py-12 lg:py-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 h-full items-start pt-8 md:pt-12 lg:pt-16">
          <div className="relative z-10 flex flex-col order-2 lg:order-1">
            <p
              className="text-xs sm:text-sm font-medium mb-3 sm:mb-4 uppercase tracking-wide"
              style={{ color: "#05627C" }}
            >
              ENERGY TECHNOLOGIES
            </p>
            <h2
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal leading-tight mb-6 md:mb-8"
              style={{
                color: "#05627C",
                fontFamily: "var(--font-custom), 'CustomFont', sans-serif",
              }}
            >
              Wind-led technologies that power Big Bull Energies.
            </h2>

            <div className="relative w-full max-w-[240px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[360px] mx-auto lg:mx-0 mt-6 lg:mt-auto">
              <div
                ref={imageRef}
                className="relative w-full aspect-square rounded-full overflow-hidden"
              >
                <Image
                  key={currentIndex}
                  src={currentTech.image}
                  alt={currentTech.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 order-1 lg:order-2">
            <p
              className="text-base sm:text-lg md:text-xl leading-relaxed mb-4 md:mb-5"
              style={{ color: "#05627C" }}
            >
              Big Bull Energies specializes in wind power — supported by turbine
              systems, storage, grid connection, and hybrid solar that strengthen
              clean generation for communities and investors.
            </p>

            <div className="h-px bg-gray-300 mb-4 md:mb-5"></div>

            <div ref={textRef} key={currentIndex}>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8">
                  {currentTech.icon}
                </div>
                <h3
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold"
                  style={{
                    color: "#05627C",
                    fontFamily: "'Font3', sans-serif",
                    fontWeight: "400",
                  }}
                >
                  {currentTech.title}
                </h3>
              </div>
              <p
                className="text-base sm:text-lg md:text-xl leading-relaxed mb-4 md:mb-5 max-w-[500px]"
                style={{ color: "#05627C", lineHeight: "1.7" }}
              >
                {currentTech.description}
              </p>
              <Link
                href={`/energy-technologies/${currentTech.slug}`}
                className="inline-flex items-center gap-2 sm:gap-3 group mb-4 md:mb-5"
              >
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: "#ffcf0B" }}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "#05627C" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <span
                  className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wide"
                  style={{ color: "#05627C" }}
                >
                  LEARN MORE
                </span>
              </Link>
            </div>

            <div className="h-px bg-gray-300 mt-4 md:mt-5"></div>

            <div className="flex items-center gap-2 mt-4 md:mt-5">
              {technologies.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 sm:w-12 bg-[#05627C]"
                      : "w-2 sm:w-3 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
