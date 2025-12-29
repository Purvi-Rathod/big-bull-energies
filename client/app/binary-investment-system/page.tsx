'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BinaryInvestmentSystemPage() {
  const { user, admin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (admin || user?.userId === 'CROWN-000000') {
      router.push('/admin/dashboard');
    } else if (user) {
      router.push('/dashboard');
    }
  }, [user, admin, router]);

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 backdrop-blur-md bg-black/90 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo1.png"
              alt="CNEOX Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-white hover:text-yellow-400 transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg hover:shadow-yellow-500/50 font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            Binary <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Investment System</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Advanced matching algorithms that reward balanced network growth and maximize your earning potential
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* What is Binary System */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">What is the Binary System?</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              The Binary Investment System is the core structure of CNEOX, designed to reward users for building 
              balanced networks. Unlike traditional MLM structures, the binary system focuses on two legs (left and right), 
              creating a fair and sustainable compensation model.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Left Leg</h3>
                <p className="text-white/70">
                  One branch of your binary tree where referrals are placed when joining your network. 
                  Business volume from left leg referrals accumulates separately.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-500 mb-3">Right Leg</h3>
                <p className="text-white/70">
                  The other branch of your binary tree. Building a balanced left and right leg is key to 
                  maximizing your binary bonus earnings.
                </p>
              </div>
            </div>
          </div>

          {/* How Binary Bonuses Work */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">How Binary Bonuses Work</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Binary bonuses are calculated daily through our automated system. When your left and right teams 
              have business volume, the system matches them and pays you a percentage of the matched amount.
            </p>

            <div className="space-y-6 mt-8">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 1: Business Volume Accumulation</h3>
                <p className="text-white/70 mb-4">
                  When someone in your network (direct or indirect downline) activates an investment package, 
                  the investment amount is added to your business volume in the appropriate leg (left or right).
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-400">
                  <div>Left Business Volume = Sum of all investments in your left leg</div>
                  <div>Right Business Volume = Sum of all investments in your right leg</div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 2: Daily Matching Calculation</h3>
                <p className="text-white/70 mb-4">
                  Every day at midnight, our system calculates available volume from both legs, including any 
                  carry forward from previous days:
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-400">
                  <div>Available Left = Left Carry Forward + (Left Business - Left Matched)</div>
                  <div>Available Right = Right Carry Forward + (Right Business - Right Matched)</div>
                  <div className="mt-2 text-yellow-400">Matched Amount = Minimum(Available Left, Available Right)</div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 3: Power Capacity Cap</h3>
                <p className="text-white/70 mb-4">
                  The matched amount is capped based on your active package's power capacity to ensure sustainable 
                  bonus distribution:
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-300">
                  <div>Capped Matched = Minimum(Matched Amount, Power Capacity)</div>
                  <div className="mt-2 text-white/70">Example: If matched = $5,000 and power capacity = $1,000, then capped = $1,000</div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 4: Binary Bonus Calculation</h3>
                <p className="text-white/70 mb-4">
                  Your binary bonus is calculated as a percentage of the capped matched amount (typically 10%):
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-400">
                  <div>Binary Bonus = Capped Matched × Binary Percentage (e.g., 10%)</div>
                  <div className="mt-2 text-white/70">Example: $1,000 × 10% = $100 daily binary bonus</div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 5: Carry Forward</h3>
                <p className="text-white/70 mb-4">
                  Any unmatched volume carries forward to the next day, ensuring nothing is lost:
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-400">
                  <div>New Left Carry = Available Left - Capped Matched</div>
                  <div>New Right Carry = Available Right - Capped Matched</div>
                  <div className="mt-2 text-white/70">This carry forward is available for matching the next day</div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Scenario */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Real Example</h2>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Day 1 Scenario</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• Your left leg referral invests $100 → Left Business = $100</li>
                  <li>• Your right leg referral invests $500 → Right Business = $500</li>
                  <li>• Available Left = $100, Available Right = $500</li>
                  <li>• Matched Amount = $100 (minimum of $100 and $500)</li>
                  <li>• Binary Bonus = $100 × 10% = <strong className="text-yellow-400">$10</strong></li>
                  <li>• Right Carry Forward = $500 - $100 = $400</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Day 2 Scenario</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• Another left leg referral invests $400 → Left Business = $500</li>
                  <li>• Available Left = $0 carry + ($500 - $100 matched) = $400</li>
                  <li>• Available Right = $400 carry + ($500 - $0 matched) = $900</li>
                  <li>• Matched Amount = $400 (minimum of $400 and $900)</li>
                  <li>• Binary Bonus = $400 × 10% = <strong className="text-yellow-400">$40</strong></li>
                  <li>• New Right Carry Forward = $900 - $400 = $500</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Key Features of Our Binary System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="text-white font-semibold mb-2">Daily Automatic Calculations</h4>
                  <p className="text-white/70">Bonuses calculated and credited automatically every day at midnight</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="text-white font-semibold mb-2">Nothing is Lost</h4>
                  <p className="text-white/70">Unmatched volume carries forward indefinitely until matched</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="text-white font-semibold mb-2">Cumulative Business Volume</h4>
                  <p className="text-white/70">Business volume never decreases, creating long-term earning potential</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="text-white font-semibold mb-2">Fair & Transparent</h4>
                  <p className="text-white/70">All calculations are transparent and verifiable in your dashboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips for Success */}
          <div className="p-8 bg-gradient-to-br from-yellow-500/20 via-yellow-600/20 to-amber-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Tips for Maximizing Binary Bonuses</h2>
            <ul className="space-y-4 text-white/80 text-lg">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Focus on Balance:</strong> Work to build both your left and right legs equally. Balanced teams maximize your matching opportunities.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">•</span>
                <span><strong className="text-white">Quality Over Quantity:</strong> Help your team members succeed. When they invest more, your business volume grows faster.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Monitor Your Tree:</strong> Regularly check your binary tree structure to understand your network's growth pattern.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Power Capacity Awareness:</strong> Your daily binary bonus is capped by your package's power capacity. Consider upgrading packages for higher caps.</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-gradient-to-br from-yellow-500/20 via-yellow-600/20 to-amber-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning Binary Bonuses?</h2>
            <p className="text-white/80 mb-6 text-lg">
              Join CNEOX and start building your balanced binary network today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-3 bg-yellow-500/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-yellow-500/30 hover:bg-yellow-500/20 transition-all"
              >
                Learn More About CNEOX
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-yellow-500/20 mt-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} CNEOX. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/about-us" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/policy" className="hover:text-white transition-colors">Privacy & Terms</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}