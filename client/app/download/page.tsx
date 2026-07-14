"use client";

import Footer from "@/components/Footer";
import { Download } from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "156px" }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto mb-6 text-[#05627C]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: "#05627C" }}
          >
            Download Brochure
          </h1>
          <div
            className="bg-white rounded-lg shadow-sm p-8 md:p-12 mb-8"
            style={{ borderColor: "#E5E7EB" }}
          >
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Download our comprehensive brochure to learn more about Big Bull
              Energies, our renewable energy projects, and investment
              opportunities.
            </p>
            <a
              href="/crown-bankers-brochure.pdf"
              download="Crown-Bankers-Brochure.pdf"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-white transition hover:opacity-90 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: "#05627C" }}
            >
              <Download className="w-5 h-5" />
              Download PDF Brochure
            </a>
            <p className="text-sm text-gray-500 mt-4">
              PDF file • Opens in new tab
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/contact"
              className="inline-block px-8 py-3 rounded-lg font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#05627C" }}
            >
              Contact Us
            </a>
            <a
              href="/"
              className="inline-block px-8 py-3 rounded-lg font-semibold border transition hover:bg-gray-100"
              style={{ borderColor: "#05627C", color: "#05627C" }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
