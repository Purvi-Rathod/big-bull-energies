"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, ChevronDown } from "lucide-react";
import Image from "next/image";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-transparent">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#042B19" }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#042B19] to-[#16a34a] flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-3xl shadow-lg border z-50 bg-white"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div
                  className="p-4 border-b"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#042B19] to-[#16a34a] flex items-center justify-center shadow-md">
                      <span className="text-lg font-bold text-white">A</span>
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#042B19" }}
                      >
                        Andrew
                      </p>
                      <p className="text-xs text-gray-500">CNB3298618</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/dashboard/profile/edit");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span className="text-sm" style={{ color: "#042B19" }}>
                      Edit Profile
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
