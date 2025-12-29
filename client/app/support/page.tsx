'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SupportPage() {
  const { user, admin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (admin || user?.userId === 'CROWN-000000') {
      router.push('/admin/dashboard');
    } else if (user) {
      router.push('/dashboard');
    }
  }, [user, admin, router]);

  const supportTopics = [
    {
      icon: "📚",
      title: "Getting Started",
      description: "New to CNEOX? Learn how to create an account, make your first investment, and start earning.",
      link: "/how-to-start"
    },
    {
      icon: "💰",
      title: "Investment & Earnings",
      description: "Questions about packages, ROI, binary bonuses, referral income, and career levels.",
      link: "/how-it-works"
    },
    {
      icon: "🎫",
      title: "Voucher System",
      description: "Learn how to create vouchers, use them for investments, and maximize your reinvestment.",
      link: "/voucher-system"
    },
    {
      icon: "💳",
      title: "Payments & Withdrawals",
      description: "Information about deposits, withdrawals, USDT TRC20, and wallet management.",
      link: "/how-it-works"
    },
    {
      icon: "🌳",
      title: "Binary System",
      description: "Understanding the binary tree structure, matching bonuses, and network building.",
      link: "/binary-investment-system"
    },
    {
      icon: "📊",
      title: "Account & Dashboard",
      description: "How to view reports, track earnings, manage profile, and understand your dashboard.",
      link: "/how-to-start"
    }
  ];

  const faqs = [
    {
      question: "How do I get started with CNEOX?",
      answer: "Simply sign up for a free account, set up your USDT TRC20 wallet address, fund your Investment Wallet, choose a package, and start earning. Visit our 'How to Start' page for detailed steps."
    },
    {
      question: "How are ROI payouts calculated?",
      answer: "ROI is calculated daily based on your package's total output percentage and duration. Each day's ROI is split into cashable (50%) and renewable (50%) portions. The cashable portion goes to your ROI wallet and can be withdrawn."
    },
    {
      question: "When are binary bonuses paid?",
      answer: "Binary bonuses are calculated and credited automatically every day at midnight based on matched business volume from your left and right teams. You earn a percentage (typically 10%) of the matched amount."
    },
    {
      question: "How does the voucher system work?",
      answer: "Vouchers provide a 2x multiplier on purchase value. A $100 voucher gives you $200 in investment value. You can create vouchers from any income wallet and use them to fully or partially cover investments."
    },
    {
      question: "What is the minimum investment amount?",
      answer: "Minimum investment amounts vary by package. Check the Plans section to see all available packages and their minimum requirements. The minimum voucher amount is always 50% of the minimum investment amount."
    },
    {
      question: "How do I withdraw my earnings?",
      answer: "Go to the Withdraw section, select the wallet you want to withdraw from (ROI, Referral, Binary, or Career Level), enter the amount, and submit your request. Withdrawals are processed to your USDT TRC20 wallet after admin approval."
    },
    {
      question: "What is USDT TRC20?",
      answer: "USDT TRC20 is a cryptocurrency (Tether on the Tron network) that we use for all deposits and withdrawals. Your wallet address must start with 'T' and be a valid TRC20 address."
    },
    {
      question: "How long do investments last?",
      answer: "Investment duration varies by package (typically 150 days). Your investment earns daily ROI for the entire duration period. After expiration, the investment is automatically deactivated and stops earning ROI."
    },
    {
      question: "Can I have multiple investments?",
      answer: "Yes! You can have multiple active investments in different packages simultaneously. Each investment earns ROI independently based on its package terms."
    },
    {
      question: "What happens if I forget my password?",
      answer: "Use the 'Forgot Password' link on the login page. You'll receive password reset instructions via email. Make sure you have access to the email address associated with your account."
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
            24/7 <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Support</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            We're here to help you succeed. Get instant support through our integrated ticket system
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Support Overview */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Our Support System</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              CNEOX provides comprehensive 24/7 support through our integrated ticket system. Once you're logged in, 
              you can create support tickets for any questions, issues, or assistance you need. Our support team 
              responds promptly to ensure you have the best experience on our platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-yellow-500/5 rounded-xl">
                <div className="text-4xl mb-4">⚡</div>
                <div className="text-xl font-bold text-yellow-400 mb-2">Fast Response</div>
                <div className="text-white/70 text-sm">Quick resolution times</div>
              </div>
              <div className="text-center p-6 bg-yellow-500/5 rounded-xl">
                <div className="text-4xl mb-4">🔄</div>
                <div className="text-xl font-bold text-yellow-500 mb-2">24/7 Available</div>
                <div className="text-white/70 text-sm">Support whenever you need it</div>
              </div>
              <div className="text-center p-6 bg-yellow-500/5 rounded-xl">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-xl font-bold text-yellow-400 mb-2">Ticket System</div>
                <div className="text-white/70 text-sm">Track all conversations</div>
              </div>
            </div>
          </div>

          {/* How to Get Support */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">How to Get Support</h2>
            <div className="space-y-6">
              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 1: Log In to Your Account</h3>
                <p className="text-white/70">
                  Access your CNEOX dashboard by logging in with your credentials. Support tickets are available 
                  to all registered users.
                </p>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 2: Navigate to Support Tickets</h3>
                <p className="text-white/70 mb-4">
                  Click on "Support Tickets" in your dashboard navigation menu. This will take you to the support section.
                </p>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 3: Create a New Ticket</h3>
                <p className="text-white/70 mb-4">
                  Click "Create Ticket" and fill in the following information:
                </p>
                <ul className="space-y-2 text-white/70 ml-6">
                  <li>• Subject: Brief description of your question or issue</li>
                  <li>• Category: Select the most appropriate category</li>
                  <li>• Message: Provide detailed information about your request</li>
                </ul>
              </div>

              <div className="p-6 bg-yellow-500/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Step 4: Track Your Tickets</h3>
                <p className="text-white/70">
                  View all your support tickets, their status (open, pending, resolved), and responses from our 
                  support team. You can reply to tickets and continue conversations as needed.
                </p>
              </div>
            </div>
          </div>

          {/* Support Topics */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Common Support Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportTopics.map((topic, index) => (
                <Link
                  key={index}
                  href={topic.link}
                  className="p-6 bg-yellow-500/5 rounded-xl hover:bg-white/10 transition-all border border-yellow-500/20 hover:border-white/30"
                >
                  <div className="text-4xl mb-4">{topic.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{topic.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{topic.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="p-6 bg-yellow-500/5 rounded-xl">
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">{faq.question}</h3>
                  <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Before Contacting Support */}
          <div className="p-8 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Before Contacting Support</h2>
            <p className="text-white/80 text-lg mb-6">
              Many questions can be answered by exploring our comprehensive documentation:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/how-it-works" className="p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-all">
                <div className="font-semibold text-white mb-1">How It Works</div>
                <div className="text-white/70 text-sm">Complete guide to CNEOX features</div>
              </Link>
              <Link href="/how-to-start" className="p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-all">
                <div className="font-semibold text-white mb-1">Getting Started Guide</div>
                <div className="text-white/70 text-sm">Step-by-step instructions</div>
              </Link>
              <Link href="/binary-investment-system" className="p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-all">
                <div className="font-semibold text-white mb-1">Binary System</div>
                <div className="text-white/70 text-sm">Understanding binary bonuses</div>
              </Link>
              <Link href="/daily-roi-payouts" className="p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-all">
                <div className="font-semibold text-white mb-1">Daily ROI</div>
                <div className="text-white/70 text-sm">ROI calculation details</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Need Help? We're Here for You</h2>
            <p className="text-white/80 mb-6 text-lg">
              Sign up to access our 24/7 support ticket system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                Sign Up for Support Access
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-yellow-500/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-yellow-500/30 hover:bg-yellow-500/20 transition-all"
              >
                Already Have an Account? Login
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