'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import PublicHeader from "@/components/PublicHeader";

export default function HowToStartPage() {
  const { user, admin } = useAuth();
  // Removed redirects - allow logged-in users to access this page

  const quickStart = [
    {
      step: "1",
      title: "Sign Up",
      description: "Click 'Sign Up' and fill in your details. You'll receive a unique user ID like CNEOX-XXXXXX.",
      action: "Takes less than 2 minutes"
    },
    {
      step: "2",
      title: "Get Your Referral Link",
      description: "Once registered, go to the Referrals section to get your unique referral link. Share it with others to build your network.",
      action: "Available immediately after signup"
    },
    {
      step: "3",
      title: "Fund Your Investment Wallet",
      description: "Add funds to your Investment Wallet using USDT TRC20. This is where you'll use funds to purchase investment packages.",
      action: "Secure crypto payment"
    },
    {
      step: "4",
      title: "Choose & Activate a Package",
      description: "Browse available packages, select one that fits your budget, and activate your investment. It starts earning ROI immediately.",
      action: "Starts earning from day one"
    },
    {
      step: "5",
      title: "Build Your Network",
      description: "Share your referral link, invite others to join, and watch your binary tree grow. Earn referral bonuses when they invest.",
      action: "Start earning referral income"
    },
    {
      step: "6",
      title: "Monitor & Withdraw",
      description: "Track your earnings in your dashboard, view detailed reports, and withdraw to your USDT TRC20 wallet whenever you're ready.",
      action: "Withdrawals processed securely"
    }
  ];

  const tips = [
    {
      icon: "💡",
      title: "Start with a Referrer",
      description: "Having a referrer helps you get started faster and provides you with a support system. Use someone's referral link or user ID when signing up."
    },
    {
      icon: "📊",
      title: "Understand the Packages",
      description: "Each package has different terms: total output percentage, duration, minimum investment, and power capacity. Choose based on your goals."
    },
    {
      icon: "⚖️",
      title: "Balance Your Teams",
      description: "For maximum binary bonuses, aim to build balanced left and right teams. The system rewards balanced growth."
    },
    {
      icon: "🔄",
      title: "Reinvest with Vouchers",
      description: "Convert your earnings into vouchers for easy reinvestment. Vouchers use a 2x multiplier, maximizing your investment potential."
    },
    {
      icon: "📈",
      title: "Track Your Progress",
      description: "Use the Reports section to monitor all your income sources: ROI, referrals, binary bonuses, and career level rewards."
    },
    {
      icon: "🎯",
      title: "Set Clear Goals",
      description: "Define what you want to achieve: daily passive income, network growth, or career level milestones. Set targets and track progress."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            How to <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Start</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Your complete guide to getting started with CNEOX and maximizing your earning potential
          </p>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="relative py-12 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-4">Quick Start Guide</h2>
            <p className="text-xl text-white/70">
              Follow these 6 simple steps to begin your CNEOX journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickStart.map((item, index) => (
              <div key={index} className="relative p-6 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20 hover:bg-white/15 transition-all">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 mt-2">{item.title}</h3>
                <p className="text-white/70 mb-4 leading-relaxed">{item.description}</p>
                <div className="px-3 py-1 bg-yellow-500/10 rounded-full inline-block">
                  <span className="text-yellow-400 text-sm font-medium">{item.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-black/30 to-transparent">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-4">Detailed Steps</h2>
            <p className="text-xl text-white/70">
              Everything you need to know to get started successfully
            </p>
          </div>

          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Step 1: Create Your Account</h3>
            <p className="text-white/80 mb-4 leading-relaxed">
              Visit our signup page and provide the following information:
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li>• Your full name</li>
              <li>• Email address (used for account identification)</li>
              <li>• Secure password</li>
              <li>• Referrer's User ID (optional but recommended)</li>
            </ul>
            <p className="text-white/80 mt-4 leading-relaxed">
              Once registered, you'll receive your unique User ID in the format CNEOX-XXXXXX. 
              This ID is your identity on the platform.
            </p>
          </div>

          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Step 2: Set Up Payment Information</h3>
            <p className="text-white/80 mb-4 leading-relaxed">
              Before you can invest or withdraw, you need to set up your USDT TRC20 wallet address:
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li>• Go to your Dashboard or Profile</li>
              <li>• Click "Setup Payment Information"</li>
              <li>• Enter your USDT TRC20 wallet address (must start with 'T')</li>
              <li>• Save your wallet address securely</li>
            </ul>
            <p className="text-white/80 mt-4 leading-relaxed">
              This address will be used for all deposits and withdrawals. Make sure it's correct!
            </p>
          </div>

          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Step 3: Fund Your Investment Wallet</h3>
            <p className="text-white/80 mb-4 leading-relaxed">
              Add funds to your Investment Wallet to purchase packages:
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li>• Check the minimum investment amount for available packages</li>
              <li>• Send USDT TRC20 to the platform's deposit address</li>
              <li>• Wait for confirmation (usually within minutes)</li>
              <li>• Funds will appear in your Investment Wallet</li>
            </ul>
          </div>

          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Step 4: Choose and Activate a Package</h3>
            <p className="text-white/80 mb-4 leading-relaxed">
              Browse available packages in the Plans section:
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li>• Review each package's total output percentage, duration, and minimum investment</li>
              <li>• Select a package that matches your investment goals</li>
              <li>• Choose your investment amount (must meet minimum requirements)</li>
              <li>• Activate the package - ROI starts accruing immediately</li>
            </ul>
            <p className="text-white/80 mt-4 leading-relaxed">
              Your investment will earn daily ROI for the duration of the package (e.g., 150 days).
            </p>
          </div>

          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Step 5: Build Your Network</h3>
            <p className="text-white/80 mb-4 leading-relaxed">
              Start earning referral income by inviting others:
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li>• Go to the Referrals section to get your unique referral link</li>
              <li>• Share your link with others via social media, email, or messaging</li>
              <li>• When someone signs up using your link, they join your binary tree</li>
              <li>• Earn 7% referral bonus when they make their first investment</li>
            </ul>
            <p className="text-white/80 mt-4 leading-relaxed">
              Focus on building balanced left and right teams for maximum binary bonus earnings.
            </p>
          </div>

          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Step 6: Monitor & Optimize</h3>
            <p className="text-white/80 mb-4 leading-relaxed">
              Use your dashboard and reports to track progress:
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li>• Check your Dashboard for wallet balances and quick stats</li>
              <li>• View detailed Reports for all income sources</li>
              <li>• Monitor your Binary Tree to see network growth</li>
              <li>• Track Career Level progress for milestone rewards</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tips for Success */}
      <section className="relative py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Tips for <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Success</span>
            </h2>
            <p className="text-xl text-white/70">
              Expert advice to maximize your earnings on CNEOX
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="p-6 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20 hover:bg-white/15 transition-all">
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{tip.title}</h3>
                <p className="text-white/70 leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-yellow-500/20 via-yellow-600/20 to-amber-500/20 backdrop-blur-md rounded-3xl border border-white/20">
            <h2 className="text-4xl font-extrabold text-white mb-6">Ready to Begin Your Journey?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join CNEOX today and start building your financial future
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg"
              >
                Sign Up Now - It's Free
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-white/20 hover:bg-white/20 transition-all"
              >
                Learn More About How It Works
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