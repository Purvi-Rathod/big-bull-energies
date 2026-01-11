"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Testimonial {
  category: string;
  quote: string;
  name: string;
  title: string;
  image: string;
}

export default function TestimonialMarquee() {
  const testimonials: Testimonial[] = [
    {
      category: "COMMUNITIES",
      quote:
        "We partner with communities and landowners across the country to provide jobs, significant tax revenues and payments to landowners, while providing low-cost, reliable energy to customers.",
      name: "BRISTI CURE",
      title: "SENIOR VICE PRESIDENT, DEVELOPMENT, INVENERGY",
      image: "/testimonial1.webp",
    },
    {
      category: "CUSTOMERS",
      quote:
        "Winning the AI race requires cleaner, affordable energy and infrastructure - today and in the future. We're grateful for our continued partnership with Meta and look forward to strengthening our partnerships as we work to support American energy independence and economic prosperity.",
      name: "TED ROMAINE",
      title: "EXECUTIVE VICE PRESIDENT, ORIC",
      image: "/testimonial2.webp",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance testimonials every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-normal mb-6 sm:mb-8"
          style={{
            color: "#042B19",
            fontFamily: "var(--font-font4), sans-serif",
          }}
        >
          How We work with partners
        </h2>

        {/* Testimonial Card */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center justify-center">
            {/* Left Side - Image */}
            <div className="flex justify-center order-1 lg:order-1">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-gray-200">
                <Image
                  key={currentIndex}
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  fill
                  className="object-cover transition-opacity duration-500"
                />
              </div>
            </div>

            {/* Right Side - Content */}
            <div
              key={currentIndex}
              className="space-y-3 sm:space-y-4 text-center lg:text-left animate-fade-in order-2 lg:order-2"
            >
              {/* Category */}
              <div>
                <h3
                  className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 uppercase tracking-wide"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-custom), 'CustomFont', sans-serif",
                  }}
                >
                  {currentTestimonial.category}
                </h3>
                <div
                  className="h-px w-16 sm:w-20 mx-auto lg:mx-0"
                  style={{ backgroundColor: "#042B19" }}
                ></div>
              </div>

              {/* Quote */}
              <p
                className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed px-2 sm:px-0"
                style={{
                  color: "#16a34a",
                  fontFamily: "var(--font-custom), 'CustomFont', sans-serif",
                }}
              >
                &quot;{currentTestimonial.quote}&quot;
              </p>

              {/* Attribution */}
              <div className="pt-3 sm:pt-4">
                <div
                  className="h-px w-full mb-3 sm:mb-4"
                  style={{ backgroundColor: "#042B19" }}
                ></div>
                <p
                  className="text-xs sm:text-sm uppercase tracking-wide"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-custom), 'CustomFont', sans-serif",
                  }}
                >
                  {currentTestimonial.name}
                </p>
                <p
                  className="text-xs sm:text-sm uppercase tracking-wide mt-1"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-custom), 'CustomFont', sans-serif",
                  }}
                >
                  {currentTestimonial.title}
                </p>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mt-8 sm:mt-10 md:mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 sm:w-12" : "w-2 sm:w-3"
                }`}
                style={{
                  backgroundColor:
                    index === currentIndex ? "#042B19" : "#D1D5DB",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
            <span className="text-xs sm:text-sm text-gray-600 ml-2">
              {currentIndex + 1} OF {testimonials.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
