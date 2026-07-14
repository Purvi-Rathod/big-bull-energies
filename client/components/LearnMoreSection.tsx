"use client";

import Link from "next/link";
import {
  BookOpen,
  TrendingUp,
  Users,
  Network,
  Award,
  DollarSign,
  HelpCircle,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

const TEAL = "#05627C";
const TEAL_LIGHT = "#0B87A8";
const MINT = "#E8F5F0";

type Resource = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  group: "Getting Started" | "Earning & Growth" | "Support & Resources";
};

const resources: Resource[] = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "How Platform Works",
    description:
      "Complete step-by-step guide to understanding the Big Bull Energies platform, from registration to earning.",
    href: "/how-platform-works",
    group: "Getting Started",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "How to Start",
    description:
      "New to Big Bull Energies? Learn how to create an account, make your first investment, and begin earning.",
    href: "/how-to-start",
    group: "Getting Started",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Investment Plans",
    description:
      "Explore our investment packages, ROI rates, and understand how daily returns work.",
    href: "/our-plan",
    group: "Earning & Growth",
  },
  {
    icon: <Network className="w-5 h-5" />,
    title: "Binary System",
    description:
      "Understand how the binary tree structure works and how to maximize your binary income.",
    href: "/binary-investment-system",
    group: "Earning & Growth",
  },
  {
    icon: <Award className="w-5 h-5" />,
    title: "Career Rewards",
    description:
      "Unlock exclusive rewards, bonuses, and recognition as you progress through career levels.",
    href: "/career-rewards",
    group: "Earning & Growth",
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    title: "Earning Methods",
    description:
      "Learn about ROI, referral income, binary bonuses, and all the ways you can earn.",
    href: "/our-plan",
    group: "Earning & Growth",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    title: "FAQ & Support",
    description:
      "Find answers to common questions and get help from our support team.",
    href: "/support",
    group: "Support & Resources",
  },
  {
    icon: <ImageIcon className="w-5 h-5" />,
    title: "Gallery",
    description:
      "View photos and videos of our solar plants, office spaces, and events.",
    href: "/gallery",
    group: "Support & Resources",
  },
];

const quickLinks = [
  { label: "Referral Income", href: "/referral-income" },
  { label: "Daily ROI Payouts", href: "/daily-roi-payouts" },
  { label: "Career Levels", href: "/career-levels-info" },
  { label: "Voucher System", href: "/voucher-system" },
];

const groupOrder: Resource["group"][] = [
  "Getting Started",
  "Earning & Growth",
  "Support & Resources",
];

function ResourceCard({ icon, title, description, href }: Omit<Resource, "group">) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_1px_2px_rgba(5,98,124,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(5,98,124,0.25)] hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ ["--tw-ring-color" as string]: TEAL }}
    >
      {/* top accent bar, revealed on hover */}
      <span
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${TEAL}, ${TEAL_LIGHT})` }}
      />

      <div
        className="relative flex items-center justify-center w-12 h-12 rounded-xl mb-5 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_LIGHT})` }}
      >
        {icon}
      </div>

      <h4
        className="text-lg font-bold mb-2 tracking-tight transition-colors duration-300"
        style={{ color: TEAL }}
      >
        {title}
      </h4>

      <p className="text-sm leading-relaxed text-slate-500 mb-6 flex-1">
        {description}
      </p>

      <span
        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-300"
        style={{ color: TEAL }}
      >
        Learn more
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
      </span>
    </Link>
  );
}

export default function LearnMoreSection() {
  const grouped = groupOrder.map((label) => ({
    label,
    items: resources.filter((r) => r.group === label),
  }));

  return (
    <section className="relative w-full bg-white py-20 sm:py-24 md:py-32 overflow-hidden">
      {/* ambient background accents */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-[0.07]"
        style={{ background: `radial-gradient(circle, ${TEAL}, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-[0.06]"
        style={{ background: `radial-gradient(circle, ${TEAL}, transparent 70%)` }}
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div
              className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border"
              style={{ borderColor: `${TEAL}33`, backgroundColor: MINT }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: TEAL }} />
              <span
                className="text-xs font-semibold uppercase tracking-[0.15em]"
                style={{ color: TEAL }}
              >
                Learn More
              </span>
            </div>

            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] mb-6 px-2"
              style={{ color: TEAL, fontFamily: "var(--font-font4), sans-serif" }}
            >
              Everything you need to know
            </h2>
            <p
              className="text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-slate-500"
              style={{ fontFamily: "var(--font-font4), sans-serif" }}
            >
              Comprehensive guides and resources to help you understand how Big
              Bull Energies works and maximize your earning potential.
            </p>
          </div>

          {/* Grouped resource grids */}
          <div className="space-y-16">
            {grouped.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-4 mb-7">
                  <h3
                    className="text-sm font-bold uppercase tracking-[0.12em] whitespace-nowrap"
                    style={{ color: TEAL }}
                  >
                    {group.label}
                  </h3>
                  <span
                    className="h-px flex-1"
                    style={{
                      background: `linear-gradient(90deg, ${TEAL}40, transparent)`,
                    }}
                  />
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: MINT, color: TEAL }}
                  >
                    {group.items.length} guide{group.items.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 ${
                    group.items.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
                  } gap-5 sm:gap-6`}
                >
                  {group.items.map((item) => (
                    <ResourceCard
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                      href={item.href}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mt-20 pt-10 border-t border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 mb-5 text-center sm:text-left">
              Quick Links
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 hover:text-white hover:shadow-md"
                  style={{ borderColor: `${TEAL}40`, color: TEAL }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEAL)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {link.label}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}