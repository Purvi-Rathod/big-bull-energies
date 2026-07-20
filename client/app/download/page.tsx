"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Download, FileText, ArrowUpRight, Home } from "lucide-react";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const PRIMARY = "#05627C";

const GOLD = "#F5B300";

export default function DownloadPage() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ fontFamily: FONT_STACK, paddingTop: "156px" }}
    >
      {/* Hero / brochure section with full-bleed background image */}
      <section className="relative w-full">
        <div className="relative w-full min-h-[820px] md:min-h-[880px] flex flex-col overflow-hidden">
          {/* Background image - place your local image at /public/images/download-hero.png */}
          <Image
            src="/images/download-hero.png"
            alt="Big Bull Energies wind turbines and solar panels landscape"
            fill
            priority
            className="object-cover"
          />
          {/* Soft radial fade so the card + text stay legible over the photo */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 38%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.15) 70%, rgba(255,255,255,0) 100%)",
            }}
          />

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center pt-16 sm:pt-20 md:pt-32 pb-24">
            <div className="max-w-3xl w-full text-center mx-auto">
              {/* Icon badge */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed"
                  style={{ borderColor: "rgba(5,98,124,0.35)" }}
                />
                <div
                  className="absolute inset-2 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Download className="w-9 h-9 text-white" />
                </div>
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
                <span
                  className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
              </div>

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{ color: PRIMARY }}
              >
                Download <span style={{ color: PRIMARY }}>Brochure</span>
              </h1>
              <div
                className="h-1 w-16 mx-auto mb-8 rounded-full"
                style={{ backgroundColor: GOLD }}
              />

              <p
                className="text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
                style={{ color: PRIMARY, opacity: 0.75 }}
              >
                Download our comprehensive brochure to learn more about Big
                Bull Energies, our renewable energy projects, and investment
                opportunities.
              </p>

              {/* White brochure card */}
              <div className="relative bg-white rounded-2xl shadow-xl px-6 sm:px-10 md:px-14 py-10 sm:py-12 mb-10 overflow-hidden">
                {/* decorative dot grids */}
                <div
                  className="absolute top-6 left-6 w-16 h-16 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(11,31,58,0.12) 1.5px, transparent 1.5px)",
                    backgroundSize: "10px 10px",
                  }}
                />
                <div
                  className="absolute bottom-6 right-6 w-16 h-16 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(11,31,58,0.12) 1.5px, transparent 1.5px)",
                    backgroundSize: "10px 10px",
                  }}
                />

                <div className="relative flex flex-col items-center">
                  <div
                    className="relative w-16 h-16 rounded-lg flex items-center justify-center mb-6 border-2"
                    style={{ borderColor: "rgba(5,98,124,0.35)" }}
                  >
                    <FileText className="w-8 h-8" style={{ color: PRIMARY }} strokeWidth={1.5} />
                    <span
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      PDF
                    </span>
                  </div>

                  <a
                    href="/crown-bankers-brochure.pdf"
                    download="Big-Bull-Energies-Brochure.pdf"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-white transition hover:opacity-90 shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    <Download className="w-5 h-5" />
                    Download PDF Brochure
                  </a>

                  <p className="text-sm mt-4" style={{ color: PRIMARY, opacity: 0.55 }}>
                    PDF file &nbsp;•&nbsp; Opens in new tab
                  </p>
                </div>
              </div>

              {/* Secondary actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-white transition hover:opacity-90 shadow-md"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Contact Us
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold border-2 bg-white/90 transition hover:bg-white"
                  style={{ borderColor: PRIMARY, color: PRIMARY }}
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}