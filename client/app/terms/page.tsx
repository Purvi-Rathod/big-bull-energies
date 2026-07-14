"use client";

import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "156px" }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#042B19" }}>
            Terms of Service
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
                style={{ color: "#042B19" }}
              >
                Agreement to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using Big Bull Energies, you agree to be bound
                by these Terms of Service and all applicable laws and
                regulations. If you do not agree with any of these terms, you
                are prohibited from using our platform.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#042B19" }}
              >
                Account Registration
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use our services, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>
                  Be at least 18 years old or the age of majority in your
                  jurisdiction
                </li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#042B19" }}
              >
                Investment Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                All investments are subject to the terms and conditions of the
                specific investment package you choose. Returns are calculated
                based on the package terms, and principal returns are guaranteed
                as specified in your chosen package.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#042B19" }}
              >
                Prohibited Activities
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Use the platform for any illegal or unauthorized purpose
                </li>
                <li>
                  Attempt to gain unauthorized access to any part of the
                  platform
                </li>
                <li>Interfere with or disrupt the platform or servers</li>
                <li>
                  Use automated systems to access the platform without
                  permission
                </li>
              </ul>
            </section>

            <section>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#042B19" }}
              >
                Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Big Bull Energies shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages
                resulting from your use of the platform.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
