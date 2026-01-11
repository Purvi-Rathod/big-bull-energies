"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, Mountain } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";

function GeothermalMarquee() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const items = ["GEOTHERMAL", "GEOTHERMAL", "GEOTHERMAL", "GEOTHERMAL"];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const checkVisibility = () => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewportMiddle = window.innerHeight * 0.5;
      if (rect.top <= viewportMiddle && rect.top >= -rect.height) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", checkVisibility);
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
        {items.map((item, index) => (
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
              {item}
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

export default function GeothermalPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]">
      {/* Hero Section with Background Image */}
      <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <Image
          src="/hero-gas.webp"
          alt="Geothermal Energy"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-transparent"></div>
      </section>

      {/* Geothermal Marquee */}
      <GeothermalMarquee />

      {/* Main Content Section */}
      <section className="relative w-full bg-white py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Left Column - Text Content */}
            <div className="flex flex-col order-2 lg:order-1">
              {/* Breadcrumbs/Navigation */}
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 flex-wrap">
                <div className="h-px w-8 sm:w-12 bg-[#042B19]"></div>
                <Link
                  href="/energy-technologies"
                  className="text-xs font-medium uppercase tracking-wide hover:opacity-70 transition"
                  style={{ color: "#042B19" }}
                >
                  ENERGY TECHNOLOGIES
                </Link>
                <div className="h-4 w-px bg-gray-300"></div>
                <Mountain className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "#ffcf0B" }} />
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#042B19" }}
                >
                  GEOTHERMAL
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-tight mb-6 sm:mb-8"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                A core component of Invenergy&apos;s energy mix.
              </h1>
            </div>

            {/* Right Column - Image and Caption */}
            <div className="flex flex-col order-1 lg:order-2">
              <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] mb-4 sm:mb-6">
                <Image
                  src="/img1.png"
                  alt="Geothermal Power Plant"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Geothermal energy harnesses the Earth&apos;s natural heat to generate
                clean, renewable electricity. This sustainable energy source provides
                reliable power generation with minimal environmental impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Left Side - Statistics */}
            <div className="flex flex-col order-2 lg:order-1">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8"
                style={{ color: "#042B19" }}
              >
                Our proven track record in geothermal
              </h2>

              {/* Statistics */}
              <div className="space-y-4 sm:space-y-6">
                {/* Stat 1 */}
                <div>
                  <div className="h-px bg-[#042B19] mb-3 sm:mb-4"></div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
                    <span
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold"
                      style={{ color: "#042B19" }}
                    >
                      5+
                    </span>
                    <span
                      className="text-sm sm:text-base md:text-lg lg:text-xl"
                      style={{ color: "#042B19" }}
                    >
                      geothermal projects in development
                    </span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div>
                  <div className="h-px bg-[#042B19] mb-3 sm:mb-4"></div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
                    <span
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold"
                      style={{ color: "#042B19" }}
                    >
                      500+
                    </span>
                    <span
                      className="text-sm sm:text-base md:text-lg lg:text-xl"
                      style={{ color: "#042B19" }}
                    >
                      megawatts of geothermal capacity planned
                    </span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div>
                  <div className="h-px bg-[#042B19] mb-3 sm:mb-4"></div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
                    <span
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold"
                      style={{ color: "#042B19" }}
                    >
                      100+
                    </span>
                    <span
                      className="text-sm sm:text-base md:text-lg lg:text-xl"
                      style={{ color: "#042B19" }}
                    >
                      years of sustainable energy potential
                    </span>
                  </div>
                </div>

                {/* Final line */}
                <div className="h-px bg-[#042B19] mt-3 sm:mt-4"></div>
              </div>
            </div>

            {/* Right Side - Illustration and CTA */}
            <div className="relative flex flex-col items-start lg:items-end order-1 lg:order-2">
              {/* CTA Link */}
              <Link
                href="/projects"
                className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-wide mb-6 sm:mb-8 hover:opacity-70 transition"
                style={{
                  color: "#042B19",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                VIEW INVENERGY PROJECTS
              </Link>

              {/* Line Art Illustration */}
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <img
                  src="/gas1.svg"
                  alt="Geothermal Energy Facility"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Geothermal Works Section */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-10 md:mb-12 text-center"
            style={{ color: "#042B19" }}
          >
            How geothermal energy works
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
            {/* Left Side - Steps List */}
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 order-2 lg:order-1">
              {[
                {
                  number: 1,
                  text: "Hot water or steam is extracted from underground reservoirs through production wells.",
                },
                {
                  number: 2,
                  text: "The geothermal fluid is brought to the surface and separated into steam and water.",
                },
                {
                  number: 3,
                  text: "Steam is used to drive turbines connected to generators that produce electricity.",
                },
                {
                  number: 4,
                  text: "The used geothermal fluid is reinjected back into the reservoir through injection wells.",
                },
                {
                  number: 5,
                  text: "The electrical output is transformed to high voltage through transformers.",
                },
                {
                  number: 6,
                  text: "Electricity is transmitted via transmission lines to the power grid.",
                },
              ].map((step) => (
                <div key={step.number} className="flex items-start gap-3 sm:gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shadow-md"
                    style={{
                      backgroundColor: "#E8F5F0",
                      color: "#042B19",
                      border: "2px solid #042B19",
                      boxShadow: "0 4px 6px rgba(4, 43, 25, 0.1)",
                    }}
                  >
                    {step.number}
                  </div>
                  <p
                    className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed flex-1"
                    style={{ color: "#042B19" }}
                  >
                    {step.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Side - Diagram Illustration */}
            <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px] order-1 lg:order-2 mb-4 sm:mb-0">
              <img
                src="/gas2.webp"
                alt="How Geothermal Energy Works Diagram"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Geothermal Section */}
      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
            {/* Left Side - Text Content */}
            <div className="flex flex-col order-2 lg:order-1">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
                style={{ color: "#042B19" }}
              >
                Why geothermal energy
              </h2>
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-4 sm:mb-6"
                style={{ color: "#042B19" }}
              >
                Geothermal energy offers unique advantages as a renewable energy source.
                Geothermal&apos;s benefits include:
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span
                    className="text-lg sm:text-xl flex-shrink-0 mt-0.5"
                    style={{ color: "#042B19" }}
                  >
                    →
                  </span>
                  <p
                    className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
                    style={{ color: "#042B19" }}
                  >
                    Renewable and sustainable energy source with minimal carbon footprint
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span
                    className="text-lg sm:text-xl flex-shrink-0 mt-0.5"
                    style={{ color: "#042B19" }}
                  >
                    →
                  </span>
                  <p
                    className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
                    style={{ color: "#042B19" }}
                  >
                    Reliable base-load power available 24/7 regardless of weather conditions
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span
                    className="text-lg sm:text-xl flex-shrink-0 mt-0.5"
                    style={{ color: "#042B19" }}
                  >
                    →
                  </span>
                  <p
                    className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
                    style={{ color: "#042B19" }}
                  >
                    Long operational lifespan with low operating and maintenance costs
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px] order-1 lg:order-2 mb-4 sm:mb-0">
              <img
                src="/gas3.svg"
                alt="Geothermal Energy Benefits"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal mb-6 sm:mb-8 px-2"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Ready to explore geothermal solutions?
            </h2>
            <Link
              href="/contact"
              className="inline-block bg-[#ffcf0B] text-gray-900 font-bold px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm md:text-base uppercase tracking-wide transition hover:opacity-90 w-full sm:w-auto text-center"
              style={{ borderRadius: "0" }}
            >
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
