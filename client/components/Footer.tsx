import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="w-full relative overflow-hidden"
      style={{ backgroundColor: "#042B19" }}
    >
      {/* Footer SVG Background */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/footer-svg.svg"
          alt="Footer Pattern"
          fill
          className="object-cover"
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Crown Bankers Logo */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-start">
              <Image
                src="/image.png"
                alt="Crown Bankers Logo"
                width={200}
                height={100}
                className="object-contain"
                style={{ height: "auto", maxHeight: "100px" }}
              />
            </Link>
          </div>

          {/* Energy Technologies */}
          <div className="flex flex-col">
            <h4
              className="font-semibold mb-4 text-sm uppercase tracking-wide"
              style={{ color: "#FFFFFF", opacity: 1 }}
            >
              Energy Technologies
            </h4>
            <ul className="space-y-3 flex-1">
              <li>
                <Link
                  href="/energy-technologies/natural-gas"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Natural Gas
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/solar"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Solar
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/wind"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Land-based Wind
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/storage"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Storage
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/transmission"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Transmission
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/geothermal"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Geothermal
                </Link>
              </li>
            </ul>
          </div>

          {/* Who We Are */}
          <div className="flex flex-col">
            <h4
              className="font-semibold mb-4 text-sm uppercase tracking-wide"
              style={{ color: "#FFFFFF", opacity: 1 }}
            >
              Who We Are
            </h4>
            <ul className="space-y-3 flex-1">
              <li>
                <Link
                  href="/who-we-are/about"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/who-we-are/leadership"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Leadership
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Plan */}
          <div className="flex flex-col">
            <h4
              className="font-semibold mb-4 text-sm uppercase tracking-wide"
              style={{ color: "#FFFFFF", opacity: 1 }}
            >
              Our Plan
            </h4>
            <ul className="space-y-3 flex-1">
              <li>
                <Link
                  href="/our-plan"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Our Plan
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col">
            <h4
              className="font-semibold mb-4 text-sm uppercase tracking-wide"
              style={{ color: "#FFFFFF", opacity: 1 }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3 flex-1">
              <li>
                <Link
                  href="/download"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Download
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Crown Bankers Section */}
        <div
          className="border-t pt-8 mb-8"
          style={{ borderColor: "#CDE5DA", opacity: 0.3 }}
        >
          <div className="flex flex-col md:flex-row flex-wrap gap-6 md:gap-8 lg:gap-12 items-start md:items-center">
            <div className="text-white">
              <div
                className="text-2xl font-bold mb-2 text-white"
                style={{ opacity: 1 }}
              >
                Crown Banker
              </div>
              <p className="text-sm text-white" style={{ opacity: 1 }}>
                Bridging renewable energy and financial solutions for a
                sustainable future.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright and Legal */}
        <div
          className="border-t pt-6"
          style={{ borderColor: "#CDE5DA", opacity: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white text-sm" style={{ opacity: 1 }}>
              © 2025 Crown Banker
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/privacy"
                className="text-white text-sm transition hover:opacity-80"
                style={{ opacity: 1 }}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-white text-sm transition hover:opacity-80"
                style={{ opacity: 1 }}
              >
                Terms of Service
              </Link>
              <Link
                href="/compliance"
                className="text-white text-sm transition hover:opacity-80"
                style={{ opacity: 1 }}
              >
                Compliance
              </Link>
              <Link
                href="/cookie-preferences"
                className="text-white text-sm transition hover:opacity-80"
                style={{ opacity: 1 }}
              >
                Cookie Preferences
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition hover:opacity-80"
                style={{ opacity: 1 }}
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}