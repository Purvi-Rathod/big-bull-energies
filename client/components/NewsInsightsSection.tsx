"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  FileText,
  Globe2,
  Leaf,
  Star,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";
const FONT_HEADING = "var(--font-font4), sans-serif";

const featuredArticle = {
  date: "JAN 15, 2025",
  category: "NEWS",
  headline:
    "Big Bull Energies Advances Wind-Led Clean Power Strategy Across Global Markets",
  excerpt:
    "Big Bull Energies deepens its focus on wind energy technologies, turbine systems, and renewable investment programs that connect clean generation with long-term platform growth.",
  image: "/images/leadership-Hero.png",
};

const newsArticles = [
  {
    date: "JAN 10, 2025",
    category: "NEWS",
    headline:
      "Big Bull Energies Expands Solar Energy Investment Portfolio Across Multiple Regions",
    excerpt:
      "Big Bull Energies announces significant expansion of its solar energy investment portfolio, with new projects launching in key markets.",
    image: "/images/solar-sunset.png",
    icon: Sun,
  },
  {
    date: "JAN 5, 2025",
    category: "ANNOUNCEMENT",
    headline:
      "Big Bull Energies Reaches Milestone: 10,000 Active Investors Worldwide",
    excerpt:
      "Big Bull Energies celebrates a major milestone as the platform reaches 10,000 active investors globally.",
    image: "/images/founding-vision.png",
    icon: Globe2,
  },
  {
    date: "DEC 28, 2024",
    category: "NEWS",
    headline:
      "New Investment Packages Released: Enhanced Returns for Big Bull Energies Members",
    excerpt:
      "Big Bull Energies introduces new investment packages with enhanced returns and flexible terms.",
    image: "/images/plan-hero.png",
    icon: TrendingUp,
  },
];

const insightCategories = [
  {
    icon: FileText,
    title: "Industry Insights",
    subtitle: "In-depth analysis & trends",
  },
  {
    icon: BarChart3,
    title: "Company Updates",
    subtitle: "Latest milestones & news",
  },
  {
    icon: Leaf,
    title: "Sustainable Trends",
    subtitle: "Green energy innovations",
  },
  {
    icon: Users,
    title: "Investor Stories",
    subtitle: "Success from our community",
  },
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

function MetaRow({ date, category }: { date: string; category: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide">
      <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: PRIMARY }} strokeWidth={2} />
      <span style={{ color: PRIMARY }}>{date}</span>
      <span className="w-1 h-1 rounded-full bg-slate-300" />
      <span style={{ color: "#3FA9C8" }}>{category}</span>
    </div>
  );
}

export default function NewsInsightsSection() {
  const { ref: sectionRef, visible } = useInView();

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-14 sm:py-16 md:py-20 lg:py-24"
      style={{ backgroundColor: "#F5F7F8" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1220px] mx-auto">
          {/* Header */}
          <div
            className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 sm:mb-12 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em]"
                  style={{ color: PRIMARY }}
                >
                  Stay Informed
                </span>
                <div className="h-px w-10 sm:w-14 bg-slate-300" />
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PRIMARY }} />
              </div>

              <h2
                className="text-[2rem] sm:text-[2.5rem] md:text-[2.75rem] lg:text-[3rem] font-bold leading-[1.1] mb-3"
                style={{ fontFamily: FONT_HEADING, color: "#1a2e35" }}
              >
                News{" "}
                <span style={{ color: PRIMARY }}>&amp; Insights</span>
              </h2>

              <div className="h-[2px] w-12 mb-4" style={{ backgroundColor: GOLD }} />

              <p
                className="text-sm sm:text-[15px] leading-relaxed max-w-lg"
                style={{ color: "#6b7c85" }}
              >
                Explore the latest announcements, achievements, and insights
                shaping the future of renewable energy and investments.
              </p>
            </div>

            <Link
              href="/gallery"
              className="news-view-all-btn inline-flex items-center gap-2.5 self-start lg:self-auto font-bold px-5 sm:px-6 py-3 text-[11px] sm:text-xs uppercase tracking-[0.08em] rounded-lg transition-all duration-300 shrink-0"
              style={{ backgroundColor: PRIMARY, color: "#fff" }}
            >
              View All News
              <ArrowRight className="w-4 h-4" style={{ color: GOLD }} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5 lg:gap-6 mb-8 sm:mb-10">
            {/* Featured card */}
            <article
              className={`news-featured-card relative bg-white rounded-[20px] overflow-hidden transition-all duration-700 delay-100 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ boxShadow: "0 8px 40px rgba(5,98,124,0.1)" }}
            >
              <div className="relative h-[220px] sm:h-[260px] md:h-[280px]">
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.headline}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 620px"
                  priority
                />
                <div
                  className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Star className="w-3 h-3" style={{ color: GOLD }} fill={GOLD} />
                  Featured
                </div>
              </div>

              {/* Wave transition */}
              <div className="relative -mt-8 sm:-mt-10">
                <svg
                  className="w-full h-8 sm:h-10 text-white"
                  viewBox="0 0 600 40"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    fill="currentColor"
                    d="M0,40 L0,18 Q150,0 300,14 T600,10 L600,40 Z"
                  />
                </svg>

                <div className="relative px-6 sm:px-8 pb-7 sm:pb-8 pt-1 bg-white">
                  {/* Decorative contour lines */}
                  <svg
                    className="absolute right-4 bottom-6 w-24 h-24 opacity-[0.12] pointer-events-none"
                    viewBox="0 0 100 100"
                    fill="none"
                    aria-hidden
                  >
                    {[20, 35, 50, 65, 80].map((r) => (
                      <circle key={r} cx="100" cy="100" r={r} stroke={PRIMARY} strokeWidth="0.8" />
                    ))}
                  </svg>

                  <MetaRow date={featuredArticle.date} category={featuredArticle.category} />

                  <h3
                    className="mt-3 text-xl sm:text-2xl md:text-[1.65rem] font-bold leading-snug mb-3 pr-4"
                    style={{ fontFamily: FONT_HEADING, color: "#1a2e35" }}
                  >
                    {featuredArticle.headline}
                  </h3>

                  <p className="text-[13px] sm:text-sm leading-relaxed mb-5 max-w-xl" style={{ color: "#7a8a92" }}>
                    {featuredArticle.excerpt}
                  </p>

                  <Link
                    href="/gallery"
                    className="group inline-flex items-center gap-3 text-[12px] sm:text-[13px] font-bold uppercase tracking-wide transition-all duration-300"
                    style={{ color: PRIMARY }}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </span>
                    Read Full Story
                  </Link>
                </div>
              </div>
            </article>

            {/* News list */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {newsArticles.map((article, i) => {
                const Icon = article.icon;
                return (
                  <article
                    key={article.headline}
                    className={`news-list-card group relative flex gap-4 sm:gap-5 bg-white rounded-[18px] p-4 sm:p-5 transition-all duration-500 ${
                      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
                    style={{
                      boxShadow: "0 4px 24px rgba(5,98,124,0.07)",
                      transitionDelay: `${200 + i * 80}ms`,
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-[88px] sm:w-[100px] h-[88px] sm:h-[100px] rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={article.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-10 sm:pr-12">
                      <MetaRow date={article.date} category={article.category} />
                      <h4
                        className="mt-2 text-[15px] sm:text-base font-bold leading-snug mb-1.5 line-clamp-2"
                        style={{ fontFamily: FONT_HEADING, color: "#1a2e35" }}
                      >
                        {article.headline}
                      </h4>
                      <p className="text-[12px] sm:text-[13px] leading-relaxed line-clamp-2" style={{ color: "#7a8a92" }}>
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Arrow button */}
                    <Link
                      href="/gallery"
                      className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                      style={{ backgroundColor: PRIMARY }}
                      aria-label={`Read ${article.headline}`}
                    >
                      <ArrowRight className="w-4 h-4" style={{ color: GOLD }} strokeWidth={2.5} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Bottom insight bar */}
          <div
            className={`relative rounded-[18px] overflow-hidden transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ backgroundColor: PRIMARY }}
          >
            {/* Topographic pattern */}
            <svg
              className="absolute right-0 top-0 h-full w-[45%] opacity-[0.15] pointer-events-none"
              viewBox="0 0 400 120"
              preserveAspectRatio="xMaxYMid slice"
              aria-hidden
            >
              {[15, 30, 45, 60, 75, 90].map((r, i) => (
                <circle
                  key={r}
                  cx="400"
                  cy="60"
                  r={r * 2}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.6"
                  opacity={0.3 + i * 0.05}
                />
              ))}
            </svg>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {insightCategories.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-5 sm:py-6 ${
                      i < insightCategories.length - 1
                        ? "lg:border-r border-white/15"
                        : ""
                    } ${i % 2 === 0 && i < insightCategories.length - 1 ? "sm:border-r border-white/15" : ""}`}
                  >
                    <div className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm sm:text-[15px] font-bold text-white leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
