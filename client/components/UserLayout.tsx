"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import BigBullLoader from "./BigBullLoader";
import {
  LayoutDashboard,
  Package,
  LineChart,
  Network,
  GitBranch,
  Users,
  FileText,
  Ticket,
  Wallet,
  Award,
  UserCircle,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Wind,
  ChevronLeft,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Invest",
    items: [
      { name: "Plans", href: "/plans", icon: Package },
      { name: "Investments", href: "/investments", icon: LineChart },
      { name: "Vouchers", href: "/vouchers", icon: Ticket },
    ],
  },
  {
    label: "Network",
    items: [
      { name: "Binary", href: "/binary", icon: Network },
      { name: "Genealogy", href: "/genealogy", icon: GitBranch },
      { name: "Referrals", href: "/referrals", icon: Users },
      { name: "Career", href: "/career-levels", icon: Award },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Withdraw", href: "/withdraw", icon: Wallet },
      { name: "Reports", href: "/reports", icon: FileText },
      { name: "Profile", href: "/profile", icon: UserCircle },
      { name: "Support", href: "/tickets", icon: LifeBuoy },
    ],
  },
];

const MOBILE_TABS: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Plans", href: "/plans", icon: Package },
  { name: "Network", href: "/binary", icon: Network },
  { name: "Wallet", href: "/withdraw", icon: Wallet },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/plans": "Plans",
  "/investments": "Investments",
  "/vouchers": "Vouchers",
  "/binary": "Binary",
  "/genealogy": "Genealogy",
  "/referrals": "Referrals",
  "/career-levels": "Career",
  "/withdraw": "Withdraw",
  "/reports": "Reports",
  "/profile": "Profile",
  "/tickets": "Support",
  "/my-tree": "Genealogy",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      const desktop = mq.matches;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!isDesktop && sidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [sidebarOpen, isDesktop]);

  const isActive = (href: string) => pathname === href;
  const mobileTitle =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ||
    "Portal";
  const navExpanded = !isDesktop || sidebarOpen;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return <BigBullLoader fullScreen text="Preparing your portal…" />;
  }

  return (
    <div
      className="relative flex min-h-screen min-h-[100dvh] overflow-x-hidden"
      style={{
        background:
          "linear-gradient(165deg, #E8F5F0 0%, #F5FBFC 40%, #D9EEF5 100%)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: "#3FA9C8" }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "#F5CF0B" }}
        />
        <div
          className="absolute left-0 top-1/3 h-48 w-48 rounded-full opacity-25 blur-3xl"
          style={{ background: "#05627C" }}
        />
      </div>

      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-[#0B1F2A]/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 flex h-[100dvh] max-h-screen flex-col border-r transition-transform duration-300 ease-in-out ${
          isDesktop
            ? sidebarOpen
              ? "w-[272px] translate-x-0"
              : "w-[76px] translate-x-0"
            : sidebarOpen
              ? "w-[min(272px,88vw)] translate-x-0"
              : "w-[min(272px,88vw)] -translate-x-full"
        }`}
        style={{
          background: "rgba(255,255,255,0.96)",
          borderColor: "rgba(5,98,124,0.12)",
          boxShadow: "4px 0 24px rgba(5,98,124,0.06)",
          backdropFilter: "blur(12px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        aria-label="Main navigation"
      >
        <div
          className="flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b px-3 sm:h-[68px] sm:px-4"
          style={{ borderColor: "rgba(5,98,124,0.1)" }}
        >
          {navExpanded ? (
            <Link
              href="/"
              className="flex min-w-0 flex-1 items-center gap-2.5"
              onClick={() => {
                if (!isDesktop) setSidebarOpen(false);
              }}
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
                style={{ backgroundColor: "#E8F5F0" }}
                aria-hidden
              >
                <Wind className="h-5 w-5" style={{ color: "#05627C" }} />
              </span>
              <span className="min-w-0 leading-tight">
                <span
                  className="block truncate text-sm font-extrabold tracking-tight"
                  style={{ color: "#05627C" }}
                >
                  Big Bull Energies
                </span>
                <span
                  className="block text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "#3FA9C8" }}
                >
                  Member portal
                </span>
              </span>
            </Link>
          ) : (
            <Link
              href="/"
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#E8F5F0" }}
              title="Big Bull Energies"
              aria-label="Big Bull Energies home"
            >
              <Wind className="h-5 w-5" style={{ color: "#05627C" }} />
            </Link>
          )}

          {isDesktop ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden rounded-lg p-2 text-[#05627C]/70 transition hover:bg-[#E8F5F0] hover:text-[#05627C] md:inline-flex"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex rounded-lg p-2 text-[#05627C]/70"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {navExpanded && (
                <p
                  className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: "#6b7c85" }}
                >
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (!isDesktop) setSidebarOpen(false);
                        }}
                        title={!navExpanded ? item.name : undefined}
                        aria-current={active ? "page" : undefined}
                        className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold transition ${
                          active
                            ? "text-white shadow-md"
                            : "text-[#0B1F2A]/70 hover:bg-[#E8F5F0] hover:text-[#05627C]"
                        } ${!navExpanded ? "justify-center" : ""}`}
                        style={
                          active
                            ? {
                                background:
                                  "linear-gradient(135deg, #05627C 0%, #0A7A96 100%)",
                              }
                            : undefined
                        }
                      >
                        <Icon
                          className={`h-[18px] w-[18px] flex-shrink-0 ${
                            active ? "text-[#F5CF0B]" : "text-[#05627C]/80"
                          }`}
                        />
                        {navExpanded && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className="flex-shrink-0 border-t p-3"
          style={{ borderColor: "rgba(5,98,124,0.1)" }}
        >
          {navExpanded && user && (
            <div
              className="mb-2 rounded-xl px-3 py-2.5"
              style={{ background: "#E8F5F0" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7c85]">
                Signed in
              </p>
              <p
                className="truncate text-sm font-bold"
                style={{ color: "#0B1F2A" }}
              >
                {user.name || user.email}
              </p>
              <p
                className="mt-0.5 truncate font-mono text-[11px] font-semibold"
                style={{ color: "#05627C" }}
              >
                {user.userId}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            title={!navExpanded ? "Logout" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 ${
              !navExpanded ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            {navExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div
        className={`relative z-10 flex min-h-[100dvh] min-w-0 flex-1 flex-col transition-[margin] duration-300 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 ${
          isDesktop ? (sidebarOpen ? "md:ml-[272px]" : "md:ml-[76px]") : "ml-0"
        }`}
      >
        <header
          className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b px-3 backdrop-blur-md sm:px-4 md:h-16 md:px-6"
          style={{
            background: "rgba(255,255,255,0.85)",
            borderColor: "rgba(5,98,124,0.1)",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex flex-shrink-0 rounded-lg p-2 text-[#05627C] md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="min-w-0 md:hidden">
              <p
                className="truncate text-sm font-extrabold"
                style={{ color: "#0B1F2A" }}
              >
                {mobileTitle}
              </p>
            </div>
            <div className="hidden min-w-0 md:block">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#3FA9C8" }}
              >
                Wind energy investing
              </p>
              <p
                className="truncate text-sm font-bold"
                style={{ color: "#0B1F2A" }}
              >
                Your Big Bull Energies workspace
              </p>
            </div>
          </div>
          <Link
            href="/plans"
            className="flex-shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-[#0B1F2A] shadow-sm transition hover:opacity-90 sm:text-sm"
            style={{ backgroundColor: "#F5CF0B" }}
          >
            Invest
          </Link>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t md:hidden"
        style={{
          background: "rgba(255,255,255,0.98)",
          borderColor: "rgba(5,98,124,0.12)",
          boxShadow: "0 -4px 20px rgba(5,98,124,0.08)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-around px-0.5 py-1">
          {MOBILE_TABS.map((item) => {
            const Icon = item.icon;
            const active =
              isActive(item.href) ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5"
                style={{ color: active ? "#05627C" : "#6b7c85" }}
              >
                <span
                  className="rounded-lg p-1"
                  style={active ? { background: "#E8F5F0" } : undefined}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="max-w-full truncate text-[9px] font-bold leading-tight">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
