"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Battery,
  ChevronDown,
  Cog,
  LogIn,
  Mail,
  Network,
  Phone,
  Sun,
  Users,
  Wind,
  Activity,
  type LucideIcon,
} from "lucide-react";

const PRIMARY = "#05627C";
const GOLD = "#F5CF0B";

type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
};

type NavLink =
  | { name: string; href: string; items?: never }
  | { name: string; href?: never; items: NavItem[] };

const NAV_LINKS: NavLink[] = [
  {
    name: "Energy Technologies",
    items: [
      {
        label: "Wind Energy",
        href: "/energy-technologies/wind",
        icon: Wind,
        description: "Our core renewable generation",
      },
      {
        label: "Turbine Systems",
        href: "/energy-technologies/turbines",
        icon: Cog,
        description: "Blades, nacelles & controls",
      },
      {
        label: "Wind Farm Operations",
        href: "/energy-technologies/geothermal",
        icon: Activity,
        description: "Monitoring, O&M and uptime",
      },
      {
        label: "Energy Storage",
        href: "/energy-technologies/storage",
        icon: Battery,
        description: "Firming wind for the grid",
      },
      {
        label: "Grid Connection",
        href: "/energy-technologies/transmission",
        icon: Network,
        description: "Delivering wind to markets",
      },
      {
        label: "Hybrid Solar",
        href: "/energy-technologies/solar",
        icon: Sun,
        description: "Solar that complements wind",
      },
    ],
  },
  {
    name: "Who We Are",
    items: [
      {
        label: "About Us",
        href: "/who-we-are/about",
        icon: Users,
        description: "Our mission and story",
      },
      {
        label: "Leadership",
        href: "/who-we-are/leadership",
        icon: Users,
        description: "Meet the team",
      },
    ],
  },
  { name: "Our Plan", href: "/our-plan" },
  { name: "Gallery", href: "/gallery" },
  { name: "Download", href: "/download" },
  { name: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 160);
  };

  const isActiveHref = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const isSectionActive = (link: NavLink) => {
    if ("href" in link && link.href) return isActiveHref(link.href);
    if ("items" in link && link.items) {
      return link.items.some((item) => isActiveHref(item.href));
    }
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div
        className={`bg-white border-b border-[#e6eef1] transition-all duration-300 ease-out overflow-hidden ${
          isScrolled
            ? "-translate-y-full opacity-0 pointer-events-none max-h-0"
            : "translate-y-0 opacity-100 max-h-[70px]"
        }`}
      >
        <div className="hidden md:flex container mx-auto px-4 lg:px-8 h-[70px] items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/image.png"
              alt="Big Bull Energies"
              width={180}
              height={56}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-5 lg:gap-7">
            <a
              href="tel:+447452321003"
              className="flex items-center gap-2 text-xs font-semibold transition hover:opacity-70"
              style={{ color: PRIMARY }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(5,98,124,0.08)" }}
              >
                <Phone className="w-3.5 h-3.5" />
              </span>
              +44 7452 321003
            </a>

            <a
              href="mailto:bigbullenergies@gmail.com"
              className="hidden lg:flex items-center gap-2 text-xs font-semibold transition hover:opacity-70"
              style={{ color: PRIMARY }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(5,98,124,0.08)" }}
              >
                <Mail className="w-3.5 h-3.5" />
              </span>
              bigbullenergies@gmail.com
            </a>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 font-bold px-5 h-10 text-xs uppercase tracking-[0.06em] rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
            >
              Login
            </Link>
          </div>
        </div>

        <div className="md:hidden flex container mx-auto px-3 sm:px-4 h-12 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/image.png"
              alt="Big Bull Energies"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center w-9 h-9 rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: GOLD }}
            aria-label="Login"
          >
            <LogIn className="w-4 h-4 text-gray-900" />
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <div
        className="relative shadow-[0_8px_24px_rgba(5,98,124,0.18)]"
        style={{ backgroundColor: PRIMARY }}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          {/* Desktop */}
          <nav className="hidden md:flex items-center justify-between min-h-[56px]">
            {NAV_LINKS.map((link) => {
              const isOpen = openDropdown === link.name;
              const active = isSectionActive(link);

              if ("href" in link && link.href) {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative flex-1 text-center text-[13px] lg:text-sm font-semibold tracking-wide py-4 transition ${
                      active
                        ? "text-[#F5CF0B]"
                        : "text-white/95 hover:text-[#F5CF0B]"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 bottom-2 h-0.5 w-8 rounded-full"
                        style={{ backgroundColor: GOLD }}
                      />
                    )}
                  </Link>
                );
              }

              const items = link.items ?? [];

              return (
                <div
                  key={link.name}
                  className="relative flex-1 text-center"
                  onMouseEnter={() => {
                    clearCloseTimeout();
                    setOpenDropdown(link.name);
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(isOpen ? null : link.name)
                    }
                    className={`inline-flex items-center justify-center gap-1.5 w-full text-[13px] lg:text-sm font-semibold tracking-wide py-4 transition ${
                      isOpen || active
                        ? "text-[#F5CF0B]"
                        : "text-white/95 hover:text-[#F5CF0B]"
                    }`}
                    aria-expanded={isOpen}
                  >
                    {link.name}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      className="fixed left-0 right-0 z-50 border-t border-[#e6eef1] bg-white shadow-[0_20px_50px_rgba(5,98,124,0.14)]"
                      style={{ top: isScrolled ? "56px" : "126px" }}
                      onMouseEnter={clearCloseTimeout}
                      onMouseLeave={scheduleClose}
                    >
                      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-10">
                        {link.name === "Energy Technologies" ? (
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 max-w-5xl mx-auto">
                            {items.map((item) => {
                              const Icon = item.icon;
                              const itemActive = isActiveHref(item.href);
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className={`group flex items-start gap-3.5 rounded-xl px-4 py-3.5 transition-colors ${
                                    itemActive
                                      ? "bg-[rgba(5,98,124,0.08)]"
                                      : "hover:bg-[#F4F8F9]"
                                  }`}
                                >
                                  {Icon && (
                                    <span
                                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
                                      style={{
                                        backgroundColor: "rgba(5,98,124,0.1)",
                                      }}
                                    >
                                      <Icon
                                        className="w-[18px] h-[18px]"
                                        style={{ color: PRIMARY }}
                                        strokeWidth={1.75}
                                      />
                                    </span>
                                  )}
                                  <span className="min-w-0 text-left">
                                    <span
                                      className="block text-[15px] font-semibold mb-0.5"
                                      style={{ color: PRIMARY }}
                                    >
                                      {item.label}
                                    </span>
                                    {item.description && (
                                      <span className="block text-xs leading-snug text-[#6b7c85]">
                                        {item.description}
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                            {items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className="group flex items-center gap-3 rounded-xl px-5 py-3.5 min-w-[200px] transition-colors hover:bg-[#F4F8F9]"
                                >
                                  {Icon && (
                                    <span
                                      className="w-10 h-10 rounded-full flex items-center justify-center"
                                      style={{
                                        backgroundColor: "rgba(5,98,124,0.1)",
                                      }}
                                    >
                                      <Icon
                                        className="w-[18px] h-[18px]"
                                        style={{ color: PRIMARY }}
                                        strokeWidth={1.75}
                                      />
                                    </span>
                                  )}
                                  <span className="text-left">
                                    <span
                                      className="block text-[15px] font-semibold"
                                      style={{ color: PRIMARY }}
                                    >
                                      {item.label}
                                    </span>
                                    {item.description && (
                                      <span className="block text-xs text-[#6b7c85] mt-0.5">
                                        {item.description}
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile bar */}
          <div className="md:hidden flex items-center justify-between min-h-[48px]">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen((v) => !v);
                setOpenDropdown(null);
              }}
              className="flex items-center justify-center w-9 h-9 text-white hover:text-[#F5CF0B] transition"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-3">
              <a
                href="tel:+447452321003"
                className="flex items-center justify-center w-8 h-8 text-white hover:text-[#F5CF0B] transition"
                aria-label="Call us"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:bigbullenergies@gmail.com"
                className="flex items-center justify-center w-8 h-8 text-white hover:text-[#F5CF0B] transition"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out border-t border-white/10 ${
            isMobileMenuOpen ? "max-h-[min(70vh,640px)] opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{ backgroundColor: "#045468" }}
        >
          <nav className="container mx-auto px-4 py-3 overflow-y-auto max-h-[min(70vh,640px)]">
            {NAV_LINKS.map((link) => {
              const isOpen = openDropdown === link.name;

              if ("href" in link && link.href) {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block w-full text-sm font-semibold py-3.5 px-2 border-b border-white/10 transition ${
                      isActiveHref(link.href)
                        ? "text-[#F5CF0B]"
                        : "text-white hover:text-[#F5CF0B]"
                    }`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setOpenDropdown(null);
                    }}
                  >
                    {link.name}
                  </Link>
                );
              }

              const items = link.items ?? [];

              return (
                <div key={link.name} className="border-b border-white/10">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : link.name)}
                    className="w-full flex items-center justify-between text-white text-sm font-semibold py-3.5 px-2 hover:text-[#F5CF0B] transition"
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pb-3 pl-1 space-y-1">
                      {items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-white/90 hover:bg-white/10 hover:text-[#F5CF0B] transition"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setOpenDropdown(null);
                            }}
                          >
                            {Icon && (
                              <Icon className="w-4 h-4 shrink-0 opacity-80" />
                            )}
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
