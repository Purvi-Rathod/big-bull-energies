"use client";

import { useMemo, useState } from "react";
import {
  Filter,
  Users,
  Building2,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import Footer from "@/components/Footer";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const PRIMARY = "#05627C";
const MINT = "#E8F5F0";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: "photo";
  category: string;
  order: number;
  fileName: string;
}

/** Official Big Bull Energies gallery assets — one photo per person. */
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "l1",
    title: "Alexander Whitmore — CEO",
    description:
      "Chief Executive Officer at Big Bull Energies headquarters.",
    mediaUrl: "/L1.jpeg",
    mediaType: "photo",
    category: "Our Leaders",
    order: 1,
    fileName: "Alexander-Whitmore-CEO.jpeg",
  },
  {
    id: "l4",
    title: "Charles Kensington — CMO",
    description:
      "Chief Marketing Officer driving Big Bull Energies brand growth.",
    mediaUrl: "/L4.jpeg",
    mediaType: "photo",
    category: "Our Leaders",
    order: 2,
    fileName: "Charles-Kensington-CMO.jpeg",
  },
  {
    id: "l2",
    title: "Jessica Park — COO",
    description:
      "Chief Operating Officer leading operations and delivery.",
    mediaUrl: "/L2.jpeg",
    mediaType: "photo",
    category: "Our Leaders",
    order: 3,
    fileName: "Jessica-Park-COO.jpeg",
  },
  {
    id: "l3",
    title: "Henry Caldwell — CSO",
    description:
      "Chief Strategy Officer guiding long-term clean energy strategy.",
    mediaUrl: "/L3.jpeg",
    mediaType: "photo",
    category: "Our Leaders",
    order: 4,
    fileName: "Henry-Caldwell-CSO.jpeg",
  },
  {
    id: "l5",
    title: "Leadership Team",
    description:
      "The Big Bull Energies leadership team together at headquarters.",
    mediaUrl: "/L5.jpeg",
    mediaType: "photo",
    category: "Team",
    order: 1,
    fileName: "Big-Bull-Energies-Leadership-Team.jpeg",
  },
];

function getCategoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("leader") || c.includes("team") || c.includes("people"))
    return Users;
  if (c.includes("office") || c.includes("hq") || c.includes("brand"))
    return Building2;
  return ImageIcon;
}

async function downloadImage(item: GalleryItem) {
  try {
    const response = await fetch(item.mediaUrl);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Failed to download image:", error);
    // Fallback: open the image in a new tab
    window.open(item.mediaUrl, "_blank", "noopener,noreferrer");
  }
}

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const categories = useMemo(
    () =>
      Array.from(new Set(GALLERY_ITEMS.map((item) => item.category))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [],
  );

  const items = useMemo(() => {
    const filtered = selectedCategory
      ? GALLERY_ITEMS.filter((item) => item.category === selectedCategory)
      : GALLERY_ITEMS;
    return [...filtered].sort((a, b) => {
      if (a.category === b.category) return a.order - b.order;
      return a.category.localeCompare(b.category);
    });
  }, [selectedCategory]);

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: GalleryItem[] } = {};
    items.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    Object.keys(groups).forEach((category) => {
      groups[category].sort((a, b) => a.order - b.order);
    });
    return groups;
  }, [items]);

  const renderGridItem = (item: GalleryItem) => (
    <div
      key={item.id}
      className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all"
    >
      <div
        onClick={() => setSelectedItem(item)}
        className="cursor-pointer w-full h-full"
      >
        <img
          src={item.mediaUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <h3 className="text-white font-semibold text-sm sm:text-base">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-white/80 text-xs sm:text-sm mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          void downloadImage(item);
        }}
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-md transition hover:brightness-110"
        style={{ backgroundColor: PRIMARY }}
        aria-label={`Download ${item.title}`}
      >
        <Download className="w-3.5 h-3.5" />
        Download
      </button>
    </div>
  );

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[156px] bg-white"
      style={{ fontFamily: FONT_STACK }}
    >
      {/* Category Filter */}
      {categories.length > 0 && (
        <section
          className="relative w-full bg-gray-50 py-6 sm:py-8 border-b"
          style={{ borderColor: "rgba(5,98,124,0.15)" }}
        >
          <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: MINT }}
              >
                <Filter className="w-4 h-4" style={{ color: PRIMARY }} />
              </div>
              <button
                onClick={() => setSelectedCategory("")}
                className="px-4 sm:px-6 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition"
                style={
                  selectedCategory === ""
                    ? { backgroundColor: PRIMARY, color: "#fff" }
                    : {
                        backgroundColor: "#fff",
                        color: PRIMARY,
                        border: `1px solid ${PRIMARY}30`,
                      }
                }
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-4 sm:px-6 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition"
                  style={
                    selectedCategory === category
                      ? { backgroundColor: PRIMARY, color: "#fff" }
                      : {
                          backgroundColor: "#fff",
                          color: PRIMARY,
                          border: `1px solid ${PRIMARY}30`,
                        }
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: PRIMARY }}>
                No gallery items found.
              </p>
            </div>
          ) : !selectedCategory ? (
            Object.keys(groupedItems).map((category) => {
              const Icon = getCategoryIcon(category);
              return (
                <div key={category} className="mb-12 sm:mb-16">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h2
                      className="text-2xl sm:text-3xl md:text-4xl font-bold"
                      style={{ color: PRIMARY }}
                    >
                      {category}
                    </h2>
                  </div>
                  <div
                    className="h-1 w-12 mb-6 sm:mb-8 rounded-full ml-[52px]"
                    style={{ backgroundColor: PRIMARY, opacity: 0.35 }}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {groupedItems[category].map((item) => renderGridItem(item))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {items.map((item) => renderGridItem(item))}
            </div>
          )}
        </div>
      </section>

      {/* Modal for viewing media */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-w-6xl w-full max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
              aria-label="Close"
            >
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
            </button>
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={selectedItem.mediaUrl}
                alt={selectedItem.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: PRIMARY }}
                  >
                    {selectedItem.title}
                  </h3>
                  {selectedItem.description && (
                    <p className="text-gray-700 mb-2">
                      {selectedItem.description}
                    </p>
                  )}
                  <span
                    className="inline-block px-3 py-1 text-sm font-medium rounded-full"
                    style={{ backgroundColor: MINT, color: PRIMARY }}
                  >
                    {selectedItem.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void downloadImage(selectedItem)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
