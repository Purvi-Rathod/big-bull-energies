"use client";

import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

// PDFs in public/ – encode spaces for URLs
const UK_PDF = "/Crown%20Bankers%20UK%20Legal.pdf";
const NZ_PDF = "/Crown%20Bankers%20NZ%20Legal.pdf";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />

      {/* Hero */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            Legal{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Documents
            </span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Official legal documents for Big Bull Energies by jurisdiction
          </p>
        </div>
      </section>

      {/* Documents */}
      <section className="relative py-12 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* UK Legal */}
            <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl" aria-hidden>
                  🇬🇧
                </span>
                <h2 className="text-2xl font-bold text-white">
                  United Kingdom
                </h2>
              </div>
              <p className="text-white/70 mb-6">
                Big Bull Energies UK legal documentation and terms applicable to
                UK users.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={UK_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View PDF
                </a>
                <a
                  href={UK_PDF}
                  download="Big Bull Energies UK Legal.pdf"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 text-white font-semibold rounded-xl border border-yellow-500/30 hover:bg-white/20 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </a>
              </div>
            </div>

            {/* NZ Legal */}
            <div className="p-8 bg-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl" aria-hidden>
                  🇳🇿
                </span>
                <h2 className="text-2xl font-bold text-white">New Zealand</h2>
              </div>
              <p className="text-white/70 mb-6">
                Big Bull Energies NZ legal documentation and terms applicable to
                New Zealand users.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={NZ_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View PDF
                </a>
                <a
                  href={NZ_PDF}
                  download="Big Bull Energies NZ Legal.pdf"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 text-white font-semibold rounded-xl border border-yellow-500/30 hover:bg-white/20 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          </div>

          <p className="text-center text-white/50 text-sm mt-10">
            For questions about these documents, please{" "}
            <Link href="/support" className="text-yellow-400 hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
