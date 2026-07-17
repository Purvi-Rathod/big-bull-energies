"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Image as ImageIcon, Video, Filter } from "lucide-react";
import Footer from "@/components/Footer";
import { table } from "console";

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

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

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
        console.table(data.data.items);
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

  return (
    <main className="min-h-screen w-full overflow-x-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-[126px]">
      {/* Hero Section */}
      {/* <section className="relative w-full bg-[#E8F5F0] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="h-px w-8 sm:w-12" style={{ backgroundColor: "#05627C" }}></div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "#05627C" }}
              >
                GALLERY
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-tight mb-4 sm:mb-6 px-2"
              style={{
                color: "#05627C",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Our Visual Story
            </h1>
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-2"
              style={{
                color: "#05627C",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Explore our solar plants, office spaces, events, and more through photos and videos.
            </p>
          </div>
        </div>
      </section> */}

      {/* Category Filter */}
      {categories.length > 0 && (
        <section
          className="relative w-full bg-white py-6 sm:py-8 border-b-2"
          style={{ borderColor: "#05627C", opacity: 0.9 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
              <Filter className="w-5 h-5" style={{ color: "#05627C" }} />
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
                  style={{ borderColor: "#05627C" }}
                ></div>
                <p className="mt-4" style={{ color: "#05627C" }}>
                  Loading gallery...
                </p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: "#05627C" }}>
                No gallery items found.
              </p>
            </div>
          ) : (
            <>
              {/* Show grouped by category if no filter */}
              {!selectedCategory ? (
                Object.keys(groupedItems).map((category) => (
                  <div key={category} className="mb-12 sm:mb-16">
                    <h2
                      className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8"
                      style={{ color: "#05627C" }}
                    >
                      {category}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {groupedItems[category].map((item) => (
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
                                <h3 className="text-white font-semibold text-sm">
                                  {item.title}
                                </h3>
                                {item.description && (
                                  <p className="text-white/80 text-xs mt-0.5 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </>
                          ) : (
                            <div
                              onClick={() => handleItemClick(item)}
                              className="cursor-pointer w-full h-full"
                            >
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
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
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
                            <h3 className="text-white font-semibold text-sm">
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-white/80 text-xs mt-0.5 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => handleItemClick(item)}
                          className="cursor-pointer w-full h-full"
                        >
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
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal for viewing media */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="max-w-6xl w-full max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
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
              {selectedItem.mediaType === "video" ? (
                <div
                  className="relative w-full bg-black rounded-t-lg"
                  style={{ paddingBottom: "56.25%" }}
                >
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
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: "#05627C" }}
                >
                  {selectedItem.title}
                </h3>
                {selectedItem.description && (
                  <p className="text-gray-700 mb-2">
                    {selectedItem.description}
                  </p>
                )}
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
