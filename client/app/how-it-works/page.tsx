'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HowItWorksPage() {
  const { user, admin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (admin || user?.userId === 'CROWN-000000') {
      router.push('/admin/dashboard');
    } else if (user) {
      router.push('/dashboard');
    }
  }, [user, admin, router]);

  const steps = [
    {
      number: "1",
      title: "Create Your Account",
      description: "Sign up for free and get your unique user ID (e.g., CROWN-XXXXXX). No upfront costs or hidden fees.",
      icon: "👤",
      details: [
        "Provide your name, email, and password",
        "Enter your referrer's user ID (optional but recommended)",
        "Get instant access to your dashboard"
      ]
    },
    {
      number: "2",
      title: "Choose Your Investment Plan",
      description: "Browse our range of investment packages, each with different returns, durations, and minimum investment amounts.",
      icon: "📦",
      details: [
        "View all available packages with detailed information",
        "See total output percentage, duration, and terms",
        "Select a plan that matches your investment goals"
      ]
    },
    {
      number: "3",
      title: "Make Your Investment",
      description: "Fund your investment wallet and activate your chosen package. Your investment starts earning immediately.",
      icon: "💰",
      details: [
        "Deposit funds to your Investment Wallet via USDT TRC20",
        "Select your package and investment amount",
        "Activate your investment—it starts earning ROI from day one"
      ]
    },
    {
      number: "4",
      title: "Build Your Binary Network",
      description: "Invite people to join your binary tree. Earn referral bonuses on their first investment and binary bonuses as your teams grow.",
      icon: "🌳",
      details: [
        "Share your unique referral link with others",
        "People join your left or right leg based on availability",
        "Build balanced teams for maximum binary bonus earnings"
      ]
    },
    {
      number: "5",
      title: "Earn Multiple Income Streams",
      description: "Start earning from day one through multiple income sources that grow with your network.",
      icon: "💵",
      details: [
        "Daily ROI: Automatic daily returns credited to your ROI wallet",
        "Referral Income: Instant bonuses when your network members invest",
        "Binary Bonuses: Daily matching bonuses when your teams balance",
        "Career Level Rewards: Progressive bonuses as you reach milestones"
      ]
    },
    {
      number: "6",
      title: "Reinvest or Withdraw",
      description: "Convert your earnings into vouchers for reinvestment, or withdraw directly to your USDT TRC20 wallet.",
      icon: "🚀",
      details: [
        "Create vouchers from any income wallet for easy reinvestment",
        "Request withdrawals from ROI, Referral, Binary, or Career Level wallets",
        "Fast, secure withdrawals processed to your crypto wallet"
      ]
    }
  ];

  const incomeStreams = [
    {
      title: "Daily ROI",
      percentage: "Up to 225%",
      description: "Receive daily returns on your investment, automatically calculated and credited to your ROI wallet",
      frequency: "Daily",
      type: "Automated"
    },
    {
      title: "Referral Income",
      percentage: "7% One-Time",
      description: "Get instant referral bonuses when your direct referrals make their first investment",
      frequency: "Immediate",
      type: "One-Time"
    },
    {
      title: "Binary Bonuses",
      percentage: "10% Daily",
      description: "Earn daily matching bonuses when your left and right teams balance each other",
      frequency: "Daily",
      type: "Automated"
    },
    {
      title: "Career Levels",
      percentage: "Progressive",
      description: "Unlock rewards at each career milestone based on your total business volume",
      frequency: "Milestone-Based",
      type: "Reward System"
    }
  ];

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
            How <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">CNEOX</span> Works
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            A simple 6-step process to start earning through our binary investment platform
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative py-12 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute left-12 top-24 w-1 h-full bg-gradient-to-b from-yellow-500 to-yellow-600 opacity-30"></div>
                )}
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex flex-col items-center justify-center text-4xl shadow-xl relative z-10">
                      <div className="text-2xl mb-1">{step.icon}</div>
                      <div className="text-sm font-bold text-white">Step {step.number}</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
                    <h2 className="text-3xl font-bold text-white mb-4">{step.title}</h2>
                    <p className="text-white/80 text-lg mb-6 leading-relaxed">{step.description}</p>
                    <ul className="space-y-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start text-white/70">
                          <svg className="w-5 h-5 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Income Streams Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-black/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Multiple <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Income Streams</span>
            </h2>
            <p className="text-xl text-white/70">
              Earn from four different sources as you build your network
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incomeStreams.map((stream, index) => (
              <div key={index} className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20 hover:bg-white/15 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white">{stream.title}</h3>
                  <span className="px-4 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full text-sm font-semibold">
                    {stream.percentage}
                  </span>
                </div>
                <p className="text-white/70 mb-4 leading-relaxed">{stream.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-white/70">
                    {stream.frequency}
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-white/70">
                    {stream.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Binary Tree Explanation */}
      <section className="relative py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Understanding the Binary System</h2>
            <div className="space-y-6 text-white/80 text-lg leading-relaxed">
              <p>
                CNEOX uses a binary tree structure where each user can have two direct referrals: one on the left 
                and one on the right. This structure creates balanced growth opportunities:
              </p>
              <ul className="space-y-4 ml-6">
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3">•</span>
                  <span><strong className="text-white">Left Leg & Right Leg:</strong> Your network branches into two sides, allowing for organized growth</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3">•</span>
                  <span><strong className="text-white">Matching Bonuses:</strong> When both legs have business volume, you earn binary bonuses daily</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3">•</span>
                  <span><strong className="text-white">Carry Forward:</strong> Unmatched volume carries over to the next day, ensuring nothing is lost</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3">•</span>
                  <span><strong className="text-white">Power Capacity:</strong> Your daily binary bonus is capped based on your active package's power capacity</span>
                </li>
              </ul>
              <p className="pt-4">
                The system is designed to reward balanced network building, encouraging sustainable growth 
                and fair distribution of earnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-yellow-500/20 via-yellow-600/20 to-amber-500/20 backdrop-blur-md rounded-3xl border border-white/20">
            <h2 className="text-4xl font-extrabold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of successful investors and start earning today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg"
              >
                Create Free Account
              </Link>
              <Link
                href="/how-to-start"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-white/20 hover:bg-white/20 transition-all"
              >
                Detailed Getting Started Guide
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