"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Compass,
  FileText,
  HelpCircle,
  Leaf,
  Lock,
  Map,
  Network,
  Sun,
  UserPlus,
  Users,
  Wind,
  Zap,
  Battery,
  Cog,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";
const DARK = "#0B1F2A";
const MUTED = "#6b7c85";
const ACCENT = "#3FA9C8";
const FONT_HEADING = "var(--font-font4), sans-serif";

type SitemapLink = {
  title: string;
  href: string;
  description?: string;
  icon?: typeof Compass;
};

type SitemapSection = {
  title: string;
  description: string;
  icon: typeof Compass;
  links: SitemapLink[];
};

const SECTIONS: SitemapSection[] = [
  {
    title: "Explore",
    description: "Core pages across the Big Bull Energies site.",
    icon: Compass,
    links: [
      { title: "Home", href: "/", description: "Start here" },
      { title: "Our Plan", href: "/our-plan", description: "Investment plans" },
      { title: "Projects", href: "/projects", description: "Portfolio overview" },
      { title: "Gallery", href: "/gallery", description: "Visual stories" },
      { title: "Download", href: "/download", description: "Resources & files" },
      { title: "Contact Us", href: "/contact", description: "Get in touch" },
    ],
  },
  {
    title: "Energy Technologies",
    description: "Explore how we generate, store, and deliver energy.",
    icon: Zap,
    links: [
      {
        title: "Wind Energy",
        href: "/energy-technologies/wind",
        icon: Wind,
      },
      {
        title: "Turbine Systems",
        href: "/energy-technologies/turbines",
        icon: Cog,
      },
      {
        title: "Wind Farm Operations",
        href: "/energy-technologies/geothermal",
        icon: Activity,
      },
      { title: "Energy Storage", href: "/energy-technologies/storage", icon: Battery },
      {
        title: "Grid Connection",
        href: "/energy-technologies/transmission",
        icon: Network,
      },
      {
        title: "Hybrid Solar",
        href: "/energy-technologies/solar",
        icon: Sun,
      },
    ],
  },
  {
    title: "Who We Are",
    description: "Learn about our company and leadership.",
    icon: Building2,
    links: [
      { title: "About Us", href: "/who-we-are/about", icon: Leaf },
      { title: "Leadership", href: "/who-we-are/leadership", icon: Users },
    ],
  },
  {
    title: "Account",
    description: "Access your account or create a new one.",
    icon: Lock,
    links: [
      { title: "Login", href: "/login", description: "Sign in to your account" },
      {
        title: "Sign Up",
        href: "/signup",
        description: "Create a new account",
        icon: UserPlus,
      },
      {
        title: "Forgot Password",
        href: "/forgot-password",
        description: "Reset your password",
      },
    ],
  },
  {
    title: "Help & Resources",
    description: "Answers, support, and platform guides.",
    icon: HelpCircle,
    links: [
      { title: "FAQ", href: "/faq" },
      { title: "Support", href: "/support" },
      { title: "How to Start", href: "/how-to-start" },
      { title: "How It Works", href: "/how-it-works" },
      { title: "How Platform Works", href: "/how-platform-works" },
    ],
  },
  {
    title: "Legal & Policies",
    description: "Documents and policies that govern our platform.",
    icon: FileText,
    links: [
      { title: "Legal Documents", href: "/legal" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Privacy & Terms", href: "/policy" },
      { title: "Compliance", href: "/compliance" },
      { title: "Cookie Preferences", href: "/cookie-preferences" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* Hero */}
      <section className="relative w-full pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-14 lg:pb-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(165deg, #F4F8F9 0%, #FFFFFF 48%, #EEF4F6 100%)",
          }}
        />
        <div
          className="absolute -top-24 right-0 w-[55%] max-w-[640px] h-[420px] pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(5,98,124,0.14) 0%, transparent 70%)",
          }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto">
            <motion.div
              className="max-w-2xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="h-px w-10" style={{ backgroundColor: GOLD }} />
                <span
                  className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: PRIMARY }}
                >
                  Site Directory
                </span>
              </div>

              <h1
                className="text-[2.15rem] sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] mb-4 sm:mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Find every page in{" "}
                <span style={{ color: PRIMARY }}>one place</span>
              </h1>

              <p
                className="text-sm sm:text-[15px] md:text-base leading-relaxed max-w-lg"
                style={{ color: MUTED }}
              >
                Browse the full map of Big Bull Energies — from energy
                technologies and company pages to account access and legal
                resources.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="relative w-full pb-14 sm:pb-16 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {SECTIONS.map(({ title, description, icon: SectionIcon, links }) => (
              <section
                key={title}
                className="rounded-2xl border p-5 sm:p-6 lg:p-7 bg-white"
                style={{
                  borderColor: "rgba(5,98,124,0.12)",
                  boxShadow: "0 16px 40px rgba(5,98,124,0.05)",
                }}
              >
                <div className="flex items-start gap-3.5 mb-5 sm:mb-6">
                  <span
                    className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(5,98,124,0.1)" }}
                  >
                    <SectionIcon
                      className="w-5 h-5"
                      style={{ color: PRIMARY }}
                      strokeWidth={1.75}
                    />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h2
                      className="text-lg sm:text-xl font-bold mb-1"
                      style={{ fontFamily: FONT_HEADING, color: DARK }}
                    >
                      {title}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                      {description}
                    </p>
                  </div>
                </div>

                <ul className="space-y-1">
                  {links.map((link) => {
                    const LinkIcon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F4F8F9]"
                        >
                          <span
                            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "rgba(5,98,124,0.06)" }}
                          >
                            {LinkIcon ? (
                              <LinkIcon
                                className="w-3.5 h-3.5"
                                style={{ color: PRIMARY }}
                                strokeWidth={1.75}
                              />
                            ) : (
                              <ArrowUpRight
                                className="w-3.5 h-3.5"
                                style={{ color: ACCENT }}
                                strokeWidth={1.75}
                              />
                            )}
                          </span>

                          <span className="flex-1 min-w-0">
                            <span
                              className="block text-sm sm:text-[15px] font-semibold"
                              style={{ color: DARK }}
                            >
                              {link.title}
                            </span>
                            {link.description && (
                              <span
                                className="block text-xs mt-0.5"
                                style={{ color: MUTED }}
                              >
                                {link.description}
                              </span>
                            )}
                          </span>

                          <ArrowRight
                            className="w-4 h-4 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                            style={{ color: PRIMARY }}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative w-full pb-12 sm:pb-14 lg:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="max-w-[1220px] mx-auto rounded-2xl sm:rounded-3xl px-6 sm:px-8 lg:px-10 py-7 sm:py-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-6"
            style={{
              background:
                "linear-gradient(135deg, #05627C 0%, #0A4A5C 55%, #083D4A 100%)",
              boxShadow: "0 20px 50px rgba(5,98,124,0.22)",
            }}
          >
            <div
              className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Map className="w-6 h-6" style={{ color: GOLD }} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2
                className="text-lg sm:text-xl lg:text-[1.35rem] font-bold text-white leading-snug mb-1"
                style={{ fontFamily: FONT_HEADING }}
              >
                Looking for something specific?
              </h2>
              <p className="text-sm text-white/75">
                Reach out and we&apos;ll help you find the right page or resource.
              </p>
            </div>

            <Link
              href="/contact"
              className="gas-cta-gold group inline-flex items-center gap-2.5 font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300 shrink-0"
              style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
            >
              Contact Us
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
