"use client";

import { useState, useEffect, useRef } from "react";

export default function TechnologiesMarquee() {
  const technologies = ["NATURAL GAS", "STORAGE", "TRANSMISSION"];
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless loop
  const duplicatedItems = [...technologies, ...technologies, ...technologies];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const checkVisibility = () => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      // Trigger when the top of the section reaches the top or middle-top (50%) of viewport
      const viewportMiddle = window.innerHeight * 0.5;
      if (rect.top <= viewportMiddle && rect.top >= -rect.height) {
        setIsVisible(true);
      }
    };

    // Check on scroll
    window.addEventListener("scroll", checkVisibility);
    // Initial check
    checkVisibility();

    return () => {
      window.removeEventListener("scroll", checkVisibility);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-6 sm:pb-8 md:pb-10 lg:pb-12"
    >
      <div className={`flex ${isVisible ? "animate-scroll" : ""}`}>
        {duplicatedItems.map((tech, index) => (
          <div key={index} className="flex items-center whitespace-nowrap">
            <span
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold uppercase tracking-tight"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-custom), 'CustomFont', sans-serif",
                WebkitTextStroke: "2px #042B19",
                WebkitTextFillColor: "transparent",
              }}
            >
              {tech}
            </span>
            <span
              className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
              style={{ color: "#042B19" }}
            >
              ·
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
