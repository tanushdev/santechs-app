import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import StatsSection from "@/components/home/StatsSection";
import FeaturedListings from "@/components/home/FeaturedListings";
import HowItWorks from "@/components/home/HowItWorks";
import CTASection from "@/components/home/CTASection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Santechs — B2B Textile Machinery & Recycling Plant Marketplace",
  description:
    "Buy and sell used and new textile machinery, recycling plants, raw materials, and spare parts. Connect with verified sellers across India and worldwide.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <StatsSection />
      <FeaturedListings />
      <HowItWorks />
      <CTASection />
    </>
  );
}
