'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VoucherSystemPage() {
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
            Voucher <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">System</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Flexible reinvestment system with 2x multiplier - convert your earnings into investment vouchers
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* What are Vouchers */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">What are Vouchers?</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Vouchers are prepaid credits that you can purchase and use to activate investment packages. 
              The voucher system provides a powerful way to reinvest your earnings with a 2x multiplier, meaning 
              every dollar you put into a voucher unlocks $2 worth of investment value.
            </p>
            <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl mt-6">
              <p className="text-white text-lg font-semibold mb-2">Key Benefits:</p>
              <ul className="space-y-2 text-white/80">
                <li>• <strong className="text-white">2x Multiplier:</strong> $100 voucher = $200 investment value</li>
                <li>• <strong className="text-white">Flexible Creation:</strong> Create vouchers from any income wallet (ROI, Referral, Binary, Career Level)</li>
                <li>• <strong className="text-white">Easy Reinvestment:</strong> Convert earnings into vouchers for seamless portfolio growth</li>
                <li>• <strong className="text-white">120-Day Validity:</strong> Use your vouchers within 120 days of creation</li>
                <li>• <strong className="text-white">Full or Partial Coverage:</strong> Use vouchers to cover all or part of an investment</li>
              </ul>
            </div>
          </div>

          {/* How Vouchers Work */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">How Vouchers Work</h2>
            
            <div className="space-y-6 mt-8">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 1: Create a Voucher</h3>
                <p className="text-white/70 mb-4">
                  You can create vouchers in two ways:
                </p>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-yellow-400 font-semibold mb-2">From Wallet Balance:</p>
                    <ul className="text-white/70 text-sm space-y-1 ml-4">
                      <li>• Select a wallet type (ROI, Referral, Binary, Career Level)</li>
                      <li>• Enter the amount (must meet minimum requirement - typically 50% of minimum investment)</li>
                      <li>• Voucher is created immediately</li>
                      <li>• Funds are deducted from your selected wallet</li>
                    </ul>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-yellow-400 font-semibold mb-2">Via Payment Gateway:</p>
                    <ul className="text-white/70 text-sm space-y-1 ml-4">
                      <li>• Purchase voucher directly using USDT TRC20</li>
                      <li>• Voucher is created after payment confirmation</li>
                      <li>• No wallet balance required</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 2: Voucher Calculation</h3>
                <p className="text-white/70 mb-4">
                  When you create a voucher, the system automatically calculates its investment value:
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-yellow-400">
                  <div>Investment Value = Purchase Amount × Multiplier (2x)</div>
                  <div className="mt-3 text-white/70">Example:</div>
                  <div className="mt-1">If you create a $100 voucher:</div>
                  <div>Investment Value = $100 × 2 = <strong className="text-yellow-400">$200</strong></div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 p-4 rounded-lg mt-4">
                  <p className="text-white text-sm">
                    <strong>Note:</strong> The minimum voucher amount is dynamically set to half of the minimum 
                    investment amount from all active packages. This ensures vouchers are always useful for reinvestment.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 3: Use Voucher in Investment</h3>
                <p className="text-white/70 mb-4">
                  When activating an investment package, you can select a voucher to use:
                </p>
                <ul className="space-y-2 text-white/70 ml-6">
                  <li>• Select a package you want to invest in</li>
                  <li>• Choose your investment amount</li>
                  <li>• Select an active, unused voucher from the dropdown</li>
                  <li>• System calculates remaining amount to pay (if any)</li>
                  <li>• Complete payment for remaining amount (if needed)</li>
                  <li>• Investment activates and voucher is marked as used</li>
                </ul>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 4: Voucher Coverage</h3>
                <p className="text-white/70 mb-4">
                  Vouchers can provide full or partial coverage of an investment:
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm">
                  <div className="text-yellow-400 mb-2">Remaining Amount = Investment Amount - Voucher Investment Value</div>
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Real Examples</h2>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Example 1: Full Coverage</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• You create a $100 voucher → Investment Value = $200</li>
                  <li>• You want to invest $150 in a package</li>
                  <li>• You select your voucher when creating the investment</li>
                  <li>• Voucher covers $150 (full amount)</li>
                  <li>• <strong className="text-yellow-400">Investment activates immediately</strong> - no additional payment needed</li>
                  <li>• Voucher is marked as used (remaining $50 value cannot be used separately)</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Example 2: Partial Coverage</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• You have a $100 voucher → Investment Value = $200</li>
                  <li>• You want to invest $500 in a package</li>
                  <li>• You select your voucher when creating the investment</li>
                  <li>• Voucher covers $200</li>
                  <li>• Remaining amount: $500 - $200 = $300</li>
                  <li>• You pay $300 via payment gateway (USDT TRC20)</li>
                  <li>• <strong className="text-yellow-400">Investment activates after payment confirmation</strong></li>
                  <li>• Voucher is marked as used</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Example 3: Creating from Earnings</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• You have $200 in your ROI Wallet</li>
                  <li>• You want to reinvest for compound growth</li>
                  <li>• You create a $200 voucher from your ROI Wallet</li>
                  <li>• $200 is deducted from ROI Wallet</li>
                  <li>• Voucher created with Investment Value = $400</li>
                  <li>• You can now use this voucher to invest $400 worth in packages</li>
                  <li>• <strong className="text-yellow-400">Your $200 earnings just became $400 investment power!</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Voucher Rules */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Important Voucher Rules</h2>
            <div className="space-y-4">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">2x Multiplier</h3>
                <p className="text-white/70">
                  All vouchers use a 2x multiplier. This means a $100 voucher gives you $200 in investment value. 
                  This multiplier helps maximize your reinvestment potential.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Minimum Amount</h3>
                <p className="text-white/70">
                  The minimum voucher amount is dynamically set to 50% of the minimum investment amount from all 
                  active packages. This ensures vouchers are always useful for reinvestment.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-500 mb-2">120-Day Expiration</h3>
                <p className="text-white/70">
                  Vouchers expire 120 days after creation. Use them before expiration to avoid losing their value. 
                  Expired vouchers cannot be used for investments.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">One-Time Use</h3>
                <p className="text-white/70">
                  Each voucher can only be used once. Once used in an investment, the voucher is marked as "used" 
                  and cannot be reused. However, if a voucher only partially covers an investment, the remaining 
                  value cannot be used separately.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Investment Requirement</h3>
                <p className="text-white/70">
                  When using a voucher, your investment amount must be at least 2x the voucher purchase amount. 
                  This ensures proper voucher utilization.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="p-8 bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Benefits of Using Vouchers</h2>
            <ul className="space-y-4 text-white/80 text-lg">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Compound Growth:</strong> Reinvest your earnings with a 2x multiplier, effectively doubling your investment power</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Flexible Funding:</strong> Create vouchers from any income wallet, making it easy to reinvest different income streams</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Convenience:</strong> Pre-purchase vouchers and use them when ready to invest, without needing immediate payment</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-xl">•</span>
                <span><strong className="text-white">Portfolio Growth:</strong> Systematically reinvest earnings to build a larger investment portfolio</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-3 text-xl">•</span>
                <span><strong className="text-white">Maximize Returns:</strong> Use the 2x multiplier to get more investment value from your earnings</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Start Using Vouchers Today</h2>
            <p className="text-white/80 mb-6 text-lg">
              Join CNEOX and use our voucher system to maximize your reinvestment potential
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
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