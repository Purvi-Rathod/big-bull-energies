"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign,
  Users,
  Network,
  TrendingUp,
  Percent,
  Award,
  Calculator,
  Zap,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Footer from "@/components/Footer";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const PRIMARY = "#05627C";
const ACCENT = "#3FA9C8";
const GOLD = "#F5CF0B";
const MINT = "#E8F5F0";

export default function OurPlanPage() {
  const [investmentAmount, setInvestmentAmount] = useState<string>("435");
  const [calculatedResults, setCalculatedResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("roi");
  const [roadmapRevealed, setRoadmapRevealed] = useState(false);
  const roadmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = roadmapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRoadmapRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const investmentPlans = [
    {
      id: 1,
      name: "Solar Starter",
      minAmount: "$25",
      maxAmount: "$4,999",
      roi: "1.5%",
      bondDays: "200 Days",
      referral: "8%",
      binary: "10%",
      binaryCapping: "$1,000",
      principalReturn: "60%",
      totalROIReturns: "300%",
      totalReturns: "360%",
    },
    {
      id: 2,
      name: "Power Growth",
      minAmount: "$5,000",
      maxAmount: "$49,999",
      roi: "1.75%",
      bondDays: "190 Days",
      referral: "9%",
      binary: "10%",
      binaryCapping: "$5,000",
      principalReturn: "80%",
      totalROIReturns: "332.5%",
      totalReturns: "412.5%",
    },
    {
      id: 3,
      name: "Elite Energy",
      minAmount: "$50,000",
      maxAmount: "and above",
      roi: "2%",
      bondDays: "180 Days",
      referral: "10%",
      binary: "10%",
      binaryCapping: "$10,000",
      principalReturn: "100%",
      totalROIReturns: "360%",
      totalReturns: "460%",
    },
  ];

  const calculateReturns = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount < 25) {
      alert("Minimum investment amount is $25");
      return;
    }

    let selectedPlan;
    if (amount >= 50000) {
      selectedPlan = investmentPlans[2]; // Elite Energy
    } else if (amount >= 5000) {
      selectedPlan = investmentPlans[1]; // Power Growth
    } else {
      selectedPlan = investmentPlans[0]; // Solar Starter
    }

    const dailyROI = parseFloat(selectedPlan.roi);
    const bondDays = parseInt(selectedPlan.bondDays);
    const dailyReturn = (amount * dailyROI) / 100;
    const roiProfit = dailyReturn * bondDays;
    const principalReturnPercent = parseFloat(selectedPlan.principalReturn);
    const principalReturnAmount = (amount * principalReturnPercent) / 100;
    const totalROIReturnsPercent = parseFloat(selectedPlan.totalROIReturns);
    const totalReturnsPercent = parseFloat(selectedPlan.totalReturns);
    const totalReturn = roiProfit + principalReturnAmount;

    setCalculatedResults({
      plan: selectedPlan.name,
      dailyROI: selectedPlan.roi,
      bondDays: selectedPlan.bondDays,
      principalReturn: selectedPlan.principalReturn,
      totalROIReturns: selectedPlan.totalROIReturns,
      totalReturns: selectedPlan.totalReturns,
      dailyReturn: dailyReturn.toFixed(3),
      roiProfit: roiProfit.toFixed(2),
      principalReturnAmount: principalReturnAmount.toFixed(2),
      principalAmount: amount.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
    });
  };

  const tabs = [
    { id: "roi", label: "Daily ROI", icon: TrendingUp },
    { id: "referral", label: "Referral Income", icon: Users },
    { id: "binary", label: "Binary Income", icon: Network },
    { id: "principal", label: "Principal Return", icon: DollarSign },
  ];

  const roadmap = [
    {
      year: "2022",
      icon: Award,
      title: "A Dream Takes Shape",
      desc: "Conceptualized Big Bull Energies as a bridge between renewable energy and financial solutions.",
    },
    {
      year: "2023",
      icon: Zap,
      title: "Laying the Foundation",
      desc: "Registered our website domain. Broke ground on our first solar plant.",
    },
    {
      year: "2024",
      icon: TrendingUp,
      title: "A Year of Transformation",
      desc: "Completed first solar plant. Registered in New Zealand and the UK.",
    },
    {
      year: "2025",
      icon: Network,
      title: "Global Expansion",
      desc: "Opened second plant in Groningen, Netherlands. Hosting global events.",
    },
    {
      year: "2026",
      icon: ShieldCheck,
      title: "Pioneering the Future",
      desc: "Begin manufacturing EV and solar components. Expansion to 30+ countries.",
    },
    {
      year: "2027",
      icon: Wallet,
      title: "Smart Tech & Clean Mobility",
      desc: "Deploy AI-powered energy tracking. Launch EV Charging Stations.",
    },
    {
      year: "2028",
      icon: Award,
      title: "Global Leader",
      desc: "Operate 100+ solar plants worldwide. Fully integrated smart grids.",
    },
  ];

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[156px]"
      style={{ fontFamily: FONT_STACK }}
    >
      {/* Hero Section — full-bleed background image */}
      <section className="relative w-full overflow-hidden min-h-[380px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[480px] flex items-center">
        {/* Background image - place your local image at /public/images/plan-hero.png */}
        <Image
          src="/images/plan-hero.png"
          alt="Solar panels and wind turbines landscape"
          fill
          priority
          className="object-cover"
        />
        {/* Mobile overlay: strong, mostly-solid fade so text stays readable on narrow screens */}
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(232,245,240,0.95) 0%, rgba(232,245,240,0.9) 55%, rgba(232,245,240,0.55) 100%)",
          }}
        />
        {/* Desktop/tablet overlay: left-to-right fade */}
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(232,245,240,0.97) 0%, rgba(232,245,240,0.9) 35%, rgba(232,245,240,0.45) 58%, rgba(232,245,240,0.05) 78%, rgba(232,245,240,0) 95%)",
          }}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="h-px w-8 sm:w-10" style={{ backgroundColor: GOLD }} />
                <span
                  className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
                  style={{ color: PRIMARY }}
                >
                  Invest With Us
                </span>
              </div>
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 sm:mb-4"
                style={{ color: PRIMARY }}
              >
                Investment Packages <br className="hidden sm:block" />
                and <span style={{ color: ACCENT }}>Return</span>
              </h1>
              <p
                className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed"
                style={{ color: PRIMARY, opacity: 0.75 }}
              >
                Explore our flexible investment packages designed for
                sustainable growth and maximum returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Plans Section */}
      <section className="relative w-full bg-white py-10 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {investmentPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 md:p-7 border transition-all hover:shadow-xl"
                  style={{ borderColor: "rgba(5,98,124,0.18)" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: MINT }}
                    >
                      <Network className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: PRIMARY }} />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-base sm:text-lg md:text-xl font-bold truncate"
                        style={{ color: PRIMARY }}
                      >
                        {plan.name}
                      </h3>
                      <p className="text-xs" style={{ color: PRIMARY, opacity: 0.6 }}>
                        Amount Range:
                      </p>
                      <p
                        className="text-xs sm:text-sm font-semibold"
                        style={{ color: ACCENT }}
                      >
                        {plan.minAmount} – {plan.maxAmount}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-0 mb-6">
                    {[
                      ["Daily ROI:", plan.roi],
                      ["Duration:", plan.bondDays],
                      ["Referral Income:", plan.referral],
                      ["Binary Income:", plan.binary],
                      ["Binary Cap (Pair):", plan.binaryCapping],
                      ["Payout (Wallet):", plan.principalReturn],
                      ["Total ROI Return:", plan.totalROIReturns],
                      ["Total Rebate:", plan.totalReturns],
                    ].map(([label, value], i) => (
                      <div
                        key={label}
                        className="flex justify-between items-center gap-2 py-2.5"
                        style={
                          i < 7
                            ? { borderBottom: "1px solid rgba(5,98,124,0.1)" }
                            : undefined
                        }
                      >
                        <span
                          className="text-xs sm:text-sm font-medium"
                          style={{ color: PRIMARY, opacity: 0.65 }}
                        >
                          {label}
                        </span>
                        <span
                          className="text-xs sm:text-sm font-bold whitespace-nowrap"
                          style={{ color: PRIMARY }}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/contact"
                    className="block w-full text-center font-bold px-6 py-3.5 text-xs sm:text-sm rounded-lg uppercase tracking-wide transition hover:opacity-90"
                    style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
                  >
                    Invest Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investment Calculator Section — horizontal card */}
      <section className="relative w-full bg-white pb-10 sm:pb-12 md:pb-16 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div
              className="relative rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10 overflow-hidden"
              style={{ backgroundColor: MINT }}
            >
              {/* decorative dot grid */}
              <div
                className="absolute top-6 right-6 w-24 h-24 pointer-events-none hidden md:block"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(5,98,124,0.18) 1.5px, transparent 1.5px)",
                  backgroundSize: "12px 12px",
                }}
              />
              <div className="relative flex flex-col lg:flex-row lg:items-center gap-5 sm:gap-6 lg:gap-10">
                <div className="flex items-center gap-3 sm:gap-4 lg:flex-shrink-0">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold"
                    style={{ color: PRIMARY }}
                  >
                    Investment
                    <br className="hidden sm:block" /> Calculator
                  </h2>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:max-w-xl">
                  <div className="flex-1">
                    <label
                      className="block text-xs font-bold uppercase tracking-wide mb-2"
                      style={{ color: PRIMARY, opacity: 0.7 }}
                    >
                      Amount ($25 minimum)
                    </label>
                    <div className="relative">
                      <DollarSign
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                        style={{ color: PRIMARY }}
                      />
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        min="25"
                        className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-lg border text-base font-semibold bg-white focus:outline-none focus:ring-2"
                        style={
                          {
                            borderColor: "rgba(5,98,124,0.25)",
                            color: PRIMARY,
                            ["--tw-ring-color" as string]: PRIMARY,
                          } as React.CSSProperties
                        }
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                  <button
                    onClick={calculateReturns}
                    className="w-full sm:w-auto sm:self-end px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-white font-bold text-xs sm:text-sm uppercase tracking-wide transition hover:opacity-90 whitespace-nowrap"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    Calculate Returns
                  </button>
                </div>
              </div>

              {/* Results Section */}
              {calculatedResults && (
                <div
                  className="relative mt-6 sm:mt-8 pt-6 sm:pt-8 space-y-5 sm:space-y-6"
                  style={{ borderTop: "1px solid rgba(5,98,124,0.15)" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-10 gap-y-3">
                    {[
                      ["Applied Plan:", calculatedResults.plan],
                      ["Daily ROI:", calculatedResults.dailyROI],
                      ["Bond Period:", calculatedResults.bondDays],
                      ["Principal Return:", calculatedResults.principalReturn],
                      ["Total ROI Returns:", calculatedResults.totalROIReturns],
                      [
                        "Total Returns (ROI + Principal):",
                        calculatedResults.totalReturns,
                      ],
                      ["Daily Return:", `$${calculatedResults.dailyReturn}`],
                      ["ROI Profit (Total):", `$${calculatedResults.roiProfit}`],
                      ["Principal Amount:", `$${calculatedResults.principalAmount}`],
                      [
                        "Principal Return Amount:",
                        `$${calculatedResults.principalReturnAmount}`,
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center gap-2">
                        <span
                          className="text-xs sm:text-sm font-semibold"
                          style={{ color: PRIMARY, opacity: 0.7 }}
                        >
                          {label}
                        </span>
                        <span className="text-xs sm:text-sm font-bold whitespace-nowrap" style={{ color: PRIMARY }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col xs:flex-row justify-between items-center gap-2 pt-4 bg-white p-4 sm:p-5 rounded-lg">
                    <span
                      className="text-base sm:text-lg md:text-xl font-bold"
                      style={{ color: PRIMARY }}
                    >
                      Total Return:
                    </span>
                    <span
                      className="text-lg sm:text-xl md:text-2xl font-bold"
                      style={{ color: PRIMARY }}
                    >
                      ${calculatedResults.totalReturn}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Informational Tabs Section */}
      <section className="relative w-full bg-white py-10 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3"
                style={{ color: PRIMARY }}
              >
                Understanding Your Earnings
              </h2>
              <p
                className="text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
                style={{ color: PRIMARY, opacity: 0.65 }}
              >
                Learn how different income components work together to
                maximize your returns.
              </p>
            </div>

            {/* Tab buttons */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wide transition"
                    style={
                      isActive
                        ? { backgroundColor: PRIMARY, color: "#fff" }
                        : {
                          backgroundColor: "#fff",
                          color: PRIMARY,
                          border: "1px solid rgba(5,98,124,0.2)",
                        }
                    }
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div
              className="rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10"
              style={{ backgroundColor: MINT }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                <div className="lg:col-span-2 space-y-4 sm:space-y-5">
                  {activeTab === "roi" && (
                    <>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: PRIMARY }}>
                        Daily ROI (Return on Investment)
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: PRIMARY, opacity: 0.8 }}>
                        <strong>What is Daily ROI?</strong> Daily ROI is the
                        percentage return you earn on your investment every
                        single day, calculated based on your chosen package.
                      </p>
                      <div className="bg-white p-4 sm:p-6 rounded-lg">
                        <h4 className="font-bold mb-3 text-sm sm:text-base" style={{ color: PRIMARY }}>
                          How It Works:
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-sm" style={{ color: PRIMARY }}>
                          {[
                            "Each package has a specific daily ROI percentage (1.5% - 2%)",
                            "ROI is calculated daily and credited to your account",
                            "Example: Invest $1,000 at 1.5% daily ROI = $15 per day",
                            "ROI accumulates over the bond period (180-200 days)",
                          ].map((line) => (
                            <li key={line} className="flex items-start gap-2">
                              <span style={{ color: ACCENT }} className="font-bold">✓</span>
                              <span className="opacity-80">{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {activeTab === "referral" && (
                    <>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: PRIMARY }}>
                        Referral Income
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: PRIMARY, opacity: 0.8 }}>
                        <strong>What is Referral Income?</strong> When you
                        refer someone and they invest, you earn a percentage
                        commission on their investment amount.
                      </p>
                      <div className="bg-white p-4 sm:p-6 rounded-lg">
                        <h4 className="font-bold mb-3 text-sm sm:text-base" style={{ color: PRIMARY }}>
                          How It Works:
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-sm" style={{ color: PRIMARY }}>
                          {[
                            "Share your unique referral link with others",
                            "When they sign up and invest, you earn 8% - 10% commission",
                            "Commission rate depends on your investment package tier",
                            "Example: Refer someone who invests $5,000 = $400 - $500 referral bonus",
                            "No limit on the number of people you can refer",
                          ].map((line) => (
                            <li key={line} className="flex items-start gap-2">
                              <span style={{ color: ACCENT }} className="font-bold">✓</span>
                              <span className="opacity-80">{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {activeTab === "binary" && (
                    <>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: PRIMARY }}>
                        Binary Income
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: PRIMARY, opacity: 0.8 }}>
                        <strong>What is Binary Income?</strong> Binary income
                        is earned when your referred members create a
                        balanced binary tree. You earn based on the smaller
                        leg&apos;s volume.
                      </p>
                      <div className="bg-white p-4 sm:p-6 rounded-lg">
                        <h4 className="font-bold mb-3 text-sm sm:text-base" style={{ color: PRIMARY }}>
                          How It Works:
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-sm" style={{ color: PRIMARY }}>
                          {[
                            "Your referrals are placed in a binary tree (left and right legs)",
                            "Binary bonus is calculated on the smaller leg's total volume",
                            "Standard binary rate is 10% of the smaller leg",
                            "Example: Left leg = $2,800, Right leg = $4,650 → Bonus = $280",
                            "Daily capping limits apply based on your package ($1,000 - $10,000)",
                          ].map((line) => (
                            <li key={line} className="flex items-start gap-2">
                              <span style={{ color: ACCENT }} className="font-bold">✓</span>
                              <span className="opacity-80">{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {activeTab === "principal" && (
                    <>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: PRIMARY }}>
                        Principal Return
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: PRIMARY, opacity: 0.8 }}>
                        <strong>What is Principal Return?</strong> At the end
                        of your bond period, you receive a percentage of your
                        original investment back — this varies by package tier.
                      </p>
                      <div className="bg-white p-4 sm:p-6 rounded-lg">
                        <h4 className="font-bold mb-3 text-sm sm:text-base" style={{ color: PRIMARY }}>
                          How It Works:
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-sm" style={{ color: PRIMARY }}>
                          {[
                            "Solar Starter: 60% of principal returned",
                            "Power Growth: 80% of principal returned",
                            "Elite Energy: 100% of principal returned",
                            "Example: Invest $10,000 in Power Growth → Receive $8,000 back at maturity",
                            "Principal return is paid at the end of the bond period (180-200 days)",
                          ].map((line) => (
                            <li key={line} className="flex items-start gap-2">
                              <span style={{ color: ACCENT }} className="font-bold">✓</span>
                              <span className="opacity-80">{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-full lg:min-h-[280px] rounded-xl overflow-hidden">
                  {/* Background image - place your local image at /public/images/plan-tab-side.png */}
                  <Image
                    src="/images/plan-tab-side.png"
                    alt="Solar plant at sunset"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Feature mini-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8">
              {[
                { icon: Wallet, title: "Instant Withdrawals", desc: "Withdraw earnings anytime" },
                { icon: ShieldCheck, title: "Capital Back", desc: "Get your investment back" },
                { icon: Percent, title: "Secure & Transparent", desc: "100% security for your funds" },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-center gap-3 p-4 sm:p-5 rounded-xl border"
                  style={{ borderColor: "rgba(5,98,124,0.18)" }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: MINT }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: PRIMARY }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm" style={{ color: PRIMARY }}>
                      {title}
                    </h4>
                    <p className="text-[11px] sm:text-xs" style={{ color: PRIMARY, opacity: 0.6 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Extra Income Opportunities Section */}
      <section className="relative w-full bg-white py-10 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 text-center"
              style={{ color: PRIMARY }}
            >
              Extra Income Opportunities at Big Bull Energies
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
              {/* Referral Bonus */}
              <div className="rounded-2xl p-5 sm:p-6 md:p-8" style={{ backgroundColor: MINT }}>
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: PRIMARY }}>
                    Referral Bonus
                  </h3>
                </div>
                <p className="text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: PRIMARY, opacity: 0.8 }}>
                  Refer your friends and earn a generous referral bonus. Build
                  your network and increase your income by helping others
                  grow with Big Bull Energies.
                </p>
                <p className="text-xs sm:text-sm md:text-base leading-relaxed mt-3" style={{ color: PRIMARY, opacity: 0.8 }}>
                  By referring others, you help them unlock financial growth
                  and earn a bonus of 8% to 10% as a thank-you for growing our
                  investment family.
                </p>
              </div>

              {/* Binary Bonus */}
              <div className="rounded-2xl p-5 sm:p-6 md:p-8" style={{ backgroundColor: MINT }}>
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    <Network className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: PRIMARY }}>
                    Binary Bonus
                  </h3>
                </div>
                <p className="text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: PRIMARY, opacity: 0.8 }}>
                  Earn exciting Binary bonuses when your team achieves the
                  required targets, calculated on the lesser leg&apos;s total
                  investment.
                </p>
                <div className="mt-4 sm:mt-6 space-y-2 bg-white rounded-lg p-3 sm:p-4">
                  {[
                    ["Left business volume:", "$2,800"],
                    ["Right business volume:", "$4,650"],
                    ["Binary bonus (10%):", "$280"],
                  ].map(([label, value], i) => (
                    <div
                      key={label}
                      className="flex justify-between items-center gap-2 py-1.5"
                      style={
                        i < 2 ? { borderBottom: "1px solid rgba(5,98,124,0.1)" } : undefined
                      }
                    >
                      <span className="text-xs sm:text-sm font-medium" style={{ color: PRIMARY, opacity: 0.7 }}>
                        {label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold whitespace-nowrap" style={{ color: PRIMARY }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] sm:text-xs md:text-sm mt-3 italic" style={{ color: PRIMARY, opacity: 0.6 }}>
                  The binary bonus is calculated based on the lesser leg
                  ($2,800). At a 10% rate, the bonus earned is $280.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section — horizontal timeline */}
      <section className="relative w-full bg-white py-10 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 sm:mb-10 md:mb-14 text-center"
              style={{ color: PRIMARY }}
            >
              Big Bull Energies Roadmap (2022 – 2028)
            </h2>

            <div ref={roadmapRef} className="relative overflow-x-auto pb-4">
              <div className="relative min-w-[720px] sm:min-w-[820px] lg:min-w-0">
                {/* connecting line */}
                <div
                  className="absolute left-0 right-0 top-6 sm:top-7 h-0.5"
                  style={{ backgroundColor: "rgba(5,98,124,0.2)" }}
                />
                <div className="relative grid grid-cols-7 gap-2 sm:gap-3">
                  {roadmap.map((step, i) => {
                    const Icon = step.icon;
                    const isLast = i === roadmap.length - 1;
                    return (
                      <div
                        key={step.year}
                        className="flex flex-col items-center text-center px-1 transition-all duration-700 ease-out"
                        style={{
                          opacity: roadmapRevealed ? 1 : 0,
                          transform: roadmapRevealed
                            ? "translateY(0)"
                            : "translateY(16px)",
                          transitionDelay: `${i * 150}ms`,
                        }}
                      >
                        <div
                          className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 sm:mb-3 relative z-10 shadow-sm"
                          style={{
                            backgroundColor: isLast ? PRIMARY : "#fff",
                            border: isLast ? "none" : `2px solid ${PRIMARY}33`,
                          }}
                        >
                          <Icon
                            className="w-5 h-5 sm:w-6 sm:h-6"
                            style={{ color: isLast ? "#fff" : PRIMARY }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-bold mb-1" style={{ color: PRIMARY }}>
                          {step.year}
                        </span>
                        <h3 className="text-[11px] sm:text-xs md:text-sm font-bold mb-1" style={{ color: PRIMARY }}>
                          {step.title}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] md:text-xs leading-snug" style={{ color: PRIMARY, opacity: 0.65 }}>
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — full-bleed background image */}
      <section className="relative w-full overflow-hidden min-h-[300px] sm:min-h-[330px] md:min-h-[360px] flex items-center">
        {/* Background image - place your local image at /public/images/plan-cta.png */}
        <Image
          src="/images/plan-cta.png"
          alt="Wind turbines on hillside"
          fill
          className="object-cover"
        />
        {/* Mobile overlay: strong bottom-weighted fade so text stays readable */}
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(232,245,240,0.35) 0%, rgba(232,245,240,0.85) 55%, rgba(232,245,240,0.97) 100%)",
          }}
        />
        {/* Desktop/tablet overlay: left-to-right fade */}
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(232,245,240,0.15) 0%, rgba(232,245,240,0.55) 35%, rgba(232,245,240,0.92) 60%, rgba(232,245,240,0.98) 100%)",
          }}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-xl ml-auto">
              <h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
                style={{ color: PRIMARY }}
              >
                Choose the plan that fits your investment goals
              </h2>
              <p
                className="text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-6"
                style={{ color: PRIMARY, opacity: 0.75 }}
              >
                A sustainable future starts with smart investments. Select a
                plan that aligns with your goals and start earning with Big
                Bull Energies today.
              </p>
              <Link
                href="/contact"
                className="inline-block font-bold px-7 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-xs sm:text-sm rounded-lg uppercase tracking-wide transition hover:opacity-90"
                style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}