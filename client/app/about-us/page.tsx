'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import PublicHeader from "@/components/PublicHeader";

export default function AboutUsPage() {
  const { user, admin } = useAuth();
  // Removed redirects - allow logged-in users to access this page

  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            About <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">CROWN</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Revolutionizing binary investment with transparency, innovation, and technology
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Our Mission */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-white/80 leading-relaxed text-lg">
              CROWN was founded with a simple yet powerful mission: to democratize wealth creation through 
              an advanced binary investment platform that combines cutting-edge technology with transparent, 
              fair compensation systems. We believe everyone deserves the opportunity to build sustainable 
              income through network marketing, backed by a robust technological infrastructure.
            </p>
          </div>

          {/* What We Do */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">What We Do</h2>
            <p className="text-white/80 leading-relaxed text-lg mb-6">
              CROWN is a comprehensive binary MLM (Multi-Level Marketing) investment platform that enables 
              users to earn through multiple income streams:
            </p>
            <ul className="space-y-4 text-white/80 text-lg">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-white">Binary Investment System:</strong> Advanced matching algorithms that reward balanced team building</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-white">Daily ROI Payouts:</strong> Automated daily returns on investments with transparent calculations</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-white">Referral Income:</strong> Instant bonuses when you build your network</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-white">Career Levels:</strong> Progressive reward system that grows with your success</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong className="text-white">Voucher System:</strong> Flexible reinvestment options for portfolio growth</span>
              </li>
            </ul>
          </div>

          {/* Our Values */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Transparency</h3>
                <p className="text-white/70">
                  All calculations, earnings, and processes are transparent and verifiable. We believe in 
                  complete honesty with our community.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-500 mb-3">Innovation</h3>
                <p className="text-white/70">
                  Cutting-edge technology powers our platform, ensuring reliable, real-time calculations 
                  and seamless user experience.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Security</h3>
                <p className="text-white/70">
                  Bank-level encryption and security measures protect your data and funds at all times.
                </p>
              </div>
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Community</h3>
                <p className="text-white/70">
                  We're building more than a platform—we're creating a community of entrepreneurs 
                  helping each other succeed.
                </p>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">Built on Modern Technology</h2>
            <p className="text-white/80 leading-relaxed text-lg mb-6">
              CROWN leverages state-of-the-art technology to ensure accuracy, security, and performance:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-500/5 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400 mb-2">Real-Time</div>
                <div className="text-white/70 text-sm">Instant Calculations</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/5 rounded-lg">
                <div className="text-2xl font-bold text-yellow-500 mb-2">Automated</div>
                <div className="text-white/70 text-sm">Daily Payouts</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/5 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400 mb-2">Secure</div>
                <div className="text-white/70 text-sm">Enterprise Grade</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-gradient-to-br from-yellow-500/20 via-yellow-600/20 to-amber-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Join the CROWN Revolution</h2>
            <p className="text-white/80 mb-6 text-lg">
              Start your journey towards financial freedom today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/how-to-start"
                className="px-8 py-3 bg-yellow-500/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-yellow-500/30 hover:bg-yellow-500/20 transition-all"
              >
                Learn How to Start
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