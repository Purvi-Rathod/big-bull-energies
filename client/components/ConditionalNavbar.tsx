"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Dashboard routes under (dashboard) route group - these don't have /dashboard prefix
  const dashboardRoutes = [
    "/dashboard",
    "/plans",
    "/binary",
    "/investments",
    "/my-tree",
    "/genealogy",
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

  // Check if current pathname is a dashboard route or authenticated route
  const isDashboardRoute = dashboardRoutes.some(
    route => pathname === route || pathname?.startsWith(`${route}/`)
  );

  const isAuthenticatedRoute = authenticatedRoutes.some(
    route => pathname === route || pathname?.startsWith(`${route}/`)
  );

  // Hide navbar on login, signup, dashboard, admin, and authenticated pages
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname?.startsWith("/admin") ||
    isDashboardRoute ||
    isAuthenticatedRoute
  ) {
    return null;
  }

  return <Navbar />;
}