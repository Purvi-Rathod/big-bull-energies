"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Award,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Trophy,
  Crown,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function CareerRewardsPage() {
  const careerLevels = [
    {
      level: "Bronze",
      icon: "🥉",
      requirements:
        "Direct referrals: 5+ | Team size: 25+ | Total volume: $50,000+",
      rewards: [
        "5% bonus on team performance",
        "Priority customer support",
        "Monthly training sessions",
        "Bronze badge recognition",
      ],
      color: "#CD7F32",
    },
    {
      level: "Silver",
      icon: "🥈",
      requirements:
        "Direct referrals: 15+ | Team size: 100+ | Total volume: $200,000+",
      rewards: [
        "7% bonus on team performance",
        "Exclusive webinars",
        "Quarterly bonuses",
        "Silver badge recognition",
        "Early access to new features",
      ],
      color: "#C0C0C0",
    },
    {
      level: "Gold",
      icon: "🥇",
      requirements:
        "Direct referrals: 30+ | Team size: 300+ | Total volume: $500,000+",
      rewards: [
        "10% bonus on team performance",
        "Annual luxury retreat invitation",
        "Personal account manager",
        "Gold badge recognition",
        "VIP event access",
        "Higher binary capping",
      ],
      color: "#FFD700",
    },
    {
      level: "Platinum",
      icon: "💎",
      requirements:
        "Direct referrals: 50+ | Team size: 750+ | Total volume: $1,500,000+",
      rewards: [
        "12% bonus on team performance",
        "International conference invitations",
        "Dedicated support team",
        "Platinum badge recognition",
        "Exclusive investment opportunities",
        "Maximum binary capping",
        "Profit sharing opportunities",
      ],
      color: "#E5E4E2",
    },
    {
      level: "Diamond",
      icon: "💠",
      requirements:
        "Direct referrals: 100+ | Team size: 2,000+ | Total volume: $5,000,000+",
      rewards: [
        "15% bonus on team performance",
        "Luxury car or equivalent reward",
        "Executive mentorship program",
        "Diamond badge recognition",
        "Co-founder benefits",
        "Unlimited binary capping",
        "Equity participation",
        "Global recognition",
      ],
      color: "#B9F2FF",
    },
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Performance Bonuses",
      description:
        "Earn additional percentage bonuses based on your team's total performance and volume.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Recognition & Badges",
      description:
        "Get recognized with exclusive badges and status symbols visible on your profile.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Exclusive Events",
      description:
        "Access to VIP events, conferences, training sessions, and networking opportunities.",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Higher Earnings",
      description:
        "Unlock higher binary capping limits and additional income streams as you progress.",
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
                CAREER REWARDS
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-tight mb-4 sm:mb-6 px-2"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Unlock Your Potential with Career Rewards
            </h1>
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-2"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              As you build your network and grow your team, unlock exclusive
              rewards, bonuses, and recognition at each career level.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Overview */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-10 md:mb-12 text-center px-2"
              style={{ color: "#042B19" }}
            >
              What You Get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-[#E8F5F0] p-6 sm:p-8 rounded-lg text-center"
                >
                  <div
                    className="flex justify-center mb-4"
                    style={{ color: "#042B19" }}
                  >
                    {benefit.icon}
                  </div>
                  <h3
                    className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4"
                    style={{ color: "#042B19" }}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={{
                      color: "#042B19",
                      fontFamily: "var(--font-font4), sans-serif",
                    }}
                  >
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Career Levels */}
      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2"
                style={{ color: "#042B19" }}
              >
                Career Levels
              </h2>
              <p
                className="text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto px-2"
                style={{ color: "#042B19" }}
              >
                Progress through five career levels, each unlocking greater
                rewards and opportunities.
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {careerLevels.map((level, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg border-2 overflow-hidden"
                  style={{ borderColor: "#042B19" }}
                >
                  <div className="p-6 sm:p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 mb-6">
                      <div
                        className="text-6xl sm:text-7xl md:text-8xl"
                        style={{ color: level.color }}
                      >
                        {level.icon}
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3"
                          style={{ color: "#042B19" }}
                        >
                          {level.level} Level
                        </h3>
                        <p
                          className="text-sm sm:text-base md:text-lg font-semibold mb-2"
                          style={{ color: "#042B19" }}
                        >
                          Requirements:
                        </p>
                        <p
                          className="text-xs sm:text-sm md:text-base mb-4"
                          style={{ color: "#042B19", opacity: 0.8 }}
                        >
                          {level.requirements}
                        </p>
                      </div>
                    </div>

                    <div
                      className="border-t-2 pt-6"
                      style={{ borderColor: "#042B19", opacity: 0.2 }}
                    >
                      <h4
                        className="text-lg sm:text-xl md:text-2xl font-bold mb-4"
                        style={{ color: "#042B19" }}
                      >
                        Rewards & Benefits:
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {level.rewards.map((reward, rewardIndex) => (
                          <li
                            key={rewardIndex}
                            className="flex items-start gap-2 sm:gap-3"
                          >
                            <Star
                              className="w-5 h-5 flex-shrink-0 mt-0.5"
                              style={{ color: level.color }}
                            />
                            <span
                              className="text-sm sm:text-base"
                              style={{ color: "#042B19" }}
                            >
                              {reward}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Progress */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-center px-2"
              style={{ color: "#042B19" }}
            >
              How to Progress
            </h2>
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-[#E8F5F0] p-6 sm:p-8 rounded-lg">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: "#042B19" }}
                >
                  1. Build Your Direct Referrals
                </h3>
                <p
                  className="text-sm sm:text-base md:text-lg leading-relaxed"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  Focus on bringing quality investors directly under you. Each
                  direct referral counts toward your career level requirements.
                </p>
              </div>

              <div className="bg-[#E8F5F0] p-6 sm:p-8 rounded-lg">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: "#042B19" }}
                >
                  2. Grow Your Team
                </h3>
                <p
                  className="text-sm sm:text-base md:text-lg leading-relaxed"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  Help your referrals build their own networks. Your total team
                  size includes all members in your downline, creating
                  exponential growth opportunities.
                </p>
              </div>

              <div className="bg-[#E8F5F0] p-6 sm:p-8 rounded-lg">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: "#042B19" }}
                >
                  3. Increase Total Volume
                </h3>
                <p
                  className="text-sm sm:text-base md:text-lg leading-relaxed"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  The total investment volume from your entire team determines
                  your eligibility. Higher team investments unlock higher career
                  levels.
                </p>
              </div>

              <div className="bg-[#E8F5F0] p-6 sm:p-8 rounded-lg">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: "#042B19" }}
                >
                  4. Maintain Active Status
                </h3>
                <p
                  className="text-sm sm:text-base md:text-lg leading-relaxed"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  Keep your investments active and continue building your
                  network. Career levels are reviewed regularly, and maintaining
                  activity ensures you keep your benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full bg-[#042B19] py-12 sm:py-16 md:py-20 lg:py-24 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Crown
              className="w-16 h-16 mx-auto mb-6"
              style={{ color: "#ffcf0B" }}
            />
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2"
              style={{
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Start Your Journey to the Top
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 px-2">
              Join Big Bull Energies today and begin building your network.
              Every referral brings you closer to unlocking exclusive career
              rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-block bg-[#ffcf0B] text-gray-900 font-bold px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm md:text-base uppercase tracking-wide transition hover:opacity-90 text-center"
                style={{ borderRadius: "0" }}
              >
                SIGN UP NOW
              </Link>
              <Link
                href="/career-levels-info"
                className="inline-block bg-transparent border-2 border-white text-white font-bold px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm md:text-base uppercase tracking-wide transition hover:bg-white hover:text-[#042B19] text-center"
                style={{ borderRadius: "0" }}
              >
                LEARN MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
