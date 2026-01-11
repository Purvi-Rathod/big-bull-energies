"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export default function LeadershipPage() {
  const leaders = [
    {
      id: 1,
      name: "Adrian Cadiz",
      title: "Chief Executive Officer",
      description:
        "With nearly two decades of experience in marketing, business operations, and strategic growth, Adrian Cadiz leads Crown Bankers as CEO. His expertise extends to the renewable energy sector, where he has played a key role in integrating financial solutions with solar and EV projects. Under his leadership, Crown Bankers continues to drive innovation, efficiency, and expansion across all operations.",
      image: "/leader1.jpg",
    },
    {
      id: 2,
      name: "Edward Barrington",
      title: "Chief Marketing Officer (CMO)",
      description:
        "As the Chief Marketing Officer, Edward Barrington oversees all marketing initiatives at Crown Bankers. His expertise in brand development and market expansion plays a crucial role in growing the company's global presence.",
      image: "/leader2.png",
    },
    {
      id: 3,
      name: "Anee Sandrova",
      title: "Relationship Manager (RM)",
      description:
        "Anee Sandrova manages relations and operations in the Netherlands, particularly overseeing the Crown Bankers solar plant in Groningen. Her role ensures seamless coordination and development of our renewable energy projects.",
      image: "/leader3.png",
    },
    {
      id: 4,
      name: "Sophie Taylor",
      title: "Chief Financial Officer (CFO)",
      description:
        "Sophie Taylor and her team handle the financial strategies at Crown Bankers, making critical decisions on investments and resource allocation. Her expertise ensures sustainable financial growth and stability.",
      image: "/leader4.png",
    },
    {
      id: 5,
      name: "Joseph Carter",
      title: "Director of Operations",
      description:
        "Joseph Carter leads the administrative division, handling user inquiries and ensuring smooth internal operations. His dedication to efficiency and customer support enhances the overall experience for Crown Bankers members.",
      image: "/leader5.png",
    },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <Image
          src="/about-hero.webp"
          alt="Leadership - Our Team"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-transparent"></div>
        {/* Hero Text Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl bg-white p-6 sm:p-8 md:p-10 lg:p-12">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div
                  className="h-px w-8 sm:w-12"
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
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-tight mb-4 sm:mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Leadership that drives innovation
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 px-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div
                  className="h-px w-8 sm:w-12"
                  style={{ backgroundColor: "#042B19" }}
                ></div>
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#042B19" }}
                >
                  OUR LEADERSHIP
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal leading-tight mb-4 sm:mb-6 px-2"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Unified by our vision. Led by our experience.
              </h2>
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto px-2"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Our leadership team brings decades of combined experience in
                renewable energy, finance, and technology to drive Crown
                Bankers&apos; mission forward.
              </p>
            </div>

            {/* Leaders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {leaders.map((leader) => (
                <div
                  key={leader.id}
                  className="flex flex-col bg-white overflow-hidden border border-gray-200"
                >
                  {/* Leader Image */}
                  <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] overflow-hidden">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover"
                    />
                    {/* Green Banner Overlay */}
                    <div
                      className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 px-2 sm:px-3 py-1"
                      style={{ backgroundColor: "#042B19" }}
                    >
                      <span className="text-xs font-medium uppercase tracking-wide text-white">
                        LEADERSHIP
                      </span>
                    </div>
                    {/* Large Text Overlay */}
                    <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4">
                      <h3
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-1 sm:mb-2"
                        style={{
                          fontFamily: "var(--font-font4), sans-serif",
                          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        }}
                      >
                        {leader.name.split(" ")[0]}
                      </h3>
                      <p
                        className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-white"
                        style={{
                          fontFamily: "var(--font-font4), sans-serif",
                          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        }}
                      >
                        {leader.name.split(" ").slice(1).join(" ")}
                      </p>
                    </div>
                  </div>

                  {/* Leader Info */}
                  <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col bg-white">
                    <h4
                      className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4"
                      style={{ color: "#042B19" }}
                    >
                      {leader.title}
                    </h4>
                    <p
                      className="text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 flex-1"
                      style={{
                        color: "#042B19",
                        fontFamily: "var(--font-font4), sans-serif",
                      }}
                    >
                      {leader.description}
                    </p>
                    {/* Yellow Read Button */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition hover:scale-110 flex-shrink-0"
                        style={{ backgroundColor: "#ffcf0B" }}
                        aria-label="View Profile"
                      >
                        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                      </button>
                      <span
                        className="text-xs sm:text-sm font-medium uppercase tracking-wide"
                        style={{ color: "#042B19" }}
                      >
                        VIEW PROFILE
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Diversity & Inclusion Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center px-2">
            <p
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl leading-relaxed mb-6 sm:mb-8"
              style={{
                color: "#ffffff",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              We believe that our colleagues power Crown Bankers&apos; success
              and our innovative solutions are generated by the diversity of
              ideas and perspectives that are shared by employees who bring
              their whole self to work.
            </p>
            <p
              className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed"
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

      {/* Execution Section */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
              {/* Left Side - Heading and Main Statement */}
              <div className="flex flex-col order-2 lg:order-1">
                <span
                  className="text-xs font-medium uppercase tracking-wide mb-4 sm:mb-6"
                  style={{ color: "#042B19" }}
                >
                  EXECUTION
                </span>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-tight"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  We make good things happen.
                </h2>
              </div>

              {/* Right Side - Description */}
              <div className="flex flex-col order-1 lg:order-2">
                <p
                  className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  As a leading energy developer, we demonstrate our commitment
                  to building relationships with the communities, customers and
                  partners with which we work. To further enhance this
                  commitment, we also encourage our employees to give back to
                  their communities through their volunteer time off.
                </p>
              </div>
            </div>
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

      {/* CTA Section */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center px-2">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal mb-6 sm:mb-8"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Join our mission to transform energy and finance.
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
