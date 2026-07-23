"use client";

import Link from "next/link";
import { Award, TrendingUp, Users, DollarSign, Star } from "lucide-react";
import Footer from "@/components/Footer";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";

const careerRewards = [
  { number: 1, rank: "BUILDER", businessBothSides: "$20,000", cashReward: "$200" },
  { number: 2, rank: "LEADER", businessBothSides: "$60,000", cashReward: "$600" },
  { number: 3, rank: "DIRECTOR", businessBothSides: "$180,000", cashReward: "$2,000" },
  { number: 4, rank: "SENIOR DIRECTOR", businessBothSides: "$450,000", cashReward: "$6,000" },
  { number: 5, rank: "EXECUTIVE", businessBothSides: "$1,000,000", cashReward: "$15,000" },
  { number: 6, rank: "GLOBAL EXEC", businessBothSides: "$2,500,000", cashReward: "$40,000" },
  { number: 7, rank: "PRESIDENT", businessBothSides: "$6,000,000", cashReward: "$120,000" },
  { number: 8, rank: "CHAIRMAN", businessBothSides: "$15,000,000", cashReward: "$350,000" },
  { number: 9, rank: "CROWN ELITE", businessBothSides: "$40,000,000", cashReward: "$1,000,000" },
];

const benefits = [
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Monthly Rank Rewards",
    description:
      "Leader special rewards are monthly based — activate 10 packages in a month to qualify for rank recognition.",
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Both-Side Business",
    description:
      "Ranks unlock when you achieve the required business volume on both left and right sides of your binary tree.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Exclusive Promotion",
    description:
      "Get 1 × $25 package free with consistent business and weekly experience sharing.",
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Performance Cash",
    description:
      "Earn up to $1,000/month in additional performance-based rewards subject to company review.",
  },
];

export default function CareerRewardsPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[156px]">
      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="h-px w-8 sm:w-12" style={{ backgroundColor: PRIMARY }} />
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: PRIMARY }}
              >
                CAREER REWARDS
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight mb-4 sm:mb-6 px-2"
              style={{ color: PRIMARY }}
            >
              Leader Special Rewards
            </h1>
            <p
              className="text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto px-2"
              style={{ color: PRIMARY }}
            >
              Monthly-based career rewards for leaders who activate 10 packages
              in a month and build balanced business on both sides.
            </p>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 text-center"
              style={{ color: PRIMARY }}
            >
              What You Get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-[#E8F5F0] p-6 sm:p-8 rounded-lg text-center"
                >
                  <div className="flex justify-center mb-4" style={{ color: PRIMARY }}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3" style={{ color: PRIMARY }}>
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: PRIMARY }}>
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
                style={{ color: PRIMARY }}
              >
                Career Rewards
              </h2>
              <p className="text-sm sm:text-base" style={{ color: PRIMARY, opacity: 0.8 }}>
                Leader special rewards (monthly based) — activate 10 packages in
                a month
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[rgba(5,98,124,0.15)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr style={{ backgroundColor: PRIMARY }}>
                      {["Number", "Rank", "Business on Both Sides", "Cash Reward"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wide text-white"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {careerRewards.map((row, i) => (
                      <tr
                        key={row.rank}
                        className={i % 2 === 0 ? "bg-white" : "bg-[#F3FAF7]"}
                      >
                        <td className="px-4 sm:px-6 py-3.5 text-sm font-semibold" style={{ color: PRIMARY }}>
                          {row.number}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-sm font-bold" style={{ color: PRIMARY }}>
                          <span className="inline-flex items-center gap-2">
                            <Star className="w-4 h-4" style={{ color: GOLD }} />
                            {row.rank}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-sm font-semibold" style={{ color: PRIMARY }}>
                          {row.businessBothSides}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-sm font-bold" style={{ color: PRIMARY }}>
                          {row.cashReward}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div
                className="rounded-xl border-2 p-5"
                style={{ borderColor: GOLD, backgroundColor: "#FFFBEA" }}
              >
                <p className="text-sm font-semibold" style={{ color: PRIMARY }}>
                  Get 1 × <span style={{ color: GOLD }}>$25 package</span> free —
                  exclusive promotion for consistent business & weekly experience
                  sharing.
                </p>
              </div>
              <div
                className="rounded-xl border-2 p-5"
                style={{ borderColor: GOLD, backgroundColor: "#FFFBEA" }}
              >
                <p className="text-sm font-semibold" style={{ color: PRIMARY }}>
                  Earn up to <span style={{ color: GOLD }}>$1,000/month</span> —
                  reward is performance-based and subject to company review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: PRIMARY }}>
              Ready to Climb the Ranks?
            </h2>
            <p className="text-sm sm:text-base mb-6" style={{ color: PRIMARY, opacity: 0.75 }}>
              Start investing, build both sides of your team, and unlock Big Bull
              Energies career rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/plans"
                className="inline-flex justify-center px-8 py-3.5 rounded-lg font-bold text-sm"
                style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
              >
                View Investment Plans
              </Link>
              <Link
                href="/career-levels"
                className="inline-flex justify-center px-8 py-3.5 rounded-lg font-bold text-sm border-2"
                style={{ borderColor: PRIMARY, color: PRIMARY }}
              >
                Open Career Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
