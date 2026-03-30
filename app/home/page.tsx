import GlassHeader from "@/components/layout/header";
import HeroSection from "@/components/home/heroSection";
import BestSellersSection from "@/components/home/best-sellers-section";
import PromiseStrip from "@/components/home/promise-strip";
import CustomisationSection from "@/components/home/customisation-section";
import MenuCategoriesSection from "@/components/home/menu-categories-section";
import DiptychSection from "@/components/home/diptych-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import SocialCalloutSection from "@/components/home/social-callout-section";
import LocationSection from "@/components/home/location-section";
import NewsletterSection from "@/components/home/newsletter-section";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <HeroSection />
      {/* <GlassHeader />
      <HeroSection />
      <BestSellersSection />
      <PromiseStrip />
      <CustomisationSection />
      <MenuCategoriesSection />
      <DiptychSection />
      <TestimonialsSection />
      <SocialCalloutSection />
      <LocationSection />
      <NewsletterSection /> */}
    </div>
  );
}
