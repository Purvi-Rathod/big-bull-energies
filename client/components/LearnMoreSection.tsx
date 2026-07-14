"use client";

import Link from "next/link";
import {
  BookOpen,
  TrendingUp,
  Users,
  Network,
  Award,
  DollarSign,
  HelpCircle,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";

export default function LearnMoreSection() {
  const learningResources = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "How Platform Works",
      description:
        "Complete step-by-step guide to understanding the Big Bull Energies platform, from registration to earning.",
      href: "/how-platform-works",
      color: "#05627C",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Investment Plans",
      description:
        "Explore our investment packages, ROI rates, and understand how daily returns work.",
      href: "/our-plan",
      color: "#05627C",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "How to Start",
      description:
        "New to Big Bull Energies? Learn how to create an account, make your first investment, and begin earning.",
      href: "/how-to-start",
      color: "#05627C",
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: "Binary System",
      description:
        "Understand how the binary tree structure works and how to maximize your binary income.",
      href: "/binary-investment-system",
      color: "#05627C",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Career Rewards",
      description:
        "Unlock exclusive rewards, bonuses, and recognition as you progress through career levels.",
      href: "/career-rewards",
      color: "#05627C",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Earning Methods",
      description:
        "Learn about ROI, referral income, binary bonuses, and all the ways you can earn.",
      href: "/our-plan",
      color: "#05627C",
    },
    {
      icon: <HelpCircle className="w-8 h-8" />,
      title: "FAQ & Support",
      description:
        "Find answers to common questions and get help from our support team.",
      href: "/support",
      color: "#05627C",
    },
    {
      icon: <ImageIcon className="w-8 h-8" />,
      title: "Gallery",
      description:
        "View photos and videos of our solar plants, office spaces, and events.",
      href: "/gallery",
      color: "#05627C",
    },
  ];

  return (
    <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div
                className="h-px w-8 sm:w-12"
                style={{ backgroundColor: "#05627C" }}
              ></div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "#05627C" }}
              >
                LEARN MORE
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal leading-tight mb-4 sm:mb-6 px-2"
              style={{
                color: "#05627C",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Everything You Need to Know
            </h2>
            <p
              className="text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto px-2"
              style={{
                color: "#05627C",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Comprehensive guides and resources to help you understand how Big
              Bull Energies works and maximize your earning potential.
            </p>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {learningResources.map((resource, index) => (
              <Link
                key={index}
                href={resource.href}
                className="group bg-[#E8F5F0] p-6 sm:p-8 rounded-lg border-2 transition-all hover:shadow-xl hover:-translate-y-1"
                style={{ borderColor: "#05627C" }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="flex-shrink-0 p-3 rounded-lg transition-transform group-hover:scale-110"
                    style={{ backgroundColor: "#05627C", color: "#ffffff" }}
                  >
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 group-hover:underline"
                      style={{ color: "#05627C" }}
                    >
                      {resource.title}
                    </h3>
                  </div>
                </div>
                <p
                  className="text-sm sm:text-base leading-relaxed mb-4"
                  style={{
                    color: "#05627C",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  {resource.description}
                </p>
                <div
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "#05627C" }}
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Additional Quick Links */}
          <div className="mt-12 sm:mt-16 text-center">
            <p
              className="text-sm sm:text-base md:text-lg mb-6"
              style={{ color: "#05627C" }}
            >
              Quick Links:
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {[
                { label: "Referral Income", href: "/referral-income" },
                { label: "Daily ROI Payouts", href: "/daily-roi-payouts" },
                { label: "Career Levels", href: "/career-levels-info" },
                { label: "Voucher System", href: "/voucher-system" },
              ].map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 rounded-lg transition hover:bg-[#E8F5F0] text-sm sm:text-base font-medium"
                  style={{ borderColor: "#05627C", color: "#05627C" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
