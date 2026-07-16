import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import AuthProviderWrapper from "@/providers/AuthProvider";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { Toaster } from "react-hot-toast";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import SupportFloatingButtons from "@/components/SupportFloatingButtons";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const customFont = localFont({
  src: [
    {
      path: "../fonts/font4.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/font5.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/font6.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/font1.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/font2.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/font3.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-custom",
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

const font4 = localFont({
  src: [
    {
      path: "../fonts/font4.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-font4",
  display: "swap",
});

// Base URL for meta tags - can be overridden with environment variable
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "https://crownbanker.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Big Bull Energies - Revolutionary Business Opportunity Platform",
    template: "%s | Big Bull Energies",
  },
  description:
    "Build your network, maximize your earnings, and unlock unlimited potential with Big Bull Energies' advanced binary system. Join the future of sustainable energy investments.",
  keywords: [
    "Big Bull Energies",
    "Binary MLM",
    "Network Marketing",
    "Energy Investments",
    "Sustainable Energy",
    "Solar Energy",
    "Wind Energy",
    "Investment Platform",
    "MLM Platform",
    "Binary System",
  ],
  authors: [{ name: "Big Bull Energies" }],
  creator: "Big Bull Energies",
  publisher: "Big Bull Energies",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Big Bull Energies",
    title: "Big Bull Energies - Revolutionary Binary MLM Platform",
    description:
      "Build your network, maximize your earnings, and unlock unlimited potential with Big Bull Energies' advanced binary system. Join the future of sustainable energy investments.",
    images: [
      {
        url: "/image.png",
        width: 1200,
        height: 630,
        alt: "Big Bull Energies Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Big Bull Energies - Revolutionary Binary MLM Platform",
    description:
      "Build your network, maximize your earnings, and unlock unlimited potential with Big Bull Energies' advanced binary system.",
    images: ["/image.png"],
    creator: "@crownbankers",
    site: "@crownbankers",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: baseUrl,
  },
  category: "Finance",
  classification: "Business",
  other: {
    "application-name": "Big Bull Energies",
    "apple-mobile-web-app-title": "Big Bull Energies",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
    "theme-color": "#05627C",
    "color-scheme": "light",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${inter.variable} ${fraunces.variable} ${customFont.variable} ${font4.variable} antialiased`}
      >
        <AuthProviderWrapper>
          <ConfirmProvider>
            <ConditionalNavbar />
            {children}
            <SupportFloatingButtons />
          </ConfirmProvider>
        </AuthProviderWrapper>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#000",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
