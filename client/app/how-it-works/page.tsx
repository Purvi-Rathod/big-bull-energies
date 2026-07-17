"use client";

import Link from "next/link";
import {
  CheckCircle,
  ArrowRight,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  Network,
  Award,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Create Your Account",
      description:
        "Sign up for free and get your unique user ID (e.g., BIGBULL-XXXXXX). No upfront costs or hidden fees.",
      icon: <Users className="w-8 h-8" />,
      details: [
        "Provide your name, email, and password",
        "Enter your referrer's user ID (optional but recommended)",
        "Get instant access to your dashboard",
      ],
    },
    {
      number: 2,
      title: "Choose Your Investment Plan",
      description:
        "Browse our range of investment packages, each with different returns, durations, and minimum investment amounts.",
      icon: <TrendingUp className="w-8 h-8" />,
      details: [
        "View all available packages with detailed information",
        "See total output percentage, duration, and terms",
        "Select a plan that matches your investment goals",
      ],
    },
    {
      number: 3,
      title: "Make Your Investment",
      description:
        "Fund your investment wallet and activate your chosen package. Your investment starts earning immediately.",
      icon: <DollarSign className="w-8 h-8" />,
      details: [
        "Deposit funds to your Investment Wallet via USDT TRC20",
        "Select your package and investment amount",
        "Activate your investment—it starts earning ROI from day one",
      ],
    },
    {
      number: 4,
      title: "Build Your Binary Network",
      description:
        "Invite people to join your binary tree. Earn referral bonuses on their first investment and binary bonuses as your teams grow.",
      icon: <Network className="w-8 h-8" />,
      details: [
        "Share your unique referral link with others",
        "People join your left or right leg based on availability",
        "Build balanced teams for maximum binary bonus earnings",
      ],
    },
    {
      number: 5,
      title: "Earn Multiple Income Streams",
      description:
        "Start earning from day one through multiple income sources that grow with your network.",
      icon: <Award className="w-8 h-8" />,
      details: [
        "Daily ROI: Automatic daily returns credited to your ROI wallet",
        "Referral Income: Instant bonuses when your network members invest",
        "Binary Bonuses: Daily matching bonuses when your teams balance",
        "Career Level Rewards: Progressive bonuses as you reach milestones",
      ],
    },
    {
      number: 6,
      title: "Reinvest or Withdraw",
      description:
        "Convert your earnings into vouchers for reinvestment, or withdraw directly to your USDT TRC20 wallet.",
      icon: <Shield className="w-8 h-8" />,
      details: [
        "Create vouchers from any income wallet for easy reinvestment",
        "Request withdrawals from ROI, Referral, Binary, or Career Level wallets",
        "Fast, secure withdrawals processed to your crypto wallet",
      ],
    },
  ];

  const incomeStreams = [
    {
      title: "Daily ROI",
      percentage: "1.5% - 2%",
      description:
        "Earn daily returns on your investment. Calculated and credited automatically every day.",
      example: "Invest $1,000 → Earn $15-20 per day",
    },
    {
      title: "Referral Income",
      percentage: "8% - 10%",
      description:
        "Earn commission when people you refer make investments. No limit on referrals!",
      example: "Refer $5,000 investment → Earn $400-500",
    },
    {
      title: "Binary Income",
      percentage: "10%",
      description:
        "Earn bonuses based on your binary tree structure. Calculated on the smaller leg's volume.",
      example: "Smaller leg: $2,800 → Earn $280 daily",
    },
    {
      title: "Career Levels",
      percentage: "Progressive",
      description:
        "Unlock rewards at each career milestone based on your total business volume.",
      example: "Reach milestones → Unlock exclusive bonuses",
    },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]">
      {/* Hero Section */}
      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div
                className="h-px w-8 sm:w-12"
                style={{ backgroundColor: "#05627C" }}
              ></div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "#05627C" }}
              >
                HOW IT WORKS
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-tight mb-4 sm:mb-6 px-2"
              style={{
                color: "#05627C",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              How Big Bull Energies Works
            </h1>
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-2"
              style={{
                color: "#05627C",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              A simple 6-step process to start earning through our binary
              investment platform
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8 sm:space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-6 sm:gap-8 lg:gap-12 items-center`}
                >
                  <div className="w-full lg:w-1/2">
                    <div className="bg-[#E8F5F0] p-6 sm:p-8 md:p-10 rounded-lg h-full">
                      <div className="flex items-center gap-4 mb-4 sm:mb-6">
                        <div
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg"
                          style={{
                            backgroundColor: "#05627C",
                            color: "#ffffff",
                          }}
                        >
                          {step.number}
                        </div>
                        <div className="flex-1" style={{ color: "#05627C" }}>
                          {step.icon}
                        </div>
                      </div>
                      <h3
                        className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4"
                        style={{ color: "#05627C" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6"
                        style={{
                          color: "#05627C",
                          fontFamily: "var(--font-font4), sans-serif",
                        }}
                      >
                        {step.description}
                      </p>
                      <ul className="space-y-2 sm:space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-start gap-2 sm:gap-3"
                          >
                            <CheckCircle
                              className="w-5 h-5 flex-shrink-0 mt-0.5"
                              style={{ color: "#05627C" }}
                            />
                            <span
                              className="text-sm sm:text-base"
                              style={{ color: "#05627C" }}
                            >
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex flex-col items-center">
                      <ArrowRight
                        className="w-8 h-8 rotate-90 lg:rotate-0"
                        style={{ color: "#05627C" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Income Streams */}
      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-10 md:mb-12 text-center px-2"
              style={{ color: "#05627C" }}
            >
              Four Ways to Earn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {incomeStreams.map((stream, index) => (
                <div
                  key={index}
                  className="bg-white p-6 sm:p-8 rounded-lg border-2 shadow-lg"
                  style={{ borderColor: "#05627C" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-xl sm:text-2xl md:text-3xl font-bold"
                      style={{ color: "#05627C" }}
                    >
                      {stream.title}
                    </h3>
                    <span
                      className="text-lg sm:text-xl md:text-2xl font-bold px-3 sm:px-4 py-1 sm:py-2 rounded"
                      style={{
                        backgroundColor: "#E8F5F0",
                        color: "#05627C",
                      }}
                    >
                      {stream.percentage}
                    </span>
                  </div>
                  <p
                    className="text-sm sm:text-base md:text-lg leading-relaxed mb-4"
                    style={{
                      color: "#05627C",
                      fontFamily: "var(--font-font4), sans-serif",
                    }}
                  >
                    {stream.description}
                  </p>
                  <div className="bg-[#E8F5F0] p-3 sm:p-4 rounded">
                    <p
                      className="text-xs sm:text-sm font-semibold"
                      style={{ color: "#05627C" }}
                    >
                      Example: {stream.example}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Binary Tree Explanation */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div
              className="bg-[#E8F5F0] p-6 sm:p-8 md:p-10 rounded-lg border-2"
              style={{ borderColor: "#05627C" }}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
                style={{ color: "#05627C" }}
              >
                Understanding the Binary System
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <p
                  className="text-sm sm:text-base md:text-lg leading-relaxed"
                  style={{
                    color: "#05627C",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  Big Bull Energies uses a binary tree structure where each user
                  can have two direct referrals: one on the left and one on the
                  right. This structure creates balanced growth opportunities:
                </p>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#05627C" }}
                    />
                    <span
                      className="text-sm sm:text-base"
                      style={{ color: "#05627C" }}
                    >
                      <strong>Left Leg & Right Leg:</strong> Your network
                      branches into two sides, allowing for organized growth
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#05627C" }}
                    />
                    <span
                      className="text-sm sm:text-base"
                      style={{ color: "#05627C" }}
                    >
                      <strong>Matching Bonuses:</strong> When both legs have
                      business volume, you earn binary bonuses daily
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#05627C" }}
                    />
                    <span
                      className="text-sm sm:text-base"
                      style={{ color: "#05627C" }}
                    >
                      <strong>Carry Forward:</strong> Unmatched volume carries
                      over to the next day, ensuring nothing is lost
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#05627C" }}
                    />
                    <span
                      className="text-sm sm:text-base"
                      style={{ color: "#05627C" }}
                    >
                      <strong>Binary Capping:</strong> Your daily binary bonus
                      is capped based on your active package ($1,000 - $10,000
                      per day)
                    </span>
                  </li>
                </ul>
                <p
                  className="pt-4 text-sm sm:text-base md:text-lg leading-relaxed"
                  style={{
                    color: "#05627C",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  The system is designed to reward balanced network building,
                  encouraging sustainable growth and fair distribution of
                  earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full bg-[#05627C] py-12 sm:py-16 md:py-20 lg:py-24 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2"
              style={{
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 px-2">
              Join thousands of successful investors and start earning today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-block bg-[#ffcf0B] text-gray-900 font-bold px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm md:text-base uppercase tracking-wide transition hover:opacity-90 text-center"
                style={{ borderRadius: "0" }}
              >
                CREATE ACCOUNT
              </Link>
              <Link
                href="/how-to-start"
                className="inline-block bg-transparent border-2 border-white text-white font-bold px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm md:text-base uppercase tracking-wide transition hover:bg-white hover:text-[#05627C] text-center"
                style={{ borderRadius: "0" }}
              >
                GETTING STARTED GUIDE
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
