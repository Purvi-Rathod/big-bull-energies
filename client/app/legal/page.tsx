"use client";

import Link from "next/link";
import {
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  Scale,
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";
const DARK = "#0B1F2A";
const MUTED = "#6b7c85";
const ACCENT = "#3FA9C8";
const FONT_HEADING = "var(--font-font4), sans-serif";

const DOCUMENTS = [
  {
    id: "uk",
    region: "United Kingdom",
    code: "UK",
    description:
      "Legal documentation and terms applicable to Big Bull Energies users in the United Kingdom.",
    href: encodeURI("/Crown Bankers UK Legal.pdf"),
    downloadName: "Big Bull Energies UK Legal.pdf",
  },
  {
    id: "nz",
    region: "New Zealand",
    code: "NZ",
    description:
      "Legal documentation and terms applicable to Big Bull Energies users in New Zealand.",
    href: encodeURI("/Crown Bankers NZ Legal.pdf"),
    downloadName: "Big Bull Energies NZ Legal.pdf",
  },
];

export default function LegalPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* Hero */}
      <section className="relative w-full pt-28 sm:pt-32 lg:pt-36 pb-14 sm:pb-16 lg:pb-20 overflow-hidden">
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
                  Legal Documents
                </span>
              </div>

              <h1
                className="text-[2.15rem] sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] mb-4 sm:mb-5"
                style={{ fontFamily: FONT_HEADING, color: DARK }}
              >
                Official documents by{" "}
                <span style={{ color: PRIMARY }}>jurisdiction</span>
              </h1>

              <p
                className="text-sm sm:text-[15px] md:text-base leading-relaxed max-w-lg"
                style={{ color: MUTED }}
              >
                Download or view the legal documents that apply to Big Bull
                Energies in your region.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="relative w-full pb-14 sm:pb-16 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1220px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {DOCUMENTS.map((doc) => (
              <article
                key={doc.id}
                className="relative flex flex-col p-6 sm:p-8 rounded-2xl border bg-white"
                style={{
                  borderColor: "rgba(5,98,124,0.12)",
                  boxShadow: "0 18px 48px rgba(5,98,124,0.06)",
                }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <span
                    className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(5,98,124,0.1)" }}
                  >
                    <MapPin
                      className="w-5 h-5"
                      style={{ color: PRIMARY }}
                      strokeWidth={1.75}
                    />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1"
                      style={{ color: ACCENT }}
                    >
                      {doc.code}
                    </p>
                    <h2
                      className="text-xl sm:text-2xl font-bold"
                      style={{ fontFamily: FONT_HEADING, color: DARK }}
                    >
                      {doc.region}
                    </h2>
                  </div>
                </div>

                <p
                  className="text-sm sm:text-[15px] leading-relaxed mb-6 flex-1"
                  style={{ color: MUTED }}
                >
                  {doc.description}
                </p>

                <div
                  className="flex items-center gap-2.5 mb-6 py-3 px-3.5 rounded-xl"
                  style={{ backgroundColor: "#F4F8F9" }}
                >
                  <FileText
                    className="w-4 h-4 shrink-0"
                    style={{ color: PRIMARY }}
                  />
                  <span
                    className="text-xs sm:text-sm font-medium truncate"
                    style={{ color: DARK }}
                  >
                    {doc.downloadName}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gas-cta-gold group inline-flex items-center gap-2 font-bold px-5 py-3 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg transition-all duration-300"
                    style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View PDF
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href={doc.href}
                    download={doc.downloadName}
                    className="inline-flex items-center gap-2 font-bold px-5 py-3 text-xs sm:text-sm uppercase tracking-[0.06em] rounded-lg border transition-colors hover:bg-[#F4F8F9]"
                    style={{ borderColor: "rgba(5,98,124,0.22)", color: PRIMARY }}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Help strip */}
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
              <Scale className="w-6 h-6" style={{ color: GOLD }} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2
                className="text-lg sm:text-xl lg:text-[1.35rem] font-bold text-white leading-snug mb-1"
                style={{ fontFamily: FONT_HEADING }}
              >
                Questions about these documents?
              </h2>
              <p className="text-sm text-white/75">
                Our team can help you find the right legal information for your
                region.
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
