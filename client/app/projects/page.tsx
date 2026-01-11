"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Sun, Wind, Battery, Wifi } from "lucide-react";
import Footer from "@/components/Footer";

export default function ProjectsPage() {
  const projectTypes = [
    {
      icon: <Sun className="w-10 h-10" />,
      title: "Solar Projects",
      description: "Large-scale solar farms providing clean, renewable electricity to communities and businesses.",
      count: "150+",
      unit: "projects",
      href: "/energy-technologies/solar",
    },
    {
      icon: <Wind className="w-10 h-10" />,
      title: "Wind Projects",
      description: "Onshore and offshore wind farms harnessing wind energy for sustainable power generation.",
      count: "80+",
      unit: "projects",
      href: "/energy-technologies/wind",
    },
    {
      icon: <Battery className="w-10 h-10" />,
      title: "Storage Projects",
      description: "Advanced energy storage solutions enabling reliable renewable energy distribution.",
      count: "45+",
      unit: "projects",
      href: "/energy-technologies/storage",
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Natural Gas",
      description: "Clean natural gas facilities providing efficient and reliable energy solutions.",
      count: "30+",
      unit: "projects",
      href: "/energy-technologies/natural-gas",
    },
    {
      icon: <Wifi className="w-10 h-10" />,
      title: "Transmission",
      description: "Infrastructure projects connecting renewable energy sources to power grids.",
      count: "25+",
      unit: "projects",
      href: "/energy-technologies/transmission",
    },
  ];

  const featuredProjects = [
    {
      name: "Solar Farm Initiative",
      location: "Multiple Locations",
      capacity: "500 MW",
      type: "Solar",
      status: "Operating",
    },
    {
      name: "Wind Energy Complex",
      location: "Coastal Regions",
      capacity: "300 MW",
      type: "Wind",
      status: "In Development",
    },
    {
      name: "Energy Storage Network",
      location: "Strategic Locations",
      capacity: "200 MWh",
      type: "Storage",
      status: "Operating",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "156px" }}>
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src="/hero-solar.webp"
          alt="Crown Bankers Projects"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-transparent"></div>
        {/* Hero Text Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl bg-white p-8 md:p-10 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="h-px w-12"
                  style={{ backgroundColor: "#042B19" }}
                ></div>
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#042B19" }}
                >
                  OUR PROJECTS
                </span>
              </div>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal leading-tight mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Powering the future through innovative energy projects.
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Crown Bankers develops, owns, and operates renewable energy projects across multiple continents, delivering clean energy solutions to communities worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Types Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-normal mb-4"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Our Project Portfolio
            </h2>
            <p className="text-lg text-gray-600">
              Explore our diverse range of renewable energy projects spanning multiple technologies and regions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {projectTypes.map((project, index) => (
              <Link
                key={index}
                href={project.href}
                className="group p-8 border border-gray-200 hover:shadow-lg transition-all"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div
                  className="mb-6 group-hover:scale-110 transition-transform"
                  style={{ color: "#042B19" }}
                >
                  {project.icon}
                </div>
                <div className="mb-4">
                  <span
                    className="text-4xl font-bold block mb-1"
                    style={{ color: "#042B19" }}
                  >
                    {project.count}
                  </span>
                  <span className="text-sm text-gray-600 uppercase">{project.unit}</span>
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: "#042B19" }}
                >
                  {project.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {project.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#042B19" }}>
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-normal mb-4"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Featured Projects
              </h2>
              <p className="text-lg text-gray-600">
                Highlighting some of our most significant renewable energy initiatives.
              </p>
            </div>

            <div className="space-y-6">
              {featuredProjects.map((project, index) => (
                <div
                  key={index}
                  className="bg-white p-8 border border-gray-200 hover:shadow-md transition-shadow"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3
                          className="text-2xl font-semibold"
                          style={{ color: "#042B19" }}
                        >
                          {project.name}
                        </h3>
                        <span
                          className="px-3 py-1 text-xs font-semibold uppercase"
                          style={{
                            backgroundColor: project.status === "Operating" ? "#10b981" : "#f59e0b",
                            color: "#ffffff",
                          }}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-6 text-gray-600">
                        <div>
                          <span className="font-semibold" style={{ color: "#042B19" }}>Location:</span> {project.location}
                        </div>
                        <div>
                          <span className="font-semibold" style={{ color: "#042B19" }}>Capacity:</span> {project.capacity}
                        </div>
                        <div>
                          <span className="font-semibold" style={{ color: "#042B19" }}>Type:</span> {project.type}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{ color: "#042B19" }}
                >
                  330+
                </div>
                <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide">
                  Projects
                </div>
              </div>
              <div>
                <div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{ color: "#042B19" }}
                >
                  4
                </div>
                <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide">
                  Continents
                </div>
              </div>
              <div>
                <div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{ color: "#042B19" }}
                >
                  2,500+
                </div>
                <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide">
                  MW Capacity
                </div>
              </div>
              <div>
                <div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{ color: "#042B19" }}
                >
                  15+
                </div>
                <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide">
                  Years Experience
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-white p-12 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
            <h2
              className="text-3xl md:text-4xl font-normal mb-4"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Interested in Our Projects?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Learn more about our renewable energy projects and investment opportunities. Get in touch to explore how you can be part of the clean energy revolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition hover:opacity-90 uppercase text-sm"
                style={{ backgroundColor: "#042B19" }}
              >
                Contact Us
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/our-plan"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold border transition hover:bg-gray-50 uppercase text-sm"
                style={{ borderColor: "#042B19", color: "#042B19" }}
              >
                View Investment Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
