"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Network,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Award,
  HelpCircle,
  Newspaper,
  Calendar,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
  href: string;
  subItems?: { name: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "My Genealogy",
    icon: Network,
    href: "/dashboard/genealogy",
    subItems: [
      { name: "Direct", href: "/dashboard/genealogy/direct" },
      { name: "Binary", href: "/dashboard/genealogy/binary" },
    ],
  },
  {
    name: "Fund",
    icon: Wallet,
    href: "/dashboard/fund",
    subItems: [
      { name: "Fund Request", href: "/dashboard/fund/request" },
      { name: "Fund Convert", href: "/dashboard/fund/convert" },
    ],
  },
  {
    name: "Withdrawal",
    icon: ArrowDownCircle,
    href: "/dashboard/withdrawal",
  },
  {
    name: "Topup",
    icon: ArrowUpCircle,
    href: "/dashboard/topup",
  },
  {
    name: "Payout Report",
    icon: FileText,
    href: "/dashboard/payout-report",
  },
  {
    name: "Career Reward",
    icon: Award,
    href: "/dashboard/career-reward",
  },
  {
    name: "Supports",
    icon: HelpCircle,
    href: "/dashboard/supports",
  },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  // Track which sub-menus are open
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  // Initialize sub-menu states based on current pathname
  useEffect(() => {
    const newOpenSubMenus: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.subItems) {
        newOpenSubMenus[item.name] = item.subItems.some(
          (sub) => pathname === sub.href
        );
      }
    });
    setOpenSubMenus(newOpenSubMenus);
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full shadow-lg z-50 transition-all duration-300 ${
          isOpen ? "w-56" : "w-20"
        }`}
        style={{
          backgroundColor: "#042B19",
        }}
      >
        {/* Sidebar Header with Logo and Toggle */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <Link href="/dashboard" className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md p-2 bg-white flex-shrink-0">
              <Image
                src="/image.png"
                alt="Crown Bankers Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            {isOpen && (
              <span className="text-lg font-bold text-white">
                Crown Bankers
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg transition text-white flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.subItems &&
                  item.subItems.some((sub) => pathname === sub.href));
              const isSubMenuOpen = openSubMenus[item.name] || false;

              return (
                <li key={item.name}>
                  <div>
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (item.subItems) {
                          e.preventDefault();
                          setOpenSubMenus((prev) => ({
                            ...prev,
                            [item.name]: !prev[item.name],
                          }));
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-all ${
                        isActive
                          ? "font-semibold rounded-3xl"
                          : "rounded-lg hover:bg-white hover:bg-opacity-10"
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? "rgba(255, 255, 255, 0.15)"
                          : "transparent",
                        color: isActive
                          ? "#ffffff"
                          : "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <Icon className="flex-shrink-0 text-white" size={20} />
                      {isOpen && (
                        <>
                          <span className="text-sm text-white flex-1">
                            {item.name}
                          </span>
                          {item.subItems && (
                            <ChevronRight
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isSubMenuOpen ? "rotate-90" : ""
                              }`}
                            />
                          )}
                        </>
                      )}
                    </Link>
                    {isOpen && item.subItems && isSubMenuOpen && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href}
                                className={`block px-3 py-2 transition-all text-sm ${
                                  isSubActive
                                    ? "font-semibold rounded-3xl"
                                    : "rounded-lg hover:bg-white hover:bg-opacity-10"
                                }`}
                                style={{
                                  backgroundColor: isSubActive
                                    ? "rgba(255, 255, 255, 0.15)"
                                    : "transparent",
                                  color: isSubActive
                                    ? "#ffffff"
                                    : "rgba(255, 255, 255, 0.7)",
                                }}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div
          className="px-2 py-2 border-t"
          style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
        >
          {isOpen ? (
            <div className="bg-white rounded-2xl p-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#042B19] to-[#16a34a] flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-lg font-bold text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-semibold truncate"
                    style={{ color: "#042B19" }}
                  >
                    Andrew
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ backgroundColor: "#E8F5F0", color: "#042B19" }}
                    >
                      CNB3298618
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      Rank:{" "}
                      <span
                        className="font-semibold"
                        style={{ color: "#042B19" }}
                      >
                        981
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* My Package */}
              <div className="pt-2 border-t" style={{ borderColor: "#E5E7EB" }}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  My Package
                </p>
                <div
                  className="px-3 py-2 rounded-3xl font-semibold text-sm text-center"
                  style={{ backgroundColor: "#ffcf0B", color: "#042B19" }}
                >
                  Elite Energy
                </div>
              </div>

              {/* Logout Button */}
              <button
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-3xl transition text-sm font-medium mt-2"
                style={{ backgroundColor: "#ef4444", color: "#ffffff" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef4444";
                }}
              >
                <span>Logout</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#042B19] to-[#16a34a] flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">A</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
