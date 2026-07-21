"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  DollarSign,
  Gift,
  GraduationCap,
  Headphones,
  Image as ImageIcon,
  KeyRound,
  Network,
  Star,
  Tag,
  TrendingUp,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

const PRIMARY = "#05627C";
const MINT = "#E8F5F0";
const FONT_HEADING = "var(--font-font4), sans-serif";

type ResourceGroup = "Getting Started" | "Earning & Growth" | "Support & Resources";

type Resource = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  group: ResourceGroup;
};

const resources: Resource[] = [
  {
    icon: GraduationCap,
    title: "How Platform Works",
    description:
      "Complete step-by-step guide to understanding the Big Bull Energies platform, from registration to earning.",
    href: "/how-platform-works",
    group: "Getting Started",
  },
  {
    icon: UserPlus,
    title: "How to Start",
    description:
      "New to Big Bull Energies? Learn how to create an account, make your first investment, and begin earning.",
    href: "/how-to-start",
    group: "Getting Started",
  },
  {
    icon: TrendingUp,
    title: "Investment Plans",
    description:
      "Explore our investment packages, ROI rates, and understand how daily returns work.",
    href: "/our-plan",
    group: "Earning & Growth",
  },
  {
    icon: Network,
    title: "Binary System",
    description:
      "Understand how the binary tree structure works and how to maximize your binary income.",
    href: "/binary-investment-system",
    group: "Earning & Growth",
  },
  {
    icon: Award,
    title: "Career Rewards",
    description:
      "Unlock exclusive rewards, bonuses, and recognition as you progress through career levels.",
    href: "/career-rewards",
    group: "Earning & Growth",
  },
  {
    icon: DollarSign,
    title: "Earning Methods",
    description:
      "Learn about ROI, referral income, binary bonuses, and all the ways you can earn.",
    href: "/our-plan",
    group: "Earning & Growth",
  },
  {
    icon: Headphones,
    title: "FAQ & Support",
    description:
      "Find answers to common questions and get help from our support team.",
    href: "/support",
    group: "Support & Resources",
  },
  {
    icon: ImageIcon,
    title: "Gallery",
    description:
      "View photos and videos of our solar plants, office spaces, and events.",
    href: "/gallery",
    group: "Support & Resources",
  },
];

const groupMeta: { key: ResourceGroup; label: string; cols: "2" | "3" }[] = [
  { key: "Getting Started", label: "GETTING STARTED", cols: "2" },
  { key: "Earning & Growth", label: "EARNINGS & GROWTH", cols: "3" },
  { key: "Support & Resources", label: "SUPPORT & RESOURCES", cols: "2" },
];

const quickLinks = [
  { label: "Referral Income", href: "/referral-income", icon: Gift, color: PRIMARY },
  { label: "Daily ROI Payouts", href: "/daily-roi-payouts", icon: BarChart3, color: PRIMARY },
  { label: "Career Levels", href: "/career-levels-info", icon: Star, color: "#E8A317" },
  { label: "Voucher System", href: "/voucher-system", icon: Tag, color: PRIMARY },
];

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function ResourceCard({
  icon: Icon,
  title,
  description,
  href,
  delay = 0,
  visible,
}: Omit<Resource, "group"> & { delay?: number; visible: boolean }) {
  return (
    <Link
      href={href}
      className={`learn-more-card group flex flex-col bg-white rounded-2xl p-7 sm:p-8 transition-all duration-500 h-full ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{
        boxShadow: "0 4px 24px rgba(5,98,124,0.07)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: MINT }}
      >
        <Icon className="w-[22px] h-[22px]" style={{ color: PRIMARY }} strokeWidth={1.75} />
      </div>

      <h4
        className="text-[17px] sm:text-[18px] font-bold mb-2.5 leading-snug"
        style={{ color: "#1e3a42" }}
      >
        {title}
      </h4>

      <p className="text-[13px] sm:text-[14px] leading-[1.65] mb-6 flex-1" style={{ color: "#7a8a92" }}>
        {description}
      </p>

      <span
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all duration-300 group-hover:gap-2.5"
        style={{ color: PRIMARY }}
      >
        Learn more
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default function LearnMoreSection() {
  const { ref: sectionRef, visible } = useInView();

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-14 sm:py-16 md:py-20 lg:py-24"
      style={{ backgroundColor: "#F5F7F8" }}
    >
      {/* Top-left concentric arcs */}
      <svg
        className="pointer-events-none absolute top-8 left-0 w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] opacity-[0.35]"
        viewBox="0 0 360 360"
        fill="none"
        aria-hidden
      >
        {[60, 100, 140, 180, 220, 260].map((r) => (
          <circle
            key={r}
            cx="0"
            cy="180"
            r={r}
            stroke="#b0c4cc"
            strokeWidth="0.8"
            opacity={0.4 - r * 0.001}
          />
        ))}
      </svg>

      {/* Top-right faded energy image */}
      <div className="pointer-events-none absolute top-0 right-0 w-[45%] sm:w-[40%] lg:w-[36%] h-[320px] sm:h-[380px] opacity-[0.55]">
        <Image
          src="/images/cta-turbines.png"
          alt=""
          fill
          className="object-cover object-left-top"
          sizes="40vw"
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, transparent 20%, #F5F7F8 75%)",
          }}
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1220px] mx-auto">
          {/* Header */}
          <div
            className={`text-center mb-12 sm:mb-14 md:mb-16 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-4 py-2 rounded-full bg-white border border-[#dce4e8] shadow-sm">
              <KeyRound className="w-3.5 h-3.5" style={{ color: PRIMARY }} strokeWidth={2} />
              <span
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em]"
                style={{ color: PRIMARY }}
              >
                Learn More
              </span>
            </div>

            <h2
              className="text-[2rem] sm:text-[2.75rem] md:text-[3rem] lg:text-[3.25rem] font-bold leading-[1.12] mb-4 sm:mb-5 px-2"
              style={{ fontFamily: FONT_HEADING, color: "#1a2e35" }}
            >
              Everything{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${PRIMARY} 0%, #0a8faa 100%)`,
                }}
              >
                you
              </span>{" "}
              need to know
            </h2>

            <p
              className="text-sm sm:text-[15px] md:text-base leading-relaxed max-w-xl mx-auto"
              style={{ color: "#6b7c85" }}
            >
              Comprehensive guides and resources to help you understand how Big
              Bull Energies works and maximize your earning potential.
            </p>
          </div>

          {/* Category sections */}
          <div className="space-y-10 sm:space-y-12">
            {groupMeta.map((group, gi) => {
              const items = resources.filter((r) => r.group === group.key);
              return (
                <div key={group.key}>
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-[3px] h-5 rounded-full shrink-0"
                        style={{ backgroundColor: PRIMARY }}
                      />
                      <h3
                        className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: "#3d5058" }}
                      >
                        {group.label}
                      </h3>
                    </div>
                    <span className="text-[12px] sm:text-[13px]" style={{ color: "#94a3ad" }}>
                      {items.length} guide{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Cards grid */}
                  <div
                    className={`grid grid-cols-1 gap-4 sm:gap-5 ${
                      group.cols === "3"
                        ? "sm:grid-cols-2 lg:grid-cols-3"
                        : "sm:grid-cols-2"
                    }`}
                  >
                    {items.map((item, i) => (
                      <ResourceCard
                        key={item.title}
                        {...item}
                        visible={visible}
                        delay={150 + gi * 80 + i * 60}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Links bar */}
          <div
            className={`mt-12 sm:mt-14 md:mt-16 rounded-2xl border bg-white px-5 sm:px-6 py-5 sm:py-6 transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ borderColor: "#e2e8ec", boxShadow: "0 2px 12px rgba(5,98,124,0.04)" }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <p
                className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.14em] shrink-0"
                style={{ color: "#1e3a42" }}
              >
                Quick Links
              </p>

              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="learn-more-quick-link inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white border text-[12px] sm:text-[13px] font-medium transition-all duration-300"
                      style={{
                        borderColor: "#dce4e8",
                        color: "#3d5058",
                        boxShadow: "0 1px 4px rgba(5,98,124,0.06)",
                      }}
                    >
                      <Icon className="w-4 h-4 shrink-0" style={{ color: link.color }} strokeWidth={1.75} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
