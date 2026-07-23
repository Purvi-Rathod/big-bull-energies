import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="w-full relative overflow-hidden"
      style={{ backgroundColor: "#05627C" }}
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
          {/* Big Bull Energies Logo */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-start">
              <Image
                src="/image.png"
                alt="Big Bull Energies Logo"
                width={280}
                height={140}
                className="object-contain"
                style={{ height: "auto", maxHeight: "140px" }}
                quality={95}
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
                  href="/energy-technologies/wind"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Wind Energy
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/turbines"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Turbine Systems
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/geothermal"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Wind Farm Operations
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/storage"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Energy Storage
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/transmission"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Grid Connection
                </Link>
              </li>
              <li>
                <Link
                  href="/energy-technologies/solar"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Hybrid Solar
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
                  href="/legal"
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "#FFFFFF", opacity: 1 }}
                >
                  Legal Documents
                </Link>
              </li>
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

        {/* Big Bull Energies Section */}
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
                Big Bull Energies
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
              © 2025 Big Bull Energies
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/legal"
                className="text-white text-sm transition hover:opacity-80"
                style={{ opacity: 1 }}
              >
                Legal Documents
              </Link>
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
              <a
                href="https://wa.me/447452321003"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition hover:opacity-80"
                style={{ opacity: 1 }}
                aria-label="WhatsApp"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
