"use client";

import Footer from "@/components/Footer";

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "156px" }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#05627C" }}>
            Compliance
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div
            className="bg-white rounded-lg shadow-sm p-8 space-y-6"
            style={{ borderColor: "#E5E7EB" }}
          >
            <section>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#05627C" }}
              >
                Regulatory Compliance
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Big Bull Energies is committed to maintaining the highest
                standards of regulatory compliance. We adhere to all applicable
                laws and regulations governing financial services and investment
                platforms.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#05627C" }}
              >
                Financial Regulations
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We comply with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Anti-money laundering (AML) regulations</li>
                <li>Know Your Customer (KYC) requirements</li>
                <li>Data protection and privacy regulations</li>
                <li>Financial services licensing requirements</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#05627C" }}
              >
                Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement robust data protection measures in accordance with
                applicable data protection laws. Your personal and financial
                information is encrypted and stored securely.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#05627C" }}
              >
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                For any compliance-related inquiries, please contact us through
                our support system.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
