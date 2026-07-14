"use client";

import { useState } from "react";
import Footer from "@/components/Footer";

export default function CookiePreferencesPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === "essential") return; // Essential cookies cannot be disabled
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // Save preferences to localStorage or send to server
    if (typeof window !== "undefined") {
      localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
      alert("Cookie preferences saved!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "156px" }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#042B19" }}>
            Cookie Preferences
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Manage your cookie preferences for Big Bull Energies
          </p>

          <div
            className="bg-white rounded-lg shadow-sm p-8 space-y-6"
            style={{ borderColor: "#E5E7EB" }}
          >
            <section>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#042B19" }}
              >
                What are cookies?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are placed on your device when
                you visit our website. They help us provide you with a better
                experience by remembering your preferences and understanding how
                you use our site.
              </p>
            </section>

            <section className="space-y-4">
              <div
                className="flex items-center justify-between p-4 border rounded-lg"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div className="flex-1">
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "#042B19" }}
                  >
                    Essential Cookies
                  </h3>
                  <p className="text-sm text-gray-600">
                    These cookies are necessary for the website to function
                    properly. They cannot be disabled.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.essential}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#042B19]"></div>
                </label>
              </div>

              <div
                className="flex items-center justify-between p-4 border rounded-lg"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div className="flex-1">
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "#042B19" }}
                  >
                    Analytics Cookies
                  </h3>
                  <p className="text-sm text-gray-600">
                    These cookies help us understand how visitors interact with
                    our website by collecting and reporting information
                    anonymously.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => handleToggle("analytics")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#042B19]"></div>
                </label>
              </div>

              <div
                className="flex items-center justify-between p-4 border rounded-lg"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div className="flex-1">
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "#042B19" }}
                  >
                    Marketing Cookies
                  </h3>
                  <p className="text-sm text-gray-600">
                    These cookies are used to deliver relevant advertisements
                    and track campaign effectiveness.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => handleToggle("marketing")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#042B19]"></div>
                </label>
              </div>
            </section>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-lg font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "#042B19" }}
              >
                Save Preferences
              </button>
              <button
                onClick={() => {
                  setPreferences({
                    essential: true,
                    analytics: false,
                    marketing: false,
                  });
                }}
                className="px-6 py-3 rounded-lg font-semibold border transition hover:bg-gray-50"
                style={{ borderColor: "#042B19", color: "#042B19" }}
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
