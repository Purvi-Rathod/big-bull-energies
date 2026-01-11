"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/about-hero.webp"
          alt="About Us - Our People"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-transparent"></div>
        {/* Hero Text Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl bg-white p-8 md:p-10 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="h-px w-12"
                  style={{ backgroundColor: "#042B19" }}
                ></div>
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#042B19" }}
                >
                  WHO WE ARE
                </span>
              </div>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal leading-tight mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Our people power our success. And the growth starts
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section - Our People */}
      <section className="relative w-full bg-white py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Text Content */}
            <div className="flex flex-col justify-center">
              {/* Breadcrumbs/Navigation */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-12 bg-[#042B19]"></div>
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#042B19" }}
                >
                  WHO WE ARE
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal leading-tight mb-8"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Our people power our success. And the growth starts
              </h1>
            </div>

            {/* Right Column - Image */}
            <div className="flex flex-col">
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
                <Image
                  src="/about1.webp"
                  alt="Innovation and Solutions"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg transition hover:scale-110"
                    style={{ backgroundColor: "#ffcf0B" }}
                    aria-label="Watch Now"
                  >
                    <Play
                      className="w-8 h-8 md:w-10 md:h-10 text-gray-900 ml-1"
                      fill="currentColor"
                    />
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-normal leading-tight mb-4"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  Today&apos;s ideas are tomorrow&apos;s solutions.
                </h2>
                <p
                  className="text-base md:text-lg lg:text-xl leading-relaxed"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  To evolve our industry for the future, we continually ask what
                  we can do next. Our best ideas come when we anticipate
                  customer needs, embrace the freedom to explore, and stay
                  nimble to leverage new opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Culture Section */}
      <section className="relative w-full bg-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Text Content */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-[#042B19]"></div>
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#042B19" }}
                >
                  SAFETY
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal leading-tight mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                This is what a safety culture looks like.
              </h2>
              <p
                className="text-base md:text-lg lg:text-xl leading-relaxed mb-8"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                At Invenergy, our people take care of each other. And our
                owner&apos;s mindset means we operate every site as if it were
                our own – and all of that starts with safety. Every Invenergy
                Services employee receives 73 hours of safety training annually,
                totaling more than 56,170 hours of fleet-wide safety training
                each year.
              </p>
              <Link
                href="/safety"
                className="inline-block bg-[#ffcf0B] text-gray-900 font-bold px-8 lg:px-12 py-4 lg:py-5 text-sm md:text-base uppercase tracking-wide transition hover:opacity-90"
                style={{ borderRadius: "0", maxWidth: "fit-content" }}
              >
                LEARN MORE ABOUT SAFETY
              </Link>
            </div>

            {/* Right Side - Circular Image */}
            <div className="relative w-full aspect-square max-w-[600px] mx-auto">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/img4.webp"
                  alt="Safety Culture - Wind Farm Workers"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diversity & Inclusion Section */}
      <section className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#042B19" }}
        >
          {/* Curved Lines Pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 1200 600"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 Q300,50 600,100 T1200,100"
              stroke="#E8F5F0"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M0,200 Q300,150 600,200 T1200,200"
              stroke="#E8F5F0"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M0,300 Q300,250 600,300 T1200,300"
              stroke="#E8F5F0"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M0,400 Q300,350 600,400 T1200,400"
              stroke="#E8F5F0"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M0,500 Q300,450 600,500 T1200,500"
              stroke="#E8F5F0"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <p
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-relaxed mb-8"
              style={{
                color: "#ffffff",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              We believe that our colleagues power Invenergy&apos;s success and
              our innovative solutions are generated by the diversity of ideas
              and perspectives that are shared by employees who bring their
              whole self to work.
            </p>
            <p
              className="text-lg md:text-xl lg:text-2xl leading-relaxed"
              style={{
                color: "#ffffff",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Fostering an environment where diverse perspectives are sought and
              everyone feels included enables our employees to grow to their
              full potential.
            </p>
          </div>
        </div>
      </section>

      {/* Employee Growth Section */}
      <section className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-screen bg-[#E8F5F0] overflow-hidden">
        <Image
          src="/employ-chart.png"
          alt="Employee Growth Chart"
          fill
          className="object-contain sm:object-cover"
          priority
        />
      </section>

      {/* Roadmap Section */}
      <section className="relative w-full bg-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-16 text-center"
              style={{ color: "#042B19" }}
            >
              Crown Bankers Roadmap (2022 – 2028)
            </h2>

            {/* Timeline Container */}
            <div className="relative">
              {/* Vertical Timeline Line */}
              <div
                className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: "#042B19", opacity: 0.2 }}
              ></div>

              <div className="space-y-12 md:space-y-16">
                {/* 2022 */}
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="md:w-32 flex-shrink-0 flex items-start">
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                        style={{ backgroundColor: "#E8F5F0" }}
                      >
                        <div
                          className="text-xl md:text-2xl lg:text-3xl font-bold"
                          style={{ color: "#042B19" }}
                        >
                          2022
                        </div>
                      </div>
                      <div
                        className="hidden md:block w-8 h-0.5"
                        style={{ backgroundColor: "#042B19" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#E8F5F0] p-6 md:p-8 rounded-lg">
                    <h3
                      className="text-xl md:text-2xl lg:text-3xl font-bold mb-4"
                      style={{ color: "#042B19" }}
                    >
                      A Dream Takes Shape
                    </h3>
                    <p
                      className="text-base md:text-lg lg:text-xl leading-relaxed"
                      style={{
                        color: "#042B19",
                        fontFamily: "var(--font-font4), sans-serif",
                      }}
                    >
                      Conceptualized Crown Bankers as a bridge between renewable
                      energy and financial solutions. Built the foundation for a
                      global platform focused on sustainable finance.
                    </p>
                  </div>
                </div>

                {/* 2023 */}
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="md:w-32 flex-shrink-0 flex items-start">
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                        style={{ backgroundColor: "#E8F5F0" }}
                      >
                        <div
                          className="text-xl md:text-2xl lg:text-3xl font-bold"
                          style={{ color: "#042B19" }}
                        >
                          2023
                        </div>
                      </div>
                      <div
                        className="hidden md:block w-8 h-0.5"
                        style={{ backgroundColor: "#042B19" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#E8F5F0] p-6 md:p-8 rounded-lg">
                    <h3
                      className="text-xl md:text-2xl lg:text-3xl font-bold mb-4"
                      style={{ color: "#042B19" }}
                    >
                      Laying the Foundation
                    </h3>
                    <p
                      className="text-base md:text-lg lg:text-xl leading-relaxed"
                      style={{
                        color: "#042B19",
                        fontFamily: "var(--font-font4), sans-serif",
                      }}
                    >
                      Registered our website domain. Broke ground on our first
                      solar plant, marking our entry into the renewable energy
                      sector and global expansion.
                    </p>
                  </div>
                </div>

                {/* 2024 */}
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="md:w-32 flex-shrink-0 flex items-start">
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                        style={{ backgroundColor: "#E8F5F0" }}
                      >
                        <div
                          className="text-xl md:text-2xl lg:text-3xl font-bold"
                          style={{ color: "#042B19" }}
                        >
                          2024
                        </div>
                      </div>
                      <div
                        className="hidden md:block w-8 h-0.5"
                        style={{ backgroundColor: "#042B19" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#E8F5F0] p-6 md:p-8 rounded-lg">
                    <h3
                      className="text-xl md:text-2xl lg:text-3xl font-bold mb-4"
                      style={{ color: "#042B19" }}
                    >
                      A Year of Transformation
                    </h3>
                    <p
                      className="text-base md:text-lg lg:text-xl leading-relaxed"
                      style={{
                        color: "#042B19",
                        fontFamily: "var(--font-font4), sans-serif",
                      }}
                    >
                      Completed first solar plant. Registered in New Zealand and
                      the UK. Opened new corporate office and launching the
                      mobile app soon.
                    </p>
                  </div>
                </div>

                {/* 2025 */}
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="md:w-32 flex-shrink-0 flex items-start">
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                        style={{ backgroundColor: "#E8F5F0" }}
                      >
                        <div
                          className="text-xl md:text-2xl lg:text-3xl font-bold"
                          style={{ color: "#042B19" }}
                        >
                          2025
                        </div>
                      </div>
                      <div
                        className="hidden md:block w-8 h-0.5"
                        style={{ backgroundColor: "#042B19" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#E8F5F0] p-6 md:p-8 rounded-lg">
                    <h3
                      className="text-xl md:text-2xl lg:text-3xl font-bold mb-4"
                      style={{ color: "#042B19" }}
                    >
                      Global Expansion & Second Solar Plant
                    </h3>
                    <p
                      className="text-base md:text-lg lg:text-xl leading-relaxed"
                      style={{
                        color: "#042B19",
                        fontFamily: "var(--font-font4), sans-serif",
                      }}
                    >
                      Opened second plant in Groningen, Netherlands. Expanding
                      registrations to additional countries and hosting global
                      events.
                    </p>
                  </div>
                </div>

                {/* 2026 */}
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="md:w-32 flex-shrink-0 flex items-start">
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                        style={{ backgroundColor: "#E8F5F0" }}
                      >
                        <div
                          className="text-xl md:text-2xl lg:text-3xl font-bold"
                          style={{ color: "#042B19" }}
                        >
                          2026
                        </div>
                      </div>
                      <div
                        className="hidden md:block w-8 h-0.5"
                        style={{ backgroundColor: "#042B19" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#E8F5F0] p-6 md:p-8 rounded-lg">
                    <h3
                      className="text-xl md:text-2xl lg:text-3xl font-bold mb-4"
                      style={{ color: "#042B19" }}
                    >
                      Pioneering the Future
                    </h3>
                    <p
                      className="text-base md:text-lg lg:text-xl leading-relaxed"
                      style={{
                        color: "#042B19",
                        fontFamily: "var(--font-font4), sans-serif",
                      }}
                    >
                      Begin manufacturing EV and solar components. Expansion to
                      over 30 countries and AI-driven efficiency solutions.
                    </p>
                  </div>
                </div>

                {/* 2027 */}
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="md:w-32 flex-shrink-0 flex items-start">
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                        style={{ backgroundColor: "#E8F5F0" }}
                      >
                        <div
                          className="text-xl md:text-2xl lg:text-3xl font-bold"
                          style={{ color: "#042B19" }}
                        >
                          2027
                        </div>
                      </div>
                      <div
                        className="hidden md:block w-8 h-0.5"
                        style={{ backgroundColor: "#042B19" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#E8F5F0] p-6 md:p-8 rounded-lg">
                    <h3
                      className="text-xl md:text-2xl lg:text-3xl font-bold mb-4"
                      style={{ color: "#042B19" }}
                    >
                      Smart Technology & Clean Mobility
                    </h3>
                    <p
                      className="text-base md:text-lg lg:text-xl leading-relaxed"
                      style={{
                        color: "#042B19",
                        fontFamily: "var(--font-font4), sans-serif",
                      }}
                    >
                      Deploy AI-powered energy tracking. Launch EV Charging
                      Stations and expand into autonomous driving tech.
                    </p>
                  </div>
                </div>

                {/* 2028 */}
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="md:w-32 flex-shrink-0 flex items-start">
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                        style={{ backgroundColor: "#042B19" }}
                      >
                        <div
                          className="text-xl md:text-2xl lg:text-3xl font-bold"
                          style={{ color: "#ffffff" }}
                        >
                          2028
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex-1 bg-[#E8F5F0] p-6 md:p-8 rounded-lg border-2"
                    style={{ borderColor: "#042B19" }}
                  >
                    <h3
                      className="text-xl md:text-2xl lg:text-3xl font-bold mb-4"
                      style={{ color: "#042B19" }}
                    >
                      Global Leader in Sustainable Finance & Energy
                    </h3>
                    <p
                      className="text-base md:text-lg lg:text-xl leading-relaxed"
                      style={{
                        color: "#042B19",
                        fontFamily: "var(--font-font4), sans-serif",
                      }}
                    >
                      Operate 100+ solar plants worldwide. Fully integrated
                      smart grids and financial technology innovation
                      leadership.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Model Section */}
      <section className="relative w-full bg-[#E8F5F0] py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-12 text-center"
              style={{ color: "#042B19" }}
            >
              Our Diversified Revenue Model
            </h2>
            <p
              className="text-base md:text-lg lg:text-xl leading-relaxed mb-12 text-center"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              We operate a diversified multi-industry company generating revenue
              across solar energy, EV investments, and crypto assets.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Solar Energy */}
              <div className="bg-white p-8 md:p-10">
                <h3
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: "#042B19" }}
                >
                  Solar Energy
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="h-px bg-[#042B19] mb-3"></div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-4xl md:text-5xl lg:text-6xl font-bold"
                        style={{ color: "#042B19" }}
                      >
                        $9M+
                      </span>
                      <span
                        className="text-base md:text-lg"
                        style={{ color: "#042B19" }}
                      >
                        annually
                      </span>
                    </div>
                    <p
                      className="text-sm md:text-base mt-2"
                      style={{ color: "#042B19", opacity: 0.8 }}
                    >
                      Generated by our solar farms
                    </p>
                  </div>
                </div>
              </div>

              {/* EV Investments */}
              <div className="bg-white p-8 md:p-10">
                <h3
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: "#042B19" }}
                >
                  EV Investments
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="h-px bg-[#042B19] mb-3"></div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-4xl md:text-5xl lg:text-6xl font-bold"
                        style={{ color: "#042B19" }}
                      >
                        15%–35%
                      </span>
                    </div>
                    <p
                      className="text-sm md:text-base mt-2"
                      style={{ color: "#042B19", opacity: 0.8 }}
                    >
                      Profit margins from EV and Forbes-listed investments
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white p-8 md:p-10">
                <h3
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: "#042B19" }}
                >
                  Total Revenue
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="h-px bg-[#042B19] mb-3"></div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-4xl md:text-5xl lg:text-6xl font-bold"
                        style={{ color: "#042B19" }}
                      >
                        $290M+
                      </span>
                    </div>
                    <p
                      className="text-sm md:text-base mt-2"
                      style={{ color: "#042B19", opacity: 0.8 }}
                    >
                      Yearly revenue with stable daily payouts of 1.5%–2.4% to
                      users
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full bg-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal mb-8"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Join us in building the energy future.
            </h2>
            <Link
              href="/careers"
              className="inline-block bg-[#ffcf0B] text-gray-900 font-bold px-8 lg:px-12 py-4 lg:py-5 text-sm md:text-base uppercase tracking-wide transition hover:opacity-90"
              style={{ borderRadius: "0" }}
            >
              VIEW CAREERS
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
