"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function SitemapPage() {
  const links = [
    { title: "Home", href: "/" },
    { title: "Our Plan", href: "/our-plan" },
    { title: "Energy Technologies", href: "/energy-technologies" },
    { title: "Who We Are", href: "/who-we-are/about" },
    { title: "Contact", href: "/contact" },
    { title: "FAQ", href: "/faq" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Download", href: "/download" },
    { title: "Login", href: "/login" },
    { title: "Sign Up", href: "/signup" },
  ];

  const energyTechLinks = [
    { title: "Natural Gas", href: "/energy-technologies/natural-gas" },
    { title: "Solar", href: "/energy-technologies/solar" },
    { title: "Wind", href: "/energy-technologies/wind" },
    { title: "Storage", href: "/energy-technologies/storage" },
    { title: "Transmission", href: "/energy-technologies/transmission" },
    { title: "Geothermal", href: "/energy-technologies/geothermal" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "156px" }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#042B19" }}>
            Sitemap
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find all pages and sections of our website
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8" style={{ borderColor: "#E5E7EB" }}>
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#042B19" }}>
                Main Pages
              </h2>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-blue-600 hover:underline transition"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "#042B19" }}>
                Energy Technologies
              </h2>
              <ul className="space-y-2">
                {energyTechLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-blue-600 hover:underline transition"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}



