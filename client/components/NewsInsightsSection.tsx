import Image from "next/image";

export default function NewsInsightsSection() {
  const featuredArticle = {
    date: "JAN 15, 2025",
    category: "NEWS",
    headline:
      "With Invenergy's Support, Prysmian Doubles Down on U.S. Manufacturing and Domestic Energy Supply Chains",
    image: "/event.jpeg",
  };

  const newsArticles = [
    {
      date: "JAN 10, 2025",
      category: "NEWS",
      headline:
        "Crown Bankers Expands Solar Energy Investment Portfolio Across Multiple Regions",
      description:
        "Crown Bankers announces significant expansion of its solar energy investment portfolio, with new projects launching in key markets. This expansion strengthens the company's commitment to renewable energy and provides investors with diversified opportunities.",
    },
    {
      date: "JAN 5, 2025",
      category: "ANNOUNCEMENT",
      headline: "Crown Bankers Reaches Milestone: 10,000 Active Investors Worldwide",
      description:
        "Crown Bankers celebrates a major milestone as the platform reaches 10,000 active investors globally. This achievement reflects the growing trust in Crown Bankers' innovative approach to binary investment and sustainable energy.",
    },
    {
      date: "DEC 28, 2024",
      category: "NEWS",
      headline:
        "New Investment Packages Released: Enhanced Returns for Crown Bankers Members",
      description:
        "Crown Bankers introduces new investment packages with enhanced returns and flexible terms. These packages are designed to meet the diverse needs of investors while maintaining the company's commitment to sustainable energy projects.",
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
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] bg-gray-200 overflow-hidden group object-cover">
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
              {featuredArticle.headline}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-3 sm:mt-4 leading-relaxed">
              Crown Bankers announces the launch of its innovative binary investment platform, combining network marketing excellence with sustainable energy investments. The platform offers investors unique opportunities to build wealth while contributing to the global transition to renewable energy.
            </p>
          </div>

          {/* Right Side - News Articles List */}
          <div className="space-y-0">
            {newsArticles.map((article, index) => (
              <div key={index} className="py-4 sm:py-5 md:py-6">
                <div
                  className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm mb-2 sm:mb-3"
                  style={{ color: "#042B19" }}
                >
                  <span>{article.date}</span>
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
                  <span className="uppercase">{article.category}</span>
                </div>
                <h4
                  className="text-lg sm:text-xl md:text-2xl font-bold leading-tight mb-2 sm:mb-3"
                  style={{ color: "#042B19" }}
                >
                  {article.headline}
                </h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {article.description}
                </p>
                {index < newsArticles.length - 1 && (
                  <div className="h-px bg-gray-200 mt-4 sm:mt-5 md:mt-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
