"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  ArrowRight,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  Network,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function HowPlatformWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Registration & Account Setup",
      description:
        "Create your free Big Bull Energies account in minutes. Get your unique user ID and access your personal dashboard.",
      icon: <Users className="w-8 h-8" />,
      details: [
        "Sign up with your email and personal details",
        "Receive your unique user ID (CROWN-XXXXXX)",
        "Access your dashboard immediately",
        "Get your personal referral link",
      ],
    },
    {
      number: 2,
      title: "Fund Your Investment Wallet",
      description:
        "Deposit funds using USDT TRC20 cryptocurrency. Your investment wallet is secure and ready for package purchases.",
      icon: <DollarSign className="w-8 h-8" />,
      details: [
        "Use USDT TRC20 for secure transactions",
        "Minimum deposit: $25",
        "Instant wallet funding",
        "Secure blockchain technology",
      ],
    },
    {
      number: 3,
      title: "Choose Your Investment Package",
      description:
        "Select from three investment tiers: Solar Starter, Power Growth, or Elite Energy. Each offers different returns and benefits.",
      icon: <TrendingUp className="w-8 h-8" />,
      details: [
        "Solar Starter: $25 - $4,999 (1.5% daily ROI)",
        "Power Growth: $5,000 - $49,999 (1.75% daily ROI)",
        "Elite Energy: $50,000+ (2% daily ROI)",
        "Compare packages and choose your fit",
      ],
    },
    {
      number: 4,
      title: "Activate Your Investment",
      description:
        "Once you select a package, your investment starts earning immediately. Daily ROI begins accruing from day one.",
      icon: <Clock className="w-8 h-8" />,
      details: [
        "Investment activates instantly",
        "Daily ROI credited automatically",
        "Bond period: 180-200 days",
        "Track progress in real-time",
      ],
    },
    {
      number: 5,
      title: "Build Your Network",
      description:
        "Share your referral link and invite others to join. Build your binary tree structure and earn multiple income streams.",
      icon: <Network className="w-8 h-8" />,
      details: [
        "Share your unique referral link",
        "Earn 8-10% referral commission",
        "Build left and right binary legs",
        "Earn binary bonuses daily",
      ],
    },
    {
      number: 6,
      title: "Earn Multiple Income Streams",
      description:
        "Generate income from daily ROI, referral commissions, binary bonuses, and principal returns. Multiple ways to earn!",
      icon: <DollarSign className="w-8 h-8" />,
      details: [
        "Daily ROI: 1.5% - 2% per day",
        "Referral Income: 8% - 10% commission",
        "Binary Income: 10% of smaller leg",
        "Principal Return: 60% - 100% at maturity",
      ],
    },
    {
      number: 7,
      title: "Track & Withdraw Earnings",
      description:
        "Monitor all your earnings in your dashboard. Withdraw funds to your USDT TRC20 wallet whenever you're ready.",
      icon: <Shield className="w-8 h-8" />,
      details: [
        "Real-time earnings dashboard",
        "Detailed reports and analytics",
        "Secure withdrawal process",
        "USDT TRC20 wallet transfers",
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
      title: "Principal Return",
      percentage: "60% - 100%",
      description:
        "Get a percentage of your original investment back at bond maturity. Higher tiers = better returns.",
      example: "Invest $10,000 → Get $6,000-10,000 back",
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
                style={{ backgroundColor: "#042B19" }}
              ></div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "#042B19" }}
              >
                HOW IT WORKS
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-tight mb-4 sm:mb-6 px-2"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              How the Big Bull Energies Platform Works
            </h1>
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-2"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              A comprehensive guide to understanding our investment platform,
              earning methods, and how to maximize your returns.
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-10 md:mb-12 text-center px-2"
              style={{ color: "#042B19" }}
            >
              The Complete Process
            </h2>
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
                            backgroundColor: "#042B19",
                            color: "#ffffff",
                          }}
                        >
                          {step.number}
                        </div>
                        <div className="flex-1" style={{ color: "#042B19" }}>
                          {step.icon}
                        </div>
                      </div>
                      <h3
                        className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4"
                        style={{ color: "#042B19" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6"
                        style={{
                          color: "#042B19",
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
                              style={{ color: "#042B19" }}
                            />
                            <span
                              className="text-sm sm:text-base"
                              style={{ color: "#042B19" }}
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
                        style={{ color: "#042B19" }}
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
              style={{ color: "#042B19" }}
            >
              Four Ways to Earn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {incomeStreams.map((stream, index) => (
                <div
                  key={index}
                  className="bg-white p-6 sm:p-8 rounded-lg border-2 shadow-lg"
                  style={{ borderColor: "#042B19" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-xl sm:text-2xl md:text-3xl font-bold"
                      style={{ color: "#042B19" }}
                    >
                      {stream.title}
                    </h3>
                    <span
                      className="text-lg sm:text-xl md:text-2xl font-bold px-3 sm:px-4 py-1 sm:py-2 rounded"
                      style={{
                        backgroundColor: "#E8F5F0",
                        color: "#042B19",
                      }}
                    >
                      {stream.percentage}
                    </span>
                  </div>
                  <p
                    className="text-sm sm:text-base md:text-lg leading-relaxed mb-4"
                    style={{
                      color: "#042B19",
                      fontFamily: "var(--font-font4), sans-serif",
                    }}
                  >
                    {stream.description}
                  </p>
                  <div className="bg-[#E8F5F0] p-3 sm:p-4 rounded">
                    <p
                      className="text-xs sm:text-sm font-semibold"
                      style={{ color: "#042B19" }}
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

      {/* Key Features */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-10 md:mb-12 text-center px-2"
              style={{ color: "#042B19" }}
            >
              Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {[
                "Secure USDT TRC20 transactions",
                "Real-time earnings dashboard",
                "Automated daily ROI payouts",
                "Binary tree visualization",
                "Career level progression",
                "Comprehensive reporting",
                "24/7 customer support",
                "Mobile-responsive platform",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle
                    className="w-6 h-6 flex-shrink-0"
                    style={{ color: "#042B19" }}
                  />
                  <span
                    className="text-sm sm:text-base md:text-lg"
                    style={{ color: "#042B19" }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full bg-[#042B19] py-12 sm:py-16 md:py-20 lg:py-24 text-white text-center">
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
              Join thousands of investors already earning with Big Bull
              Energies. Start your journey today!
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
                href="/our-plan"
                className="inline-block bg-transparent border-2 border-white text-white font-bold px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm md:text-base uppercase tracking-wide transition hover:bg-white hover:text-[#042B19] text-center"
                style={{ borderRadius: "0" }}
              >
                VIEW PLANS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
