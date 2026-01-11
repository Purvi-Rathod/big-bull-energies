"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Footer from "@/components/Footer";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Crown Bankers?",
      answer: "Crown Bankers is a financial platform that bridges renewable energy and financial solutions for a sustainable future. We offer investment opportunities in energy projects with attractive returns.",
    },
    {
      question: "How do I get started?",
      answer: "You can get started by creating an account on our platform. Simply click on the Register button, fill in your details, and choose an investment package that suits your needs.",
    },
    {
      question: "What investment packages are available?",
      answer: "We offer three main investment packages: Solar Starter ($25-$4,999), Power Growth ($5,000-$49,999), and Elite Energy ($50,000 and above). Each package has different ROI rates and benefits.",
    },
    {
      question: "How are returns calculated?",
      answer: "Returns are calculated daily based on your investment package. ROI percentages range from 1.65% to 2.7% daily, depending on your chosen package. Returns are credited to your wallet daily.",
    },
    {
      question: "How do I withdraw my earnings?",
      answer: "You can withdraw your earnings through the Withdrawal section in your dashboard. Select your wallet, enter the amount, and choose your preferred withdrawal method. Processing times vary by method.",
    },
    {
      question: "What is the referral bonus?",
      answer: "Our referral bonus program rewards you for bringing new investors to the platform. You can earn 7% to 9% as a referral bonus when someone you refer invests in our packages.",
    },
    {
      question: "Is my investment secure?",
      answer: "Yes, we take security seriously. All transactions are encrypted, and we follow industry best practices to protect your data and investments. We also provide 100% principal return on all packages.",
    },
    {
      question: "How can I contact support?",
      answer: "You can contact our support team through the Support section in your dashboard. Create a support ticket, and our team will respond to you as soon as possible.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "156px" }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center" style={{ color: "#042B19" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 mb-12 text-center">
            Find answers to common questions about Crown Bankers
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border shadow-sm overflow-hidden"
                style={{ borderColor: "#E5E7EB" }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <span className="text-lg font-semibold" style={{ color: "#042B19" }}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 border-t" style={{ borderColor: "#E5E7EB" }}>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}



