"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Calculator,
  ChevronDown,
  Headphones,
  Lock,
  Package,
  Rocket,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";

const PRIMARY = "#05627C";
const DARK = "#0B1F2A";
const MUTED = "#6b7c85";
const ACCENT = "#3FA9C8";
const FONT_HEADING = "var(--font-font4), sans-serif";

const FAQS = [
  {
    question: "What is Big Bull Energies?",
    answer:
      "Big Bull Energies is a financial platform that bridges renewable energy and financial solutions for a sustainable future. We offer investment opportunities in energy projects with attractive returns.",
    icon: Shield,
  },
  {
    question: "How do I get started?",
    answer:
      "You can get started by creating an account on our platform. Simply click on the Register button, fill in your details, and choose an investment package that suits your needs.",
    icon: Rocket,
  },
  {
    question: "What investment packages are available?",
    answer:
      "We offer three main investment packages: Solar Starter ($25–$4,999), Power Growth ($5,000–$49,999), and Elite Energy ($50,000 and above). Each package has different ROI rates and benefits.",
    icon: Package,
  },
  {
    question: "How are returns calculated?",
    answer:
      "Returns are calculated daily based on your investment package. ROI percentages range from 1.65% to 2.7% daily, depending on your chosen package. Returns are credited to your wallet daily.",
    icon: Calculator,
  },
  {
    question: "How do I withdraw my earnings?",
    answer:
      "You can withdraw your earnings through the Withdrawal section in your dashboard. Select your wallet, enter the amount, and choose your preferred withdrawal method. Processing times vary by method.",
    icon: Wallet,
  },
  {
    question: "What is the referral bonus?",
    answer:
      "Our referral bonus program rewards you for bringing new investors to the platform. You can earn 7% to 9% as a referral bonus when someone you refer invests in our packages.",
    icon: Users,
  },
  {
    question: "Is my investment secure?",
    answer:
      "Yes, we take security seriously. All transactions are encrypted, and we follow industry best practices to protect your data and investments. We also provide 100% principal return on all packages.",
    icon: Lock,
  },
  {
    question: "How can I contact support?",
    answer:
      "You can reach us on WhatsApp at +44 7452 321003, email bigbullenergies@gmail.com, use the Contact page, or open a support ticket from your dashboard.",
    icon: Headphones,
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* Hero */}
      <section className="relative w-full min-h-[52vh] sm:min-h-[56vh] lg:min-h-[62vh] flex flex-col justify-end overflow-hidden pt-24 sm:pt-28 lg:pt-[126px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/Transmission-hero.webp"
            alt="Renewable energy infrastructure at sunset"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
          />
        </div>

        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,24,40,0.88) 0%, rgba(8,24,40,0.62) 42%, rgba(8,24,40,0.25) 72%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(8,24,40,0.55) 0%, transparent 55%)",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-[1220px] mx-auto">
            <motion.div
              className="max-w-xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                className="text-[2.25rem] sm:text-5xl lg:text-[3.35rem] font-bold leading-[1.1] mb-4 sm:mb-5 text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Frequently Asked{" "}
                <span style={{ color: ACCENT }}>Questions</span>
              </h1>
              <p className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/85 max-w-md">
                Find clear answers about Big Bull Energies — from getting
                started to withdrawals, security, and support.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 right-0 z-20 leading-[0] pointer-events-none">
          <svg
            viewBox="0 0 1440 64"
            preserveAspectRatio="none"
            className="w-full h-10 sm:h-12 lg:h-14 block"
            aria-hidden
          >
            <path
              d="M0,40 C240,70 480,10 720,32 C960,54 1200,10 1440,36 L1440,64 L0,64 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Accordion */}
      <section className="relative w-full bg-white pt-2 sm:pt-4 pb-12 sm:pb-16 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-3.5">
            {FAQS.map(({ question, answer, icon: Icon }, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={question}
                  className="rounded-xl sm:rounded-2xl border overflow-hidden transition-colors duration-300"
                  style={{
                    borderColor: isOpen
                      ? "rgba(5,98,124,0.18)"
                      : "rgba(5,98,124,0.1)",
                    backgroundColor: isOpen ? "#F3F6F8" : "#ffffff",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-4 sm:px-5 lg:px-6 py-4 sm:py-4.5 flex items-center gap-3 sm:gap-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isOpen
                          ? "rgba(5,98,124,0.12)"
                          : "rgba(5,98,124,0.08)",
                      }}
                    >
                      <Icon
                        className="w-[18px] h-[18px]"
                        style={{ color: PRIMARY }}
                        strokeWidth={1.75}
                      />
                    </span>

                    <span
                      className="flex-1 text-[15px] sm:text-base font-semibold leading-snug pr-2"
                      style={{ color: DARK }}
                    >
                      {question}
                    </span>

                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      style={{ color: PRIMARY }}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 lg:px-6 pb-5 sm:pb-6 pl-[3.75rem] sm:pl-[4.5rem] lg:pl-[4.75rem]">
                          <p
                            className="text-sm sm:text-[15px] leading-relaxed max-w-2xl"
                            style={{ color: MUTED }}
                          >
                            {answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative w-full bg-white pb-12 sm:pb-14 lg:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="max-w-3xl mx-auto rounded-2xl sm:rounded-3xl px-5 sm:px-7 lg:px-8 py-6 sm:py-7 flex flex-col sm:flex-row items-center gap-5 sm:gap-6"
            style={{ backgroundColor: "#EEF3F5" }}
          >
            <div
              className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: PRIMARY }}
            >
              <Headphones className="w-7 h-7 text-white" strokeWidth={1.75} />
            </div>

            <p
              className="flex-1 text-center sm:text-left text-[15px] sm:text-base lg:text-lg font-semibold leading-snug"
              style={{ color: DARK, fontFamily: FONT_HEADING }}
            >
              Still have questions? Our support team is here to help you.
            </p>

            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 font-bold px-5 py-3 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg text-white transition-opacity hover:opacity-90 shrink-0"
              style={{ backgroundColor: PRIMARY }}
            >
              Contact Support
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
