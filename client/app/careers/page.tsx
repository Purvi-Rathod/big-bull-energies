"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, Users, TrendingUp, Award } from "lucide-react";
import Footer from "@/components/Footer";

export default function CareersPage() {
  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Growth Opportunities",
      description: "Join a fast-growing company with opportunities for career advancement and professional development.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaborative Culture",
      description: "Work with a diverse team of professionals who are passionate about renewable energy and innovation.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Competitive Benefits",
      description: "Enjoy competitive salaries, health insurance, retirement plans, and other comprehensive benefits.",
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Meaningful Work",
      description: "Make a positive impact on the environment while building a rewarding career in renewable energy.",
    },
  ];

  const openPositions = [
    {
      title: "Business Development Manager",
      department: "Sales & Business Development",
      location: "Remote / Hybrid",
      type: "Full-time",
    },
    {
      title: "Investment Analyst",
      department: "Finance & Investments",
      location: "Remote / Hybrid",
      type: "Full-time",
    },
    {
      title: "Software Engineer",
      department: "Technology",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Customer Success Specialist",
      department: "Customer Service",
      location: "Remote",
      type: "Full-time",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "156px" }}>
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src="/CTA.webp"
          alt="Careers at Crown Bankers"
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
                  CAREERS
                </span>
              </div>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal leading-tight mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Join us in building the energy future.
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                At Crown Bankers, innovation is driven by a unique array of ideas and perspectives. Our growing team is dedicated to empowering the world with secure, reliable energy solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Why Work With Us
            </h2>
            <p className="text-lg text-gray-600">
              We offer a supportive work environment where your ideas matter and your career can flourish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-8 border border-gray-200 hover:shadow-lg transition-shadow"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div
                  className="mb-4"
                  style={{ color: "#042B19" }}
                >
                  {benefit.icon}
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: "#042B19" }}
                >
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
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
                Open Positions
              </h2>
              <p className="text-lg text-gray-600">
                Explore current opportunities to join our team.
              </p>
            </div>

            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <div
                  key={index}
                  className="bg-white p-6 border border-gray-200 hover:shadow-md transition-shadow"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: "#042B19" }}
                      >
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>{position.department}</span>
                        <span>•</span>
                        <span>{position.location}</span>
                        <span>•</span>
                        <span>{position.type}</span>
                      </div>
                    </div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white transition hover:opacity-90 uppercase text-sm"
                      style={{ backgroundColor: "#042B19" }}
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">
                Don't see a position that matches your skills? We're always looking for talented individuals.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-white transition hover:opacity-90 uppercase text-sm"
                style={{ backgroundColor: "#042B19" }}
              >
                Get in Touch
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-gray-50 p-12 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
            <h2
              className="text-3xl md:text-4xl font-normal mb-4"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Ready to Make an Impact?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join Crown Bankers and be part of a team that's transforming the future of renewable energy and financial solutions.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#ffcf0B] text-gray-900 font-bold px-8 py-4 transition hover:opacity-90 uppercase text-sm"
              style={{ borderRadius: "0" }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
