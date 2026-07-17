'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import PublicHeader from "@/components/PublicHeader";

export default function ReferralIncomePage() {
  const { user, admin } = useAuth();
  // Removed redirects - allow logged-in users to access this page

  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            Referral <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Income</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Earn instant bonuses when your network members make their first investment
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-#05627C">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* What is Referral Income */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">What is Referral Income?</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Referral income is a one-time bonus you receive when someone you directly referred to BIG BULL makes 
              their first investment. This instant reward recognizes your role in expanding the BIG BULL community 
              and compensates you immediately for bringing new members to the platform.
            </p>
            <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl mt-6">
              <p className="text-white text-lg font-semibold mb-2">Key Features:</p>
              <ul className="space-y-2 text-white/80">
                <li>• Instant payment when your referral makes their first investment</li>
                <li>• Typically 7% of the investment amount (varies by package)</li>
                <li>• One-time bonus per referral (only on first investment)</li>
                <li>• Credited directly to your Referral Wallet</li>
                <li>• Fully withdrawable - no restrictions</li>
              </ul>
            </div>
          </div>

          {/* How It Works */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">How Referral Income Works</h2>
            
            <div className="space-y-6 mt-8">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 1: Share Your Referral Link</h3>
                <p className="text-white/70 mb-4">
                  After signing up, you receive a unique referral link in your dashboard. Share this link with 
                  friends, family, or anyone interested in joining BIG BULL.
                </p>
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-yellow-400 font-mono text-sm">
                    Your Referral Link: https://cneox.com/signup?ref=BIGBULL-XXXXXX
                  </p>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 2: Someone Joins Using Your Link</h3>
                <p className="text-white/70 mb-4">
                  When someone clicks your referral link and signs up, they become your direct referral. 
                  You are listed as their referrer in the system.
                </p>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 3: They Make Their First Investment</h3>
                <p className="text-white/70 mb-4">
                  When your referral activates their first investment package, the system automatically calculates 
                  your referral bonus:
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-400">
                  <div>Referral Bonus = Investment Amount × Referral Percentage (e.g., 7%)</div>
                  <div className="mt-3 text-white/70">Example:</div>
                  <div className="mt-1">If your referral invests $1,000 with 7% referral rate:</div>
                  <div>Your Bonus = $1,000 × 7% = <strong className="text-yellow-400">$70</strong></div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 4: Instant Payment</h3>
                <p className="text-white/70 mb-4">
                  Your referral bonus is credited immediately to your Referral Wallet. There's no waiting - 
                  you receive your reward as soon as their investment is activated.
                </p>
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 p-4 rounded-lg mt-4">
                  <p className="text-white text-sm">
                    <strong>Note:</strong> Referral bonuses are paid only on the first investment. If your 
                    referral invests again later, you won't receive another referral bonus for those subsequent 
                    investments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Real Examples</h2>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Example 1: Single Referral</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• You refer John using your referral link</li>
                  <li>• John signs up and invests $1,000 in his first package</li>
                  <li>• Referral rate: 7%</li>
                  <li>• Your referral bonus: $1,000 × 7% = <strong className="text-yellow-400">$70</strong></li>
                  <li>• Bonus credited instantly to your Referral Wallet</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Example 2: Multiple Referrals</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• You refer 5 people: Alice ($500), Bob ($1,000), Carol ($2,000), David ($500), Eve ($1,500)</li>
                  <li>• Each makes their first investment</li>
                  <li>• Referral rate: 7% for all</li>
                  <li>• Your total referral income:</li>
                  <li className="ml-6">- Alice: $500 × 7% = $35</li>
                  <li className="ml-6">- Bob: $1,000 × 7% = $70</li>
                  <li className="ml-6">- Carol: $2,000 × 7% = $140</li>
                  <li className="ml-6">- David: $500 × 7% = $35</li>
                  <li className="ml-6">- Eve: $1,500 × 7% = $105</li>
                  <li>• <strong className="text-yellow-400">Total: $385 in referral bonuses</strong></li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Example 3: Subsequent Investments</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• You refer Sarah, and she invests $1,000 (first investment)</li>
                  <li>• You receive: $1,000 × 7% = <strong className="text-yellow-400">$70</strong> referral bonus</li>
                  <li>• Later, Sarah invests $5,000 in another package</li>
                  <li>• You receive: <strong className="text-yellow-400">$0</strong> (referral bonus only on first investment)</li>
                  <li>• However, Sarah's $5,000 investment adds to your binary business volume, helping you earn binary bonuses</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important Rules */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Important Rules</h2>
            <div className="space-y-4">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">One-Time Payment Only</h3>
                <p className="text-white/70">
                  Referral bonuses are paid only when your referral makes their <strong className="text-white">first</strong> investment. 
                  Subsequent investments by the same person do not generate additional referral bonuses.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-500 mb-2">Direct Referrals Only</h3>
                <p className="text-white/70">
                  You only earn referral bonuses from people you directly referred. If your referral refers someone else, 
                  that person becomes your referral's referral, not yours. You won't receive a bonus for their investments.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Package-Specific Rates</h3>
                <p className="text-white/70">
                  The referral percentage may vary by package. Check the package details to see the specific referral 
                  rate before sharing with potential referrals.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Instant Crediting</h3>
                <p className="text-white/70">
                  Unlike binary bonuses and ROI which are calculated daily, referral bonuses are credited immediately 
                  when the investment is activated. There's no waiting period.
                </p>
              </div>
            </div>
          </div>

          {/* Maximizing Referral Income */}
          <div className="p-8 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Tips for Maximizing Referral Income</h2>
            <ul className="space-y-4 text-white/80 text-lg">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">•</span>
                <span><strong className="text-white">Share Your Link Widely:</strong> The more people you refer, the more referral bonuses you can earn. Use social media, email, messaging apps, and word of mouth.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Educate Your Referrals:</strong> Help your referrals understand the platform so they're more likely to invest. The better they understand BIG BULL, the more confident they'll be.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Focus on Quality:</strong> While quantity matters, quality referrals who understand the system and invest meaningfully are more valuable long-term.</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Track Your Network:</strong> Use the Referrals section in your dashboard to see who you've referred and their investment status. Follow up with those who haven't invested yet.</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Start Earning Referral Income Today</h2>
            <p className="text-white/80 mb-6 text-lg">
              Join BIG BULL and get your unique referral link to start building your network
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/how-to-start"
                className="px-8 py-3 bg-yellow-500/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-yellow-500/30 hover:bg-yellow-500/20 transition-all"
              >
                Learn How to Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-yellow-500/20 mt-20 bg-#05627C">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} BIG BULL. All rights reserved.</p>
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