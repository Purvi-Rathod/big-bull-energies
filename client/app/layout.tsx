import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import AuthProviderWrapper from "@/providers/AuthProvider";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { Toaster } from "react-hot-toast";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"] });

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

export const metadata: Metadata = {
  title: "CROWN - Revolutionary Binary MLM Platform",
    description:
      "Build your network, maximize your earnings, and unlock unlimited potential with CROWN's advanced binary system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${customFont.variable} ${font4.variable} antialiased`}
      >
        <AuthProviderWrapper>
          <ConfirmProvider>
            <ConditionalNavbar />
            {children}
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
