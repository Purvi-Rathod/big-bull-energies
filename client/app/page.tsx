'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import PublicHeader from "@/components/PublicHeader";

// ============================================
// SOCIAL MEDIA LINKS - UPDATE THESE VALUES
// ============================================
const WHATSAPP_NUMBER = "1234567890"; // Update with your WhatsApp support number (country code + number, no + or spaces)
const FACEBOOK_PAGE_URL = "https://www.facebook.com/yourpage"; // Update with your Facebook page URL
// ============================================

export default function Home() {
  const { user, admin } = useAuth();

  // Allow logged-in users to visit the landing page
  // Removed automatic redirect - users can navigate freely

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Binary Investment System",
      description: "Advanced binary MLM structure with intelligent matching algorithms for maximum earning potential",
      gradient: "from-yellow-500 to-yellow-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Multiple Investment Plans",
      description: "Choose from various investment packages tailored to your goals with flexible terms and returns",
      gradient: "from-yellow-400 to-yellow-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Daily ROI Payouts",
      description: "Earn consistent daily returns on your investments with transparent, automated calculations",
      gradient: "from-yellow-500 to-amber-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Binary Matching Bonuses",
      description: "Get rewarded daily when your left and right teams balance through our smart matching system",
      gradient: "from-amber-500 to-yellow-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Referral Income",
      description: "Earn instant referral bonuses when your network members make their first investment",
      gradient: "from-yellow-600 to-amber-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: "Career Level System",
      description: "Unlock progressive career levels with increasing rewards and exclusive benefits as you grow",
      gradient: "from-yellow-500 to-amber-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      title: "Voucher System",
      description: "Convert your earnings into vouchers for easy reinvestment and portfolio growth",
      gradient: "from-amber-400 to-yellow-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Easy Withdrawals",
      description: "Fast and secure withdrawal process with multiple payment methods and USDT TRC20 support",
      gradient: "from-yellow-500 to-amber-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Comprehensive Reports",
      description: "Track all your earnings, investments, and network performance with detailed analytics",
      gradient: "from-yellow-400 to-amber-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "24/7 Support Tickets",
      description: "Get instant help with our integrated support ticket system for all your queries",
      gradient: "from-amber-500 to-yellow-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Bank-Level Security",
      description: "Your data and funds are protected with enterprise-grade encryption and security measures",
      gradient: "from-yellow-600 to-amber-700"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Real-Time Calculations",
      description: "Instant updates on earnings, bonuses, and network growth with real-time processing",
      gradient: "from-yellow-500 to-yellow-600"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up & Join",
      description: "Create your free account and get your unique referral ID to start building your network",
      icon: "👤"
    },
    {
      step: "2",
      title: "Choose Investment Plan",
      description: "Select from multiple investment packages that suit your budget and financial goals",
      icon: "📦"
    },
    {
      step: "3",
      title: "Build Your Network",
      description: "Invite people to join your binary tree and earn referral bonuses on their first investment",
      icon: "🌳"
    },
    {
      step: "4",
      title: "Earn Multiple Incomes",
      description: "Get daily ROI, binary bonuses, referral income, and career level rewards automatically",
      icon: "💰"
    },
    {
      step: "5",
      title: "Grow & Withdraw",
      description: "Reinvest through vouchers or withdraw your earnings securely to your wallet",
      icon: "🚀"
    }
  ];

  const benefits = [
    "Multiple Income Streams",
    "Daily Automated Payouts",
    "Transparent Earnings Tracking",
    "Progressive Career Rewards",
    "Secure & Fast Withdrawals",
    "24/7 Customer Support"
  ];

  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover object-center"
            quality={90}
            sizes="100vw"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:py-32 lg:py-40">
          <div className="text-center">
            {/* Animated Logo/Title */}
            <div className="mb-8 animate-fade-in">
              <div className="flex justify-center mb-6">
                <Image
                  src="/logo1.png"
                  alt="CNEOX Logo"
                  width={300}
                  height={100}
                  className="h-24 sm:h-32 lg:h-40 w-auto"
                  priority
                />
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
            </div>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 mb-4 font-light">
              Revolutionary Binary Investment Platform
            </p>
            <p className="text-lg sm:text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Build your network, maximize your earnings, and unlock unlimited potential with our advanced binary system. 
              Earn through multiple income streams including ROI, binary bonuses, referrals, and career levels.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <Link
                href="/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-yellow-500/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto mb-20">
              <div className="text-center p-6 bg-yellow-500/10 backdrop-blur-md rounded-2xl border border-yellow-500/30">
                <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-white/70 text-sm">Support</div>
              </div>
              <div className="text-center p-6 bg-yellow-500/10 backdrop-blur-md rounded-2xl border border-yellow-500/30">
                <div className="text-4xl font-bold text-yellow-500 mb-2">100%</div>
                <div className="text-white/70 text-sm">Transparent</div>
              </div>
              <div className="text-center p-6 bg-yellow-500/10 backdrop-blur-md rounded-2xl border border-yellow-500/30">
                <div className="text-4xl font-bold text-yellow-400 mb-2">Auto</div>
                <div className="text-white/70 text-sm">Payouts</div>
              </div>
              <div className="text-center p-6 bg-yellow-500/10 backdrop-blur-md rounded-2xl border border-yellow-500/30">
                <div className="text-4xl font-bold text-yellow-600 mb-2">∞</div>
                <div className="text-white/70 text-sm">Potential</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional visual effects removed - hero image provides the background */}
      </main>

      {/* Features Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"> Maximum Earnings</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to build wealth through our advanced binary investment platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20 hover:bg-yellow-500/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 text-black group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/30`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              How It <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Start earning in 5 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-500 opacity-50"></div>

            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-xl shadow-yellow-500/50 group-hover:scale-110 transition-transform relative z-10">
                    {step.icon}
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-500/30 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    {step.step}
                  </div>
                  <div className="p-6 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20 hover:bg-yellow-500/10 transition-all">
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                Why Choose
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"> CNEOX?</span>
              </h2>
              <p className="text-xl text-white/70 mb-8 leading-relaxed">
                Experience the future of binary investment with cutting-edge technology, 
                transparent processes, and multiple income opportunities.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center p-4 bg-yellow-500/5 backdrop-blur-md rounded-xl border border-yellow-500/20">
                    <svg className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-md rounded-2xl border border-yellow-500/30">
                <div className="text-5xl font-bold text-white mb-2">Daily</div>
                <div className="text-white/70">ROI Payouts</div>
              </div>
              <div className="p-8 bg-gradient-to-br from-yellow-600/20 to-yellow-500/20 backdrop-blur-md rounded-2xl border border-yellow-500/30">
                <div className="text-5xl font-bold text-white mb-2">Instant</div>
                <div className="text-white/70">Referral Bonuses</div>
              </div>
              <div className="p-8 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-md rounded-2xl border border-yellow-500/30">
                <div className="text-5xl font-bold text-white mb-2">Secure</div>
                <div className="text-white/70">Withdrawals</div>
              </div>
              <div className="p-8 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 backdrop-blur-md rounded-2xl border border-yellow-500/30">
                <div className="text-5xl font-bold text-white mb-2">Auto</div>
                <div className="text-white/70">Calculations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-yellow-500/20 via-yellow-600/20 to-amber-500/20 backdrop-blur-md rounded-3xl border border-yellow-500/30 shadow-2xl shadow-yellow-500/20">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of successful investors and start building your financial future today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="px-10 py-4 bg-yellow-500/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-yellow-500/20 mt-20 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Image
                  src="/logo1.png"
                  alt="CNEOX Logo"
                  width={150}
                  height={50}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-white/70">
                Revolutionary binary investment platform for maximum earning potential
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-white/70 hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-white/70 hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/how-to-start" className="text-white/70 hover:text-white transition-colors">
                    How to Start
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-white/70 hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/binary-investment-system" className="text-white/70 hover:text-white transition-colors">
                    Binary Investment System
                  </Link>
                </li>
                <li>
                  <Link href="/daily-roi-payouts" className="text-white/70 hover:text-white transition-colors">
                    Daily ROI Payouts
                  </Link>
                </li>
                <li>
                  <Link href="/referral-income" className="text-white/70 hover:text-white transition-colors">
                    Referral Income
                  </Link>
                </li>
                <li>
                  <Link href="/career-levels-info" className="text-white/70 hover:text-white transition-colors">
                    Career Levels
                  </Link>
                </li>
                <li>
                  <Link href="/voucher-system" className="text-white/70 hover:text-white transition-colors">
                    Voucher System
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-white/70 hover:text-white transition-colors">
                    24/7 Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about-us" className="text-white/70 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/policy" className="text-white/70 hover:text-white transition-colors">
                    Privacy & Terms
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-white/70 hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
                
              </ul>
            </div>
          </div>
          {/* Social Media Links */}
          <div className="border-t border-yellow-500/20 pt-8 pb-4">
            <div className="flex justify-center items-center gap-6 mb-4">
              {/* WhatsApp Link */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-green-400 transition-colors group"
                aria-label="Contact us on WhatsApp"
              >
                <svg
                  className="w-6 h-6 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-sm font-medium">WhatsApp</span>
              </a>

              {/* Facebook Link */}
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-blue-400 transition-colors group"
                aria-label="Visit our Facebook page"
              >
                <svg
                  className="w-6 h-6 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </a>
            </div>
          </div>
          <div className="border-t border-yellow-500/20 pt-4 text-center text-white/70">
            <p>&copy; {new Date().getFullYear()} CNEOX. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}