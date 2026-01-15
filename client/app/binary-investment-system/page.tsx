"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function BinaryInvestmentSystemPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]">
      {/* Hero Section */}
      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="h-px w-8 sm:w-12" style={{ backgroundColor: "#042B19" }}></div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "#042B19" }}
              >
                BINARY INVESTMENT SYSTEM
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-tight mb-4 sm:mb-6 px-2"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Binary Investment System
            </h1>
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-2"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Advanced matching algorithms that reward balanced network growth and maximize your earning potential
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* What is Binary System */}
            <div className="p-8 sm:p-10 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                What is the Binary System?
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                The Binary Investment System is the core structure of CROWN, designed to reward users for building 
                balanced networks. Unlike traditional MLM structures, the binary system focuses on two legs (left and right), 
                creating a fair and sustainable compensation model.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-6 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: "#042B19" }}
                  >
                    Left Leg
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    One branch of your binary tree where referrals are placed when joining your network. 
                    Business volume from left leg referrals accumulates separately.
                  </p>
                </div>
                <div className="p-6 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: "#042B19" }}
                  >
                    Right Leg
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    The other branch of your binary tree. Building a balanced left and right leg is key to 
                    maximizing your binary bonus earnings.
                  </p>
                </div>
              </div>
            </div>

            {/* How Binary Bonuses Work */}
            <div className="p-8 sm:p-10 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                How Binary Bonuses Work
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                Binary bonuses are calculated daily through our automated system. When your left and right teams 
                have business volume, the system matches them and pays you a percentage of the matched amount.
              </p>

              <div className="space-y-6 mt-8">
                <div className="p-6 bg-gray-50 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#042B19" }}
                  >
                    Step 1: Business Volume Accumulation
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    When someone in your network (direct or indirect downline) activates an investment package, 
                    the investment amount is added to your business volume in the appropriate leg (left or right).
                  </p>
                  <div className="bg-white p-4 border border-gray-200 font-mono text-sm" style={{ borderColor: "#E5E7EB", color: "#042B19" }}>
                    <div>Left Business Volume = Sum of all investments in your left leg</div>
                    <div>Right Business Volume = Sum of all investments in your right leg</div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#042B19" }}
                  >
                    Step 2: Daily Matching Calculation
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Every day at midnight, our system calculates available volume from both legs, including any 
                    carry forward from previous days:
                  </p>
                  <div className="bg-white p-4 border border-gray-200 font-mono text-sm" style={{ borderColor: "#E5E7EB", color: "#042B19" }}>
                    <div>Available Left = Left Carry Forward + (Left Business - Left Matched)</div>
                    <div>Available Right = Right Carry Forward + (Right Business - Right Matched)</div>
                    <div className="mt-2" style={{ color: "#042B19" }}>Matched Amount = Minimum(Available Left, Available Right)</div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#042B19" }}
                  >
                    Step 3: Power Capacity Cap
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    The matched amount is capped based on your active package's power capacity to ensure sustainable 
                    bonus distribution:
                  </p>
                  <div className="bg-white p-4 border border-gray-200 font-mono text-sm" style={{ borderColor: "#E5E7EB", color: "#042B19" }}>
                    <div>Capped Matched = Minimum(Matched Amount, Power Capacity)</div>
                    <div className="mt-2 text-gray-600">Example: If matched = $5,000 and power capacity = $1,000, then capped = $1,000</div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#042B19" }}
                  >
                    Step 4: Binary Bonus Calculation
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Your binary bonus is calculated as a percentage of the capped matched amount (typically 10%):
                  </p>
                  <div className="bg-white p-4 border border-gray-200 font-mono text-sm" style={{ borderColor: "#E5E7EB", color: "#042B19" }}>
                    <div>Binary Bonus = Capped Matched × Binary Percentage (e.g., 10%)</div>
                    <div className="mt-2 text-gray-600">Example: $1,000 × 10% = $100 daily binary bonus</div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#042B19" }}
                  >
                    Step 5: Carry Forward
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Any unmatched volume carries forward to the next day, ensuring nothing is lost:
                  </p>
                  <div className="bg-white p-4 border border-gray-200 font-mono text-sm" style={{ borderColor: "#E5E7EB", color: "#042B19" }}>
                    <div>New Left Carry = Available Left - Capped Matched</div>
                    <div>New Right Carry = Available Right - Capped Matched</div>
                    <div className="mt-2 text-gray-600">This carry forward is available for matching the next day</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Scenario */}
            <div className="p-8 sm:p-10 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Real Example
              </h2>
              <div className="space-y-6">
                <div className="p-6 bg-[#E8F5F0] border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#042B19" }}
                  >
                    Day 1 Scenario
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Your left leg referral invests $100 → Left Business = $100</li>
                    <li>• Your right leg referral invests $500 → Right Business = $500</li>
                    <li>• Available Left = $100, Available Right = $500</li>
                    <li>• Matched Amount = $100 (minimum of $100 and $500)</li>
                    <li>• Binary Bonus = $100 × 10% = <strong style={{ color: "#042B19" }}>$10</strong></li>
                    <li>• Right Carry Forward = $500 - $100 = $400</li>
                  </ul>
                </div>

                <div className="p-6 bg-[#E8F5F0] border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#042B19" }}
                  >
                    Day 2 Scenario
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Another left leg referral invests $400 → Left Business = $500</li>
                    <li>• Available Left = $0 carry + ($500 - $100 matched) = $400</li>
                    <li>• Available Right = $400 carry + ($500 - $0 matched) = $900</li>
                    <li>• Matched Amount = $400 (minimum of $400 and $900)</li>
                    <li>• Binary Bonus = $400 × 10% = <strong style={{ color: "#042B19" }}>$40</strong></li>
                    <li>• New Right Carry Forward = $900 - $400 = $500</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="p-8 sm:p-10 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Key Features of Our Binary System
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" style={{ color: "#042B19" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4
                      className="font-semibold mb-2"
                      style={{ color: "#042B19" }}
                    >
                      Daily Automatic Calculations
                    </h4>
                    <p className="text-gray-600">Bonuses calculated and credited automatically every day at midnight</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" style={{ color: "#042B19" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4
                      className="font-semibold mb-2"
                      style={{ color: "#042B19" }}
                    >
                      Nothing is Lost
                    </h4>
                    <p className="text-gray-600">Unmatched volume carries forward indefinitely until matched</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" style={{ color: "#042B19" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4
                      className="font-semibold mb-2"
                      style={{ color: "#042B19" }}
                    >
                      Cumulative Business Volume
                    </h4>
                    <p className="text-gray-600">Business volume never decreases, creating long-term earning potential</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0" style={{ color: "#042B19" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4
                      className="font-semibold mb-2"
                      style={{ color: "#042B19" }}
                    >
                      Fair & Transparent
                    </h4>
                    <p className="text-gray-600">All calculations are transparent and verifiable in your dashboard</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips for Success */}
            <div className="p-8 sm:p-10 bg-[#E8F5F0] border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-6"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Tips for Maximizing Binary Bonuses
              </h2>
              <ul className="space-y-4 text-gray-700 text-base sm:text-lg">
                <li className="flex items-start">
                  <span className="mr-3 text-xl" style={{ color: "#042B19" }}>•</span>
                  <span><strong style={{ color: "#042B19" }}>Focus on Balance:</strong> Work to build both your left and right legs equally. Balanced teams maximize your matching opportunities.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl" style={{ color: "#042B19" }}>•</span>
                  <span><strong style={{ color: "#042B19" }}>Quality Over Quantity:</strong> Help your team members succeed. When they invest more, your business volume grows faster.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl" style={{ color: "#042B19" }}>•</span>
                  <span><strong style={{ color: "#042B19" }}>Monitor Your Tree:</strong> Regularly check your binary tree structure to understand your network's growth pattern.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl" style={{ color: "#042B19" }}>•</span>
                  <span><strong style={{ color: "#042B19" }}>Power Capacity Awareness:</strong> Your daily binary bonus is capped by your package's power capacity. Consider upgrading packages for higher caps.</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center p-8 sm:p-10 bg-gray-50 border border-gray-200" style={{ borderColor: "#E5E7EB" }}>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-4"
                style={{
                  color: "#042B19",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Ready to Start Earning Binary Bonuses?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                Join CROWN and start building your balanced binary network today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-block bg-[#ffcf0B] text-gray-900 font-bold px-6 sm:px-8 py-3 sm:py-4 transition hover:opacity-90 uppercase text-sm sm:text-base"
                  style={{ borderRadius: "0" }}
                >
                  Get Started Free
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-block bg-transparent border-2 text-gray-900 font-bold px-6 sm:px-8 py-3 sm:py-4 transition hover:bg-[#042B19] hover:text-white uppercase text-sm sm:text-base"
                  style={{ borderColor: "#042B19", color: "#042B19", borderRadius: "0" }}
                >
                  Learn More About CROWN
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
