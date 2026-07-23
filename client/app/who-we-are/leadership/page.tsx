"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import OurValuesSection from "@/components/leadership/OurValuesSection";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const PRIMARY = "#05627C";
const ACCENT = "#3FA9C8";
const GOLD = "#F5CF0B";

const leaders = [
  {
    id: 1,
    name: "Adrian Cadiz",
    title: "Chief Executive Officer",
    description:
      "With nearly two decades of experience in marketing, business operations, and strategic growth, Adrian leads Big Bull Energies with a focus on renewable energy and financial innovation.",
    image: "/leader1.jpg",
  },
  {
    id: 2,
    name: "Edward Barrington",
    title: "Chief Marketing Officer",
    description:
      "Edward oversees all marketing initiatives, driving brand development and market expansion to grow Big Bull Energies' global presence.",
    image: "/leader2.png",
  },
  {
    id: 3,
    name: "Anee Sandrova",
    title: "Relationship Manager",
    description:
      "Anee manages relations and operations in the Netherlands, coordinating Big Bull Energies wind projects and partner relationships across European markets.",
    image: "/leader3.png",
  },
  {
    id: 4,
    name: "Sophie Taylor",
    title: "Chief Financial Officer",
    description:
      "Sophie leads financial strategy, making critical decisions on investments and resource allocation to ensure sustainable growth and stability.",
    image: "/leader4.png",
  },
  {
    id: 5,
    name: "Joseph Carter",
    title: "Director of Operations",
    description:
      "Joseph leads the administrative division, handling user inquiries and ensuring smooth internal operations for all Big Bull Energies members.",
    image: "/leader5.png",
  },
];

function SectionWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1220px] mx-auto">{children}</div>
    </div>
  );
}

function GoldTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="h-px w-8 sm:w-10" style={{ backgroundColor: GOLD }} />
      <span
        className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
        style={{ color: GOLD }}
      >
        {children}
      </span>
    </div>
  );
}

export default function LeadershipPage() {
  const topRow = leaders.slice(0, 3);
  const bottomRow = leaders.slice(3, 5);

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]"
      style={{ fontFamily: FONT_STACK }}
    >
      {/* Hero */}
      <section className="relative w-full overflow-hidden min-h-[420px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[560px] flex items-center">
        <Image
          src="/images/leadership-Hero.png"
          alt="Big Bull Energies leadership"
          fill
          priority
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(232,245,240,0.96) 0%, rgba(232,245,240,0.88) 50%, rgba(232,245,240,0.3) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(232,245,240,0.97) 0%, rgba(232,245,240,0.88) 28%, rgba(232,245,240,0.45) 45%, rgba(232,245,240,0.05) 58%, transparent 70%)",
          }}
        />
        <SectionWrap>
          <div className="relative z-10 max-w-xl py-8 sm:py-10">
            <GoldTag>Who We Are</GoldTag>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-tight mb-3 sm:mb-4"
              style={{ color: PRIMARY }}
            >
              Leadership that drives{" "}
              <span style={{ color: ACCENT }}>innovation</span>
            </h1>
            <p
              className="text-xs sm:text-sm md:text-base leading-relaxed"
              style={{ color: PRIMARY, opacity: 0.75 }}
            >
              Our leadership team brings decades of combined expertise in
              renewable energy, finance, and technology to guide Big Bull
              Energies toward a sustainable future.
            </p>
          </div>
        </SectionWrap>
      </section>

      {/* Our Leadership */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <SectionWrap>
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="flex justify-center mb-4 sm:mb-5">
              <GoldTag>Our Leadership</GoldTag>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5"
              style={{ color: PRIMARY }}
            >
              Unified by our vision. Led by our experience.
            </h2>
            <p
              className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
              style={{ color: "#64748b" }}
            >
              Our leadership team brings decades of combined experience in
              renewable energy, finance, and technology to drive Big Bull
              Energies&apos; mission forward.
            </p>
          </div>

          {/* Row 1 — 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-5 sm:mb-6 lg:mb-8">
            {topRow.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} />
            ))}
          </div>

          {/* Row 2 — 2 cards centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 sm:gap-6 lg:gap-8">
            {bottomRow.map((leader, i) => (
              <div
                key={leader.id}
                className={`lg:col-span-2 ${i === 0 ? "lg:col-start-2" : "lg:col-start-4"}`}
              >
                <LeaderCard leader={leader} />
              </div>
            ))}
          </div>
        </SectionWrap>
      </section>

      <OurValuesSection />

      {/* Our Mission */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <SectionWrap>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <GoldTag>Our Mission</GoldTag>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mb-4 sm:mb-5"
                style={{ color: PRIMARY }}
              >
                We make good{" "}
                <span style={{ color: ACCENT }}>things happen.</span>
              </h2>
              <p
                className="text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-lg"
                style={{ color: "#64748b" }}
              >
                As a leading energy developer, we demonstrate our commitment to
                building relationships with the communities, customers, and
                partners with which we work. We encourage our employees to give
                back to their communities through volunteer time off.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 font-bold pl-6 pr-2 py-2.5 text-xs uppercase tracking-wide rounded-full transition hover:brightness-105"
                style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
              >
                Get In Touch
                <span className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md">
                  <ArrowRight className="w-4 h-4" style={{ color: PRIMARY }} />
                </span>
              </Link>
            </div>

            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(5,98,124,0.15)]">
              <Image
                src="/images/leadership-cta.png"
                alt="Renewable energy 3D illustration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            </div>
          </div>
        </SectionWrap>
      </section>

      <Footer />
    </main>
  );
}

function LeaderCard({
  leader,
}: {
  leader: (typeof leaders)[0];
}) {
  return (
    <div className="flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgba(5,98,124,0.1)] border border-slate-100 h-full">
      {/* Photo with gradient backdrop */}
      <div className="relative h-[260px] sm:h-[280px] md:h-[300px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #c8e8f2 0%, #e8f5f0 55%, #ffffff 100%)",
          }}
        />
        <Image
          src={leader.image}
          alt={leader.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 380px"
        />
      </div>

      {/* Info */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 relative">
        <h3
          className="text-lg sm:text-xl font-bold mb-1"
          style={{ color: PRIMARY }}
        >
          {leader.name}
        </h3>
        <p
          className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4"
          style={{ color: ACCENT }}
        >
          {leader.title}
        </p>
        <p
          className="text-xs sm:text-sm leading-relaxed flex-1 mb-4"
          style={{ color: "#64748b" }}
        >
          {leader.description}
        </p>
        <Link
          href="/contact"
          className="self-end w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition hover:scale-105"
          style={{ backgroundColor: ACCENT }}
          aria-label={`Contact ${leader.name}`}
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>
    </div>
  );
}
