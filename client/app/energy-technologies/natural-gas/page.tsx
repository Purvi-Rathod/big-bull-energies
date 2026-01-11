"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";

function NaturalGasMarquee() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const items = ["NATURAL GAS", "NATURAL GAS", "NATURAL GAS", "NATURAL GAS"];

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

export default function NaturalGasPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]">
      {/* Hero Section with Background Image */}
      <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <Image
          src="/hero-gas.webp"
          alt="Natural Gas Energy"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-transparent"></div>
      </section>

      {/* Natural Gas Marquee */}
      <NaturalGasMarquee />

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
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "#042B19" }} />
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#042B19" }}
                >
                  NATURAL GAS
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
                  alt="Natural Gas Power Plant"
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
                Natural gas is a useful asset in the multi-technology generation
                mix, providing additional, dispatchable energy to meet the
                electricity needs of consumers.
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
                Our proven track record in natural gas
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
                      13
                    </span>
                    <span
                      className="text-sm sm:text-base md:text-lg lg:text-xl"
                      style={{ color: "#042B19" }}
                    >
                      operational natural gas facilities
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
                      6
                    </span>
                    <span
                      className="text-sm sm:text-base md:text-lg lg:text-xl"
                      style={{ color: "#042B19" }}
                    >
                      gigawatts of power
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
                      23K
                    </span>
                    <span
                      className="text-sm sm:text-base md:text-lg lg:text-xl"
                      style={{ color: "#042B19" }}
                    >
                      gigawatt hours produced by our natural gas facilities in 2024
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
                  alt="Natural Gas Industrial Complex"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Natural Gas Works Section */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-10 md:mb-12 text-center"
            style={{ color: "#042B19" }}
          >
            How natural gas works
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
            {/* Left Side - Steps List */}
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 order-2 lg:order-1">
              {[
                {
                  number: 1,
                  text: "Ambient air is filtered to remove dust and contaminants.",
                },
                {
                  number: 2,
                  text: "Air is compressed to high pressure by a compressor.",
                },
                {
                  number: 3,
                  text: "Fuel is injected into the compressed air and combusted to heat the air.",
                },
                {
                  number: 4,
                  text: "The hot compressed air is expanded through a turbine to turn a generator and produce electrical power.",
                },
                {
                  number: 5,
                  text: "The electric output of the generator is transformed to a high voltage.",
                },
                {
                  number: 6,
                  text: "The electrical power is transmitted via transmission lines.",
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
                alt="How Natural Gas Works Diagram"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Natural Gas Section */}
      <section className="relative w-full bg-gray-50 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
            {/* Left Side - Text Content */}
            <div className="flex flex-col order-2 lg:order-1">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8"
                style={{ color: "#042B19" }}
              >
                Why natural gas
              </h2>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span
                    className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 flex-shrink-0"
                    style={{ color: "#042B19" }}
                  >
                    →
                  </span>
                  <p
                    className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
                    style={{ color: "#042B19" }}
                  >
                    Fast-start peaking plants provide essential, dispatchable
                    energy that can respond quickly to demand fluctuations.
                    These facilities are able to ramp up or down quickly, making
                    this technology an additional reliability backstop.
                  </p>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <span
                    className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 flex-shrink-0"
                    style={{ color: "#042B19" }}
                  >
                    →
                  </span>
                  <p
                    className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
                    style={{ color: "#042B19" }}
                  >
                    Combined-cycle plants offer a stable and highly efficient
                    energy generation solution for baseload power, helping to
                    diversify our power grid. This includes natural gas plants
                    that use liquefied natural gas as their primary source –
                    like Invenergy&apos;s Energía del Pacífico project, which
                    provides nearly 30% of El Salvador&apos;s total energy
                    demand.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Street Scene Illustration */}
            <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px] order-1 lg:order-2 mb-4 sm:mb-0">
              <img
                src="/gas3.svg"
                alt="Community benefiting from natural gas energy"
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
              Ready to explore natural gas solutions?
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
