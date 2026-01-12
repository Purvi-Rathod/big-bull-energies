"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, LogIn } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const navLinks = [
    {
      name: "Energy Technologies",
      items: [
        // { label: "Natural Gas", href: "/energy-technologies/natural-gas" },
        { label: "Solar", href: "/energy-technologies/solar" },
        // { label: "Storage", href: "/energy-technologies/storage" },
        // { label: "Land-based Wind", href: "/energy-technologies/wind" },
        // { label: "Transmission", href: "/energy-technologies/transmission" },
        // { label: "Geothermal", href: "/energy-technologies/geothermal" },
      ],
    },
    {
      name: "Who We Are",
      items: [
        { label: "About Us", href: "/who-we-are/about" },
        { label: "Leadership", href: "/who-we-are/leadership" },
      ],
    },
    {
      name: "Our Plan",
      href: "/our-plan",
    },
    {
      name: "Gallery",
      href: "/gallery",
    },
    {
      name: "Download",
      href: "/download",
    },
    {
      name: "Contact Us",
      href: "/contact",
    },
  ];

  // Dashboard routes - additional safeguard check
  const dashboardRoutes = [
    "/dashboard",
    "/plans",
    "/binary",
    "/investments",
    "/my-tree",
    "/referrals",
    "/reports",
    "/tickets",
    "/vouchers",
    "/withdraw",
    "/profile",
    "/career-levels",
  ];

  // Additional authenticated routes that should hide navbar
  const authenticatedRoutes = [
    "/tree", // Tree visualization page (used by admin and users)
  ];

  const isDashboardRoute = dashboardRoutes.some(
    route => pathname === route || pathname?.startsWith(`${route}/`)
  );

  const isAuthenticatedRoute = authenticatedRoutes.some(
    route => pathname === route || pathname?.startsWith(`${route}/`)
  );

  // Hide navbar on login, signup, dashboard, admin, and authenticated pages (handled by ConditionalNavbar, but also check here as safeguard)
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname?.startsWith("/admin") ||
    isDashboardRoute ||
    isAuthenticatedRoute
  ) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* White Top Section */}
      <div
        className={`bg-white border-b border-gray-200 transition-all duration-300 ease-in-out ${
          isScrolled
            ? "-translate-y-full opacity-0 pointer-events-none h-0"
            : "translate-y-0 opacity-100"
        }`}
        style={{ height: isScrolled ? "0" : "70px" }}
      >
        {/* Desktop Version - Reduced Height */}
        <div
          className="hidden md:block container mx-auto px-4 lg:px-8 py-2"
          style={{ height: "70px", minHeight: "70px" }}
        >
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img
                src="/image.png"
                alt="Crown Bankers Logo"
                className="object-contain"
                style={{ height: "60px" }}
              />
            </Link>

            {/* Right Side Links */}
            <div className="flex items-center gap-6 lg:gap-8">
              {/* Phone Number */}
              <a
                href="tel:+447452321010"
                className="flex items-center gap-2 text-xs font-bold transition hover:opacity-70"
                style={{ color: "#042B19" }}
              >
                <Phone className="w-4 h-4" />
                +44 7452321010
              </a>

              {/* Email */}
              <a
                href="mailto:crownbankers.com@gmail.com"
                className="flex items-center gap-2 text-xs font-bold transition hover:opacity-70"
                style={{ color: "#042B19" }}
              >
                <Mail className="w-4 h-4" />
                crownbankers.com@gmail.com
              </a>

              {/* Login Button */}
              <Link
                href="/login"
                className="text-gray-900 font-bold px-5 lg:px-6 transition hover:opacity-90 flex items-center justify-center text-xs"
                style={{
                  backgroundColor: "#ffcf0B",
                  height: "38px",
                  borderRadius: "0",
                  minWidth: "120px",
                }}
              >
                LOGIN
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Version - Reduced Height */}
        <div
          className="md:hidden container mx-auto px-3 sm:px-4 py-1"
          style={{ height: "40px", minHeight: "40px" }}
        >
          <div className="flex items-center justify-between h-full">
            {/* Logo - Smaller on mobile */}
            <Link href="/" className="flex items-center">
              <img
                src="/image.png"
                alt="Crown Bankers Logo"
                className="object-contain h-8 sm:h-10"
              />
            </Link>

            {/* Mobile Login Button with Icon */}
            <Link
              href="/login"
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 transition hover:opacity-90 rounded"
              style={{
                backgroundColor: "#ffcf0B",
              }}
              aria-label="Login"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-900" />
            </Link>
          </div>
        </div>
      </div>

      {/* Green Bottom Section */}
      <div
        className={`transition-all duration-300 ease-in-out relative ${
          isScrolled ? "mt-0" : "mt-0"
        }`}
        style={{ backgroundColor: "#042B19", minHeight: "48px" }}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-between w-full min-h-[56px]">
            {navLinks.map((link, index) => {
              const isOpen = openDropdown === link.name;
              // If link has href, it's a direct link (no dropdown)
              if (link.href) {
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-sm font-medium transition whitespace-nowrap block text-white hover:text-yellow-400 flex-1 text-center"
                  >
                    {link.name}
                  </Link>
                );
              }
              // Otherwise, it has items (dropdown)
              return (
                <div
                  key={index}
                  className="relative flex-1 text-center"
                  onMouseEnter={() => {
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
                    setOpenDropdown(link.name);
                  }}
                  onMouseLeave={() => {
                    // Add a small delay before closing to allow mouse to move to dropdown
                    closeTimeoutRef.current = setTimeout(() => {
                      setOpenDropdown(null);
                    }, 150);
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                      }
                      setOpenDropdown(isOpen ? null : link.name);
                    }}
                    className={`text-sm font-medium transition whitespace-nowrap block ${
                      isOpen
                        ? "text-[#ffcf0B]"
                        : "text-white hover:text-yellow-400"
                    }`}
                    style={
                      isOpen
                        ? {
                            borderBottom: "2px solid #ffcf0B",
                            paddingBottom: "2px",
                          }
                        : {}
                    }
                  >
                    {link.name}
                  </button>
                  {isOpen && link.items && (
                    <div
                      className="fixed left-0 right-0 w-full bg-white shadow-lg z-50"
                      style={{
                        top: isScrolled ? "56px" : "126px",
                        paddingTop: "0",
                      }}
                      onMouseEnter={() => {
                        if (closeTimeoutRef.current) {
                          clearTimeout(closeTimeoutRef.current);
                          closeTimeoutRef.current = null;
                        }
                        setOpenDropdown(link.name);
                      }}
                      onMouseLeave={() => {
                        closeTimeoutRef.current = setTimeout(() => {
                          setOpenDropdown(null);
                        }, 150);
                      }}
                    >
                      <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-12">
                        {link.name === "Energy Technologies" ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
                            {link.items.map((item, idx) => (
                              <Link
                                key={idx}
                                href={item.href}
                                className="text-base md:text-lg lg:text-xl font-medium transition hover:opacity-70"
                                style={{ color: "#042B19" }}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 lg:gap-12">
                            {/* Column 1 */}
                            <div className="flex flex-col gap-3 md:gap-5 lg:gap-6">
                              {link.items
                                .filter((_, idx) => idx % 3 === 0)
                                .map((item, idx) => (
                                  <Link
                                    key={idx}
                                    href={item.href}
                                    className="text-base md:text-lg lg:text-xl font-medium transition hover:opacity-70"
                                    style={{ color: "#042B19" }}
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                            </div>
                            {/* Column 2 */}
                            <div className="flex flex-col gap-3 md:gap-5 lg:gap-6">
                              {link.items
                                .filter((_, idx) => idx % 3 === 1)
                                .map((item, idx) => (
                                  <Link
                                    key={idx}
                                    href={item.href}
                                    className="text-base md:text-lg lg:text-xl font-medium transition hover:opacity-70"
                                    style={{ color: "#042B19" }}
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                            </div>
                            {/* Column 3 */}
                            <div className="flex flex-col gap-3 md:gap-5 lg:gap-6">
                              {link.items
                                .filter((_, idx) => idx % 3 === 2)
                                .map((item, idx) => (
                                  <Link
                                    key={idx}
                                    href={item.href}
                                    className="text-base md:text-lg lg:text-xl font-medium transition hover:opacity-70"
                                    style={{ color: "#042B19" }}
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center justify-between min-h-[48px]">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (isMobileMenuOpen) {
                  setOpenDropdown(null);
                }
              }}
              className="flex items-center justify-center w-8 h-8 text-white hover:text-yellow-400 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {/* Mobile Contact Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="tel:+447452321010"
                className="flex items-center gap-1 text-white transition hover:text-yellow-400"
                aria-label="Call us"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:crownbankers.com@gmail.com"
                className="flex items-center gap-1 text-white transition hover:text-yellow-400"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#042B19] ${
            isMobileMenuOpen
              ? "max-h-[calc(100vh-120px)] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link, index) => {
              const isOpen = openDropdown === link.name;
              // Handle direct links (no dropdown)
              if (link.href) {
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="block w-full text-white text-sm font-medium py-3 px-2 hover:text-yellow-400 transition border-b border-white/10"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setOpenDropdown(null);
                    }}
                  >
                    {link.name}
                  </Link>
                );
              }
              // Handle dropdown links
              return (
                <div key={index} className="border-b border-white/10">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : link.name)}
                    className="w-full flex items-center justify-between text-white text-sm font-medium py-3 px-2 hover:text-yellow-400 transition"
                  >
                    <span>{link.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isOpen && link.items && (
                    <div className="pl-4 pb-2 bg-[#042B19]/50">
                      {link.items.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          className="block text-white text-sm py-2 px-2 hover:text-yellow-400 transition"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setOpenDropdown(null);
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
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