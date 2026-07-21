"use client";

import HeroSection from "@/components/HeroSection";
import ExpertiseSection from "@/components/ExpertiseSection";
import CTASection from "@/components/CTASection";
import NewsInsightsSection from "@/components/NewsInsightsSection";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import ProjectsSection from "@/components/ProjectsSection";
import TechnologiesMarquee from "@/components/TechnologiesMarquee";
import EnergyTechnologiesSection from "@/components/EnergyTechnologiesSection";
import ImpactSection from "@/components/ImpactSection";
import LearnMoreSection from "@/components/LearnMoreSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      <HeroSection />
      <ExpertiseSection />
      <TechnologiesMarquee />
      <EnergyTechnologiesSection />
      <ProjectsSection />
      <TestimonialMarquee />
      {/* <ImpactSection /> */}
      <NewsInsightsSection />
      <LearnMoreSection />
      <CTASection />
      <Footer />
    </main>
  );
}