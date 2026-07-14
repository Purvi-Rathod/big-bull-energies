"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function SupportPage() {
  const supportTopics = [
    {
      icon: "📚",
      title: "Getting Started",
      description:
        "New to CROWN? Learn how to create an account, make your first investment, and start earning.",
      link: "/how-to-start",
    },
    {
      icon: "💰",
      title: "Investment & Earnings",
      description:
        "Questions about packages, ROI, binary bonuses, referral income, and career levels.",
      link: "/how-it-works",
    },
    {
      icon: "🎫",
      title: "Voucher System",
      description:
        "Learn how to create vouchers, use them for investments, and maximize your reinvestment.",
      link: "/voucher-system",
    },
    {
      icon: "💳",
      title: "Payments & Withdrawals",
      description:
        "Information about deposits, withdrawals, USDT TRC20, and wallet management.",
      link: "/how-it-works",
    },
    {
      icon: "🌳",
      title: "Binary System",
      description:
        "Understanding the binary tree structure, matching bonuses, and network building.",
      link: "/binary-investment-system",
    },
    {
      icon: "📊",
      title: "Account & Dashboard",
      description:
        "How to view reports, track earnings, manage profile, and understand your dashboard.",
      link: "/how-to-start",
    },
  ];

  const faqs = [
    {
      question: "How do I get started with CROWN?",
      answer:
        "Simply sign up for a free account, set up your USDT TRC20 wallet address, fund your Investment Wallet, choose a package, and start earning. Visit our 'How to Start' page for detailed steps.",
    },
    {
      question: "How are ROI payouts calculated?",
      answer:
        "ROI is calculated daily based on your package's total output percentage and duration. Each day's ROI is split into cashable (50%) and renewable (50%) portions. The cashable portion goes to your ROI wallet and can be withdrawn.",
    },
    {
      question: "When are binary bonuses paid?",
      answer:
        "Binary bonuses are calculated and credited automatically every day at midnight based on matched business volume from your left and right teams. You earn a percentage (typically 10%) of the matched amount.",
    },
    {
      question: "How does the voucher system work?",
      answer:
        "Vouchers provide a 2x multiplier on purchase value. A $100 voucher gives you $200 in investment value. You can create vouchers from any income wallet and use them to fully or partially cover investments.",
    },
    {
      question: "What is the minimum investment amount?",
      answer:
        "Minimum investment amounts vary by package. Check the Plans section to see all available packages and their minimum requirements. The minimum voucher amount is always 50% of the minimum investment amount.",
    },
    {
      question: "How do I withdraw my earnings?",
      answer:
        "Go to the Withdraw section, select the wallet you want to withdraw from (ROI, Referral, Binary, or Career Level), enter the amount, and submit your request. Withdrawals are processed to your USDT TRC20 wallet after admin approval.",
    },
    {
      question: "What is USDT TRC20?",
      answer:
        "USDT TRC20 is a cryptocurrency (Tether on the Tron network) that we use for all deposits and withdrawals. Your wallet address must start with 'T' and be a valid TRC20 address.",
    },
    {
      question: "How long do investments last?",
      answer:
        "Investment duration varies by package (typically 150 days). Your investment earns daily ROI for the entire duration period. After expiration, the investment is automatically deactivated and stops earning ROI.",
    },
    {
      question: "Can I have multiple investments?",
      answer:
        "Yes! You can have multiple active investments in different packages simultaneously. Each investment earns ROI independently based on its package terms.",
    },
    {
      question: "What happens if I forget my password?",
      answer:
        "Use the 'Forgot Password' link on the login page. You'll receive password reset instructions via email. Make sure you have access to the email address associated with your account.",
    },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]">
      {/* Hero Section */}
      <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div
                className="h-px w-8 sm:w-12"
                style={{ backgroundColor: "#05627C" }}
              ></div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "#05627C" }}
              >
                SUPPORT
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-tight mb-4 sm:mb-6 px-2"
              style={{
                color: "#05627C",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              24/7 Support
            </h1>
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-2"
              style={{
                color: "#05627C",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              We're here to help you succeed. Get instant support through our
              integrated ticket system
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Support Overview */}
            <div
              className="p-8 sm:p-10 border border-gray-200"
              style={{ borderColor: "#E5E7EB" }}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-6"
                style={{
                  color: "#05627C",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Our Support System
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                CROWN provides comprehensive 24/7 support through our integrated
                ticket system. Once you're logged in, you can create support
                tickets for any questions, issues, or assistance you need. Our
                support team responds promptly to ensure you have the best
                experience on our platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div
                  className="text-center p-6 border border-gray-200"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="text-4xl mb-4">⚡</div>
                  <div
                    className="text-xl font-semibold mb-2"
                    style={{ color: "#05627C" }}
                  >
                    Fast Response
                  </div>
                  <div className="text-gray-600 text-sm">
                    Quick resolution times
                  </div>
                </div>
                <div
                  className="text-center p-6 border border-gray-200"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="text-4xl mb-4">🔄</div>
                  <div
                    className="text-xl font-semibold mb-2"
                    style={{ color: "#05627C" }}
                  >
                    24/7 Available
                  </div>
                  <div className="text-gray-600 text-sm">
                    Support whenever you need it
                  </div>
                </div>
                <div
                  className="text-center p-6 border border-gray-200"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="text-4xl mb-4">💬</div>
                  <div
                    className="text-xl font-semibold mb-2"
                    style={{ color: "#05627C" }}
                  >
                    Ticket System
                  </div>
                  <div className="text-gray-600 text-sm">
                    Track all conversations
                  </div>
                </div>
              </div>
            </div>

            {/* How to Get Support */}
            <div
              className="p-8 sm:p-10 border border-gray-200"
              style={{ borderColor: "#E5E7EB" }}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-6"
                style={{
                  color: "#05627C",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                How to Get Support
              </h2>
              <div className="space-y-6">
                <div
                  className="p-6 bg-gray-50 border border-gray-200"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#05627C" }}
                  >
                    Step 1: Log In to Your Account
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Access your CROWN dashboard by logging in with your
                    credentials. Support tickets are available to all registered
                    users.
                  </p>
                </div>

                <div
                  className="p-6 bg-gray-50 border border-gray-200"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#05627C" }}
                  >
                    Step 2: Navigate to Support Tickets
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Click on "Support Tickets" in your dashboard navigation
                    menu. This will take you to the support section.
                  </p>
                </div>

                <div
                  className="p-6 bg-gray-50 border border-gray-200"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#05627C" }}
                  >
                    Step 3: Create a New Ticket
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Click "Create Ticket" and fill in the following information:
                  </p>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    <li>
                      • Subject: Brief description of your question or issue
                    </li>
                    <li>• Category: Select the most appropriate category</li>
                    <li>
                      • Message: Provide detailed information about your request
                    </li>
                  </ul>
                </div>

                <div
                  className="p-6 bg-gray-50 border border-gray-200"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#05627C" }}
                  >
                    Step 4: Track Your Tickets
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    View all your support tickets, their status (open, pending,
                    resolved), and responses from our support team. You can
                    reply to tickets and continue conversations as needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Topics */}
            <div
              className="p-8 sm:p-10 border border-gray-200"
              style={{ borderColor: "#E5E7EB" }}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-8 text-center"
                style={{
                  color: "#05627C",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Common Support Topics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supportTopics.map((topic, index) => (
                  <Link
                    key={index}
                    href={topic.link}
                    className="p-6 border border-gray-200 hover:shadow-lg transition-all"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <div className="text-4xl mb-4">{topic.icon}</div>
                    <h3
                      className="text-xl font-semibold mb-3"
                      style={{ color: "#05627C" }}
                    >
                      {topic.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {topic.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div
              className="p-8 sm:p-10 border border-gray-200"
              style={{ borderColor: "#E5E7EB" }}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-8 text-center"
                style={{
                  color: "#05627C",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gray-50 border border-gray-200"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: "#05627C" }}
                    >
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Before Contacting Support */}
            <div
              className="p-8 sm:p-10 bg-[#E8F5F0] border border-gray-200"
              style={{ borderColor: "#E5E7EB" }}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-6"
                style={{
                  color: "#05627C",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Before Contacting Support
              </h2>
              <p className="text-base sm:text-lg text-gray-700 mb-6">
                Many questions can be answered by exploring our comprehensive
                documentation:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/how-it-works"
                  className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div
                    className="font-semibold mb-1"
                    style={{ color: "#05627C" }}
                  >
                    How It Works
                  </div>
                  <div className="text-gray-600 text-sm">
                    Complete guide to CROWN features
                  </div>
                </Link>
                <Link
                  href="/how-to-start"
                  className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div
                    className="font-semibold mb-1"
                    style={{ color: "#05627C" }}
                  >
                    Getting Started Guide
                  </div>
                  <div className="text-gray-600 text-sm">
                    Step-by-step instructions
                  </div>
                </Link>
                <Link
                  href="/binary-investment-system"
                  className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div
                    className="font-semibold mb-1"
                    style={{ color: "#05627C" }}
                  >
                    Binary System
                  </div>
                  <div className="text-gray-600 text-sm">
                    Understanding binary bonuses
                  </div>
                </Link>
                <Link
                  href="/daily-roi-payouts"
                  className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div
                    className="font-semibold mb-1"
                    style={{ color: "#05627C" }}
                  >
                    Daily ROI
                  </div>
                  <div className="text-gray-600 text-sm">
                    ROI calculation details
                  </div>
                </Link>
              </div>
            </div>

            {/* CTA */}
            <div
              className="text-center p-8 sm:p-10 bg-gray-50 border border-gray-200"
              style={{ borderColor: "#E5E7EB" }}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-normal mb-4"
                style={{
                  color: "#05627C",
                  fontFamily: "var(--font-font4), sans-serif",
                }}
              >
                Need Help? We're Here for You
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                Sign up to access our 24/7 support ticket system
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-block bg-[#ffcf0B] text-gray-900 font-bold px-6 sm:px-8 py-3 sm:py-4 transition hover:opacity-90 uppercase text-sm sm:text-base"
                  style={{ borderRadius: "0" }}
                >
                  Sign Up for Support Access
                </Link>
                <Link
                  href="/login"
                  className="inline-block bg-transparent border-2 text-gray-900 font-bold px-6 sm:px-8 py-3 sm:py-4 transition hover:bg-[#05627C] hover:text-white uppercase text-sm sm:text-base"
                  style={{
                    borderColor: "#05627C",
                    color: "#05627C",
                    borderRadius: "0",
                  }}
                >
                  Already Have an Account? Login
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
