"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Image as ImageIcon,
  Video,
  Filter,
  Users,
  Calendar,
  Zap,
  ChevronRight,
} from "lucide-react";
import Footer from "@/components/Footer";

/** YouTube embed params: no branding, no title, no controls — raw video only. */
function getYouTubeEmbedParams(autoplay: boolean): string {
  const params = new URLSearchParams();
  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
    params.set("playsinline", "1");
  }
  params.set("modestbranding", "1"); // hide YouTube logo in controls
  params.set("rel", "0"); // no related videos at end
  params.set("showinfo", "0"); // hide title (legacy)
  params.set("controls", "0"); // hide controls — raw video only
  params.set("iv_load_policy", "3"); // hide annotations
  return params.toString();
}

/** Get embed URL for YouTube/Vimeo so iframe can play. Direct video URLs returned as-is. Optionally add autoplay. */
function getVideoEmbedUrl(url: string, autoplay = true): string {
  if (!url || typeof url !== "string") return url;
  const u = url.trim();
  // YouTube: youtu.be/VIDEO_ID or youtube.com/watch?v=VIDEO_ID
  const ytShort = u.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytShort) {
    const base = `https://www.youtube.com/embed/${ytShort[1]}`;
    return `${base}?${getYouTubeEmbedParams(autoplay)}`;
  }
  const ytWatch = u.match(/(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]+)/);
  if (ytWatch) {
    const base = `https://www.youtube.com/embed/${ytWatch[1]}`;
    return `${base}?${getYouTubeEmbedParams(autoplay)}`;
  }
  const ytEmbed = u.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (ytEmbed) {
    const base = u.split("?")[0];
    return `${base}?${getYouTubeEmbedParams(autoplay)}`;
  }
  // Vimeo: vimeo.com/123456789
  const vimeo = u.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeo) {
    const base = `https://player.vimeo.com/video/${vimeo[1]}`;
    return autoplay ? `${base}?autoplay=1` : base;
  }
  return u;
}

/** Optional: get YouTube thumbnail for grid when no thumbnailUrl is set */
function getYouTubeThumbnail(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const ytShort = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const ytWatch = url.match(/(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]+)/);
  const ytEmbed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  const id = ytShort?.[1] || ytWatch?.[1] || ytEmbed?.[1];
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return null;
}

/** True if URL is YouTube or Vimeo (use iframe). Otherwise use <video> for direct links. */
function isEmbeddableVideoUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  return /youtu\.be\/|youtube\.com\/(watch\?|embed\/)|vimeo\.com\//.test(u);
}

/** Pick an icon for a category based on its name, matching the reference design (leaders/events/solar farms). */
function getCategoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("leader") || c.includes("team") || c.includes("people")) return Users;
  if (c.includes("event")) return Calendar;
  if (c.includes("farm") || c.includes("solar") || c.includes("plant")) return Zap;
  if (c.includes("video")) return Video;
  return ImageIcon;
}

interface GalleryItem {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: "photo" | "video";
  category: string;
  thumbnailUrl?: string;
  order: number;
  status: "Active" | "InActive";
}

const BRAND_COLOR = "#05627C";
const BRAND_TINT = "#E8F5F0";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // One horizontal-scroll ref per category, used by the "next" chevron button.
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchGalleryItems();
  }, [selectedCategory]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const params = selectedCategory
        ? `?category=${encodeURIComponent(selectedCategory)}`
        : "";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.crownbankers.com/api/v1"}/gallery${params}`,
      );
      const data = await response.json();

      if (data.status === "success" && data.data) {
        setItems(data.data.items || []);
        if (data.data.categories) {
          setCategories(data.data.categories);
        }
      }
    } catch (error) {
      console.error("Failed to fetch gallery items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const scrollCategory = (category: string, direction: 1 | -1) => {
    const el = scrollRefs.current[category];
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  // Group items by category
  const groupedItems: { [key: string]: GalleryItem[] } = {};
  items.forEach((item) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  // Sort items within each category by order
  Object.keys(groupedItems).forEach((category) => {
    groupedItems[category].sort((a, b) => a.order - b.order);
  });

  const renderTile = (item: GalleryItem) => (
    <div
      key={item._id || item.id}
      className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-xl transition-all snap-start flex-none w-[calc(50%-8px)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
    >
      {item.mediaType === "video" ? (
        <>
          <div
            className="absolute inset-0 w-full h-full"
            onClick={(e) => {
              e.stopPropagation();
              handleItemClick(item);
            }}
          >
            {isEmbeddableVideoUrl(item.mediaUrl) ? (
              <iframe
                src={getVideoEmbedUrl(item.mediaUrl, true)}
                className="w-full h-full pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={item.title}
              />
            ) : (
              <video
                src={item.mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="w-full h-full object-contain bg-black"
                title={item.title}
              />
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
            <h3 className="text-white font-semibold text-sm">{item.title}</h3>
            {item.description && (
              <p className="text-white/80 text-xs mt-0.5 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </>
      ) : (
        <div onClick={() => handleItemClick(item)} className="cursor-pointer w-full h-full">
          <img
            src={item.mediaUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.parentElement!.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              `;
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-white font-semibold text-sm sm:text-base">{item.title}</h3>
            {item.description && (
              <p className="text-white/80 text-xs sm:text-sm mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]">
      {/* Category Filter */}
      {categories.length > 0 && (
        <section
          className="relative w-full bg-white py-6 sm:py-8 border-b-2"
          style={{ borderColor: BRAND_COLOR, opacity: 0.9 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
              <Filter className="w-5 h-5" style={{ color: BRAND_COLOR }} />
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  selectedCategory === ""
                    ? "bg-[#05627C] text-white"
                    : "bg-[#E8F5F0] text-[#05627C] hover:bg-[#05627C] hover:text-white"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                    selectedCategory === category
                      ? "bg-[#05627C] text-white"
                      : "bg-[#E8F5F0] text-[#05627C] hover:bg-[#05627C] hover:text-white"
                  }`}
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div
                  className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{ borderColor: BRAND_COLOR }}
                ></div>
                <p className="mt-4" style={{ color: BRAND_COLOR }}>
                  Loading gallery...
                </p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: BRAND_COLOR }}>
                No gallery items found.
              </p>
            </div>
          ) : !selectedCategory ? (
            // Grouped-by-category view, one horizontally-scrollable row per category
            Object.keys(groupedItems).map((category) => {
              const CategoryIcon = getCategoryIcon(category);
              const catItems = groupedItems[category];
              const showArrow = catItems.length > 4;
              return (
                <div key={category} className="mb-12 sm:mb-16">
                  {/* Category header: icon badge + title + underline accent */}
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      <CategoryIcon className="w-5 h-5 text-white" />
                    </div>
                    <h2
                      className="text-2xl sm:text-3xl md:text-4xl font-bold"
                      style={{ color: BRAND_COLOR }}
                    >
                      {category}
                    </h2>
                  </div>
                  <div
                    className="h-1 w-10 rounded mb-6 sm:mb-8 ml-12 sm:ml-[52px]"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />

                  <div className="relative">
                    <div
                      ref={(el) => {
                        scrollRefs.current[category] = el;
                      }}
                      className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {catItems.map((item) => renderTile(item))}
                    </div>

                    {showArrow && (
                      <button
                        onClick={() => scrollCategory(category, 1)}
                        aria-label={`Show more ${category} items`}
                        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg items-center justify-center hover:bg-gray-50 transition"
                      >
                        <ChevronRight className="w-5 h-5" style={{ color: BRAND_COLOR }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            // Filtered (single category) view — plain responsive grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {items.map((item) => (
                <div
                  key={item._id || item.id}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  {item.mediaType === "video" ? (
                    <>
                      <div
                        className="absolute inset-0 w-full h-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                      >
                        {isEmbeddableVideoUrl(item.mediaUrl) ? (
                          <iframe
                            src={getVideoEmbedUrl(item.mediaUrl, true)}
                            className="w-full h-full pointer-events-auto"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={item.title}
                          />
                        ) : (
                          <video
                            src={item.mediaUrl}
                            controls
                            className="w-full h-full object-contain bg-black"
                            title={item.title}
                          />
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
                        <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                        {item.description && (
                          <p className="text-white/80 text-xs mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div onClick={() => handleItemClick(item)} className="cursor-pointer w-full h-full">
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gray-200">
                              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="text-white font-semibold text-sm sm:text-base">{item.title}</h3>
                        {item.description && (
                          <p className="text-white/80 text-xs sm:text-sm mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal for viewing media */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="max-w-6xl w-full max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white rounded-lg overflow-hidden">
              {selectedItem.mediaType === "video" ? (
                <div className="relative w-full bg-black rounded-t-lg" style={{ paddingBottom: "56.25%" }}>
                  {isEmbeddableVideoUrl(selectedItem.mediaUrl) ? (
                    <iframe
                      key={`video-${selectedItem._id ?? selectedItem.id ?? selectedItem.mediaUrl}`}
                      src={getVideoEmbedUrl(selectedItem.mediaUrl)}
                      className="absolute inset-0 w-full h-full rounded-t-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedItem.title}
                    />
                  ) : (
                    <video
                      key={`video-${selectedItem._id ?? selectedItem.id ?? selectedItem.mediaUrl}`}
                      src={selectedItem.mediaUrl}
                      controls
                      autoPlay
                      className="absolute inset-0 w-full h-full rounded-t-lg object-contain"
                      title={selectedItem.title}
                    />
                  )}
                </div>
              ) : (
                <img
                  src={selectedItem.mediaUrl}
                  alt={selectedItem.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLOR }}>
                  {selectedItem.title}
                </h3>
                {selectedItem.description && <p className="text-gray-700 mb-2">{selectedItem.description}</p>}
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-[#E8F5F0] text-[#05627C]">
                  {selectedItem.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}