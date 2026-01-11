import Link from "next/link";
import Image from "next/image";

export default function NewsInsightsSection() {
  const featuredArticle = {
    date: "JUN 20, 2025",
    category: "NEWS",
    headline:
      "With Invenergy's Support, Prysmian Doubles Down on U.S. Manufacturing and Domestic Energy Supply Chains",
    image: "/CTA1.webp",
  };

  const newsArticles = [
    {
      date: "JUN 12, 2025",
      category: "NEWS",
      headline:
        "Invenergy's Pleasant Prairie Solar Energy Center to Start Construction in Franklin County, Ohio",
    },
    {
      date: "JUN 4, 2025",
      category: "NEWS",
      headline: "Invenergy's Hardin III Commences Operations",
    },
    {
      date: "MAY 7, 2025",
      category: "NEWS",
      headline:
        "Grain Belt Express Awards $1.7B to U.S. Contractors Quanta and Kiewit to Build Largest Transmission Line in U.S. History",
    },
  ];

  return (
    <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-normal mb-3 sm:mb-4"
            style={{
              color: "#042B19",
              fontFamily: "var(--font-font4), sans-serif",
            }}
          >
            News & Insights
          </h2>
          <div className="h-px bg-[#E8F5F0] w-full"></div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
          {/* Left Side - Featured Article */}
          <div className="space-y-3 sm:space-y-4">
            <p
              className="text-xs sm:text-sm font-medium uppercase tracking-wide"
              style={{ color: "#042B19" }}
            >
              FEATURED
            </p>
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] bg-gray-200 overflow-hidden group">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.headline}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority
              />
            </div>
            <div
              className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm"
              style={{ color: "#042B19" }}
            >
              <span>{featuredArticle.date}</span>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="uppercase">{featuredArticle.category}</span>
            </div>
            <h3
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
              style={{ color: "#042B19" }}
            >
              <Link
                href="/news/featured"
                className="block transition-all duration-300 hover:translate-x-2 hover:opacity-80"
              >
                {featuredArticle.headline}
              </Link>
            </h3>
          </div>

          {/* Right Side - News Articles List */}
          <div className="space-y-0">
            {newsArticles.map((article, index) => (
              <div key={index}>
                <Link
                  href={`/news/${article.date
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="block py-4 sm:py-5 md:py-6 transition-all duration-300 hover:translate-x-2 hover:opacity-80"
                >
                  <div
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm mb-2 sm:mb-3"
                    style={{ color: "#042B19" }}
                  >
                    <span>{article.date}</span>
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="uppercase">{article.category}</span>
                  </div>
                  <h4
                    className="text-lg sm:text-xl md:text-2xl font-bold leading-tight transition-colors duration-300"
                    style={{ color: "#042B19" }}
                  >
                    {article.headline}
                  </h4>
                </Link>
                {index < newsArticles.length - 1 && (
                  <div className="h-px bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
