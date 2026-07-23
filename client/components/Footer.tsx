import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { brand } from "@/lib/brand";

const columns = [
  {
    title: "Energy Technologies",
    links: [
      { label: "Wind Energy", href: "/energy-technologies/wind" },
      { label: "Turbine Systems", href: "/energy-technologies/turbines" },
      { label: "Wind Farm Operations", href: "/energy-technologies/geothermal" },
      { label: "Energy Storage", href: "/energy-technologies/storage" },
      { label: "Grid Connection", href: "/energy-technologies/transmission" },
      { label: "Hybrid Solar", href: "/energy-technologies/solar" },
    ],
  },
  {
    title: "Who We Are",
    links: [
      { label: "About Us", href: "/who-we-are/about" },
      { label: "Leadership", href: "/who-we-are/leadership" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Our Plan", href: "/our-plan" },
      { label: "Gallery", href: "/gallery" },
      { label: "Download", href: "/download" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Legal Documents", href: "/legal" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Compliance", href: "/compliance" },
      { label: "Cookie Preferences", href: "/cookie-preferences" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full relative overflow-hidden bg-[#F4F8F9]">
      {/* Top brand bar */}
      <div
        className="w-full"
        style={{
          background: `linear-gradient(90deg, ${brand.primaryDeep} 0%, ${brand.primary} 55%, #067891 100%)`,
        }}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-xl">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: brand.gold }}
              >
                Big Bull Energies
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white leading-snug">
                Wind-powered progress for investors and communities
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:+447452321003"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white/95 border border-white/25 hover:border-[#F5CF0B] hover:text-[#F5CF0B] transition-colors"
              >
                <Phone className="w-4 h-4" />
                +44 7452 321003
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:brightness-105"
                style={{ backgroundColor: brand.gold, color: "#1a1a1a" }}
              >
                Contact Us
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer body */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Logo + about */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logo2.png"
                alt="Big Bull Energies Logo"
                width={220}
                height={110}
                className="object-contain"
                style={{ height: "auto", maxHeight: "100px", width: "auto" }}
                quality={95}
              />
            </Link>
            <p
              className="text-sm leading-relaxed max-w-sm mb-6"
              style={{ color: brand.muted }}
            >
              A wind-focused renewable energy company delivering clean generation,
              turbine systems, and transparent participation programs.
            </p>
            <a
              href="mailto:bigbullenergies@gmail.com"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: brand.primary }}
            >
              <Mail className="w-4 h-4 shrink-0" />
              bigbullenergies@gmail.com
            </a>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h3
                  className="text-xs font-bold uppercase tracking-[0.12em] mb-4 pb-2 border-b"
                  style={{
                    color: brand.primary,
                    borderColor: "rgba(5,98,124,0.15)",
                  }}
                >
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-[#05627C]"
                        style={{ color: "#3d4f57" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(5,98,124,0.12)", backgroundColor: "#EEF4F6" }}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm" style={{ color: brand.muted }}>
              © {new Date().getFullYear()} Big Bull Energies. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#05627C] hover:text-white"
                style={{
                  color: brand.primary,
                  backgroundColor: "rgba(5,98,124,0.08)",
                }}
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://wa.me/447452321003"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#25D366] hover:text-white"
                style={{
                  color: "#128C7E",
                  backgroundColor: "rgba(37,211,102,0.12)",
                }}
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
