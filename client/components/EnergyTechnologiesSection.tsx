"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Technology {
  title: string;
  description: string;
  image: string;
  icon: JSX.Element;
}

const technologies: Technology[] = [
  {
    title: "Natural Gas",
    description:
      "Natural gas is a useful asset in the multi-technology generation mix - providing additional, dispatchable energy to meet the electricity needs of consumers.",
    image: "/img1.png",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#042B19" }}
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
    title: "Storage",
    description:
      "Storing energy for delivery when and where it's needed helps to stabilize power supply costs, availability and resilience.",
    image: "/img2.webp",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#042B19" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 2v6m0 6v6"
        />
      </svg>
    ),
  },
  {
    title: "Transmission",
    description:
      "Transmission lines are the critical infrastructure necessary to deliver reliable, affordable energy efficiently and dependably throughout the power grid.",
    image: "/img3.webp",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#042B19" }}
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
    title: "Solar",
    description:
      "For more than a decade, Invenergy has provided simple and scalable solar energy solutions tailored to our customers' unique needs while boosting local economies.",
    image: "/img4.webp",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#042B19" }}
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
  {
    title: "Wind",
    description:
      "Land-based wind energy is an affordable, clean, and market-driven solution that creates jobs and strengthens energy security, and it's part of the energy mix needed to meet growing demand and power economies.",
    image: "/img5.webp",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "#042B19" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
];

export default function EnergyTechnologiesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInViewport, setIsInViewport] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect when section enters viewport
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInViewport(entry.isIntersecting);
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: "0px",
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Scroll hijacking effect - only active when in viewport
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !isInViewport) return;

    let scrollProgress = 0;
    let isScrolling = false;
    const totalSlides = technologies.length;
    const scrollThreshold = 80; // Reduced for more responsive scrolling
    const lastSlideIndex = totalSlides - 1; // Index 4 (5th slide)

    const animateSlideChange = (direction: "up" | "down") => {
      isScrolling = true;

      // Image animation
      gsap.to(imageRef.current, {
        opacity: 0,
        y: direction === "down" ? -20 : 20,
        duration: 0.25,
        ease: "power2.out",
        onComplete: () => {
          gsap.fromTo(
            imageRef.current,
            { opacity: 0, y: direction === "down" ? 20 : -20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
            }
          );
        },
      });

      // Text animation
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
            }
          );
        },
      });
    };

    const handleWheel = (e: WheelEvent) => {
      // If we're on the last slide (5th) and scrolling down, allow normal scroll
      if (currentIndex === lastSlideIndex && e.deltaY > 0) {
        return; // Don't prevent default, allow normal scrolling
      }

      // If we're on the first slide and scrolling up, allow normal scroll
      if (currentIndex === 0 && e.deltaY < 0) {
        return; // Don't prevent default, allow normal scrolling
      }

      // For all other cases, hijack the scroll
      e.preventDefault();

      if (isScrolling) return;

      const delta = e.deltaY;
      scrollProgress += delta;

      if (Math.abs(scrollProgress) >= scrollThreshold) {
        if (delta > 0 && currentIndex < lastSlideIndex) {
          // Scroll down - next slide
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          animateSlideChange("down");
        } else if (delta < 0 && currentIndex > 0) {
          // Scroll up - previous slide
          const prevIndex = currentIndex - 1;
          setCurrentIndex(prevIndex);
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
          {/* Left Side - Title and Image */}
          <div className="relative z-10 flex flex-col order-2 lg:order-1">
            <p
              className="text-xs sm:text-sm font-medium mb-3 sm:mb-4 uppercase tracking-wide"
              style={{ color: "#042B19" }}
            >
              ENERGY TECHNOLOGIES
            </p>
            <h2
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal leading-tight mb-6 md:mb-8"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-custom), 'CustomFont', sans-serif",
              }}
            >
              Empowering you with a broad array of energy technologies.
            </h2>

            {/* Smaller Circular Image */}
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

          {/* Right Side - Content */}
          <div className="relative z-10 order-1 lg:order-2">
            {/* Introduction Text */}
            <p
              className="text-base sm:text-lg md:text-xl leading-relaxed mb-4 md:mb-5"
              style={{ color: "#042B19" }}
            >
              Invenergy is flexible in meeting your energy needs with a
              portfolio of proven and emerging technologies that capture, make,
              store and move energy at scale. We&apos;ll work with you to pinpoint
              the best solution, whether it&apos;s a single source or combination of
              technologies.
            </p>

            <div className="h-px bg-gray-300 mb-4 md:mb-5"></div>

            {/* Technology Details */}
            <div ref={textRef} key={currentIndex}>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8">{currentTech.icon}</div>
                <h3
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold"
                  style={{
                    color: "#042B19",
                    fontFamily: "'Font3', sans-serif",
                    fontWeight: "400",
                  }}
                >
                  {currentTech.title}
                </h3>
              </div>
              <p
                className="text-base sm:text-lg md:text-xl leading-relaxed mb-4 md:mb-5 max-w-[500px]"
                style={{
                  color: "#042B19",
                  lineHeight: "1.7",
                }}
              >
                {currentTech.description}
              </p>
              <Link
                href={`/energy-technologies/${currentTech.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
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
                    style={{ color: "#042B19" }}
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
                  style={{ color: "#042B19" }}
                >
                  LEARN MORE
                </span>
              </Link>
            </div>

            <div className="h-px bg-gray-300 mt-4 md:mt-5"></div>

            {/* Scroll Indicator */}
            <div className="flex items-center gap-2 mt-4 md:mt-5">
              {technologies.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 sm:w-12 bg-[#042B19]"
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
