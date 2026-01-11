'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import PublicHeader from "@/components/PublicHeader";

export default function DailyROIPayoutsPage() {
  const { user, admin } = useAuth();
  // Removed redirects - allow logged-in users to access this page

  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            Daily <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">ROI Payouts</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Earn consistent daily returns on your investments with transparent, automated calculations
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* What is Daily ROI */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">What is Daily ROI?</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Daily ROI (Return on Investment) is a percentage-based return you earn every day on your active 
              investment packages. Unlike traditional investments that pay at maturity, CROWN distributes returns 
              daily, providing you with consistent passive income throughout your investment period.
            </p>
            <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl mt-6">
              <p className="text-white text-lg font-semibold mb-2">Key Benefits:</p>
              <ul className="space-y-2 text-white/80">
                <li>• Daily payouts credited automatically to your ROI wallet</li>
                <li>• Transparent calculation based on package terms</li>
                <li>• No manual claiming required - fully automated</li>
                <li>• Start earning from day one of your investment</li>
              </ul>
            </div>
          </div>

          {/* How ROI is Calculated */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">How ROI is Calculated</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Our ROI calculation is transparent and based on clear formulas. Here's how it works:
            </p>

            <div className="space-y-6 mt-8">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 1: Calculate Daily ROI Rate</h3>
                <p className="text-white/70 mb-4">
                  First, we determine your daily ROI rate based on your package's total output percentage and duration:
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-400">
                  <div>Daily ROI Rate = (Total Output Percentage ÷ 100) ÷ Duration in Days</div>
                  <div className="mt-3 text-white/70">Example:</div>
                  <div className="mt-1">If Total Output = 225% and Duration = 150 days</div>
                  <div>Daily ROI Rate = (225 ÷ 100) ÷ 150 = 0.015 (1.5% per day)</div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 2: Calculate Daily ROI Amount</h3>
                <p className="text-white/70 mb-4">
                  Your daily ROI amount is calculated by multiplying your investment principal by the daily ROI rate:
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-400">
                  <div>Daily ROI Amount = Principal × Daily ROI Rate</div>
                  <div className="mt-3 text-white/70">Example:</div>
                  <div className="mt-1">If Principal = $1,000 and Daily ROI Rate = 1.5%</div>
                  <div>Daily ROI Amount = $1,000 × 0.015 = $15 per day</div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 3: Split into Cashable and Renewable Portions</h3>
                <p className="text-white/70 mb-4">
                  Each day's ROI is split into two portions (typically 50% each):
                </p>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="font-mono text-sm text-yellow-300 mb-2">
                      <div>Cashable Portion = Daily ROI Amount × Cashable Percentage (e.g., 50%)</div>
                      <div className="mt-2 text-white/70">→ Credited to ROI wallet balance (WITHDRAWABLE)</div>
                    </div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="font-mono text-sm text-yellow-400 mb-2">
                      <div>Renewable Portion = Daily ROI Amount × Renewable Percentage (e.g., 50%)</div>
                      <div className="mt-2 text-white/70">→ Tracked as renewable principal (NON-WITHDRAWABLE)</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 p-4 rounded-lg mt-4">
                    <p className="text-white/80 text-sm">
                      <strong className="text-white">Example:</strong> If Daily ROI = $15 with 50% split<br/>
                      Cashable = $7.50 (you can withdraw) | Renewable = $7.50 (tracked separately)
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 4: Automatic Daily Credit</h3>
                <p className="text-white/70 mb-4">
                  Every day at midnight, the system automatically:
                </p>
                <ul className="space-y-2 text-white/70 ml-6">
                  <li>• Calculates your daily ROI for all active investments</li>
                  <li>• Credits the cashable portion to your ROI wallet balance</li>
                  <li>• Tracks the renewable portion separately</li>
                  <li>• Updates your investment records (days elapsed, days remaining)</li>
                  <li>• Deactivates investments when the duration period ends</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Complete Example */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Complete Example: 150-Day Investment</h2>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Investment Details</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• <strong className="text-white">Investment Amount:</strong> $1,000</li>
                  <li>• <strong className="text-white">Total Output:</strong> 225%</li>
                  <li>• <strong className="text-white">Duration:</strong> 150 days</li>
                  <li>• <strong className="text-white">Renewable Percentage:</strong> 50%</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Daily Calculation</h3>
                <ul className="space-y-2 text-white/80 font-mono text-sm">
                  <li>• Daily ROI Rate = (225 ÷ 100) ÷ 150 = 1.5% per day</li>
                  <li>• Daily ROI Amount = $1,000 × 1.5% = $15</li>
                  <li>• Cashable Portion = $15 × 50% = <strong className="text-yellow-400">$7.50</strong> (withdrawable)</li>
                  <li>• Renewable Portion = $15 × 50% = $7.50 (non-withdrawable)</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">After 150 Days (Complete Investment Period)</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• <strong className="text-white">Total Cashable ROI Earned:</strong> $7.50 × 150 = <strong className="text-yellow-400">$1,125</strong></li>
                  <li>• <strong className="text-white">Total Renewable Principal:</strong> $7.50 × 150 = $1,125 (tracked)</li>
                  <li>• <strong className="text-white">Total ROI Returned:</strong> $2,250 (225% of $1,000)</li>
                  <li>• <strong className="text-white">Net Profit:</strong> $1,250 (after initial $1,000 investment)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Key Features of Daily ROI</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="text-white font-semibold mb-2">Fully Automated</h4>
                  <p className="text-white/70">No manual claiming needed - ROI is calculated and credited automatically every day</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="text-white font-semibold mb-2">Start Earning Day One</h4>
                  <p className="text-white/70">Your investment starts earning ROI immediately from the first day of activation</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="text-white font-semibold mb-2">Transparent Calculations</h4>
                  <p className="text-white/70">All calculations are visible in your dashboard - you can verify every amount</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="text-white font-semibold mb-2">Immediate Access</h4>
                  <p className="text-white/70">Cashable ROI is available in your ROI wallet and can be withdrawn anytime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-8 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-md rounded-2xl border border-yellow-500/30">
            <h2 className="text-3xl font-bold text-white mb-6">Important Notes</h2>
            <ul className="space-y-4 text-white/80 text-lg">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Principal Remains Constant:</strong> Your investment principal does not increase with renewable principal. The principal amount stays the same throughout the investment period.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Daily Calculation Only:</strong> ROI is calculated once per day at midnight. Missing a day means that day's ROI is not credited.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Investment Expiration:</strong> When your investment reaches its duration period (e.g., 150 days), it automatically stops earning ROI and is marked as inactive.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Withdrawable vs Non-Withdrawable:</strong> Only the cashable portion (typically 50%) can be withdrawn. The renewable portion is tracked separately for accounting purposes.</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Start Earning Daily ROI Today</h2>
            <p className="text-white/80 mb-6 text-lg">
              Join CROWN and begin receiving daily returns on your investments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/plans"
                className="px-8 py-3 bg-yellow-500/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-yellow-500/30 hover:bg-yellow-500/20 transition-all"
              >
                View Investment Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-yellow-500/20 mt-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} CROWN. All rights reserved.</p>
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