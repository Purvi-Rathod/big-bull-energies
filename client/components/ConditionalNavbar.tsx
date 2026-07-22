"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const DASHBOARD_ROUTES = [
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

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const AUTHENTICATED_ROUTES = ["/tree"];

function matchesRoute(pathname: string | null, route: string) {
  return pathname === route || pathname?.startsWith(`${route}/`);
}

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const isDashboardRoute = DASHBOARD_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  const isAuthRoute = AUTH_ROUTES.some((route) => matchesRoute(pathname, route));

  const isAuthenticatedRoute = AUTHENTICATED_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  if (
    isAuthRoute ||
    pathname?.startsWith("/admin") ||
    isDashboardRoute ||
    isAuthenticatedRoute
  ) {
    return null;
  }

  return <Navbar />;
}
