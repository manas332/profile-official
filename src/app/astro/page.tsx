import Header from "@/components/astro/Header";
import HeroSection from "@/components/astro/HeroSection";
import AboutSection from "@/components/astro/AboutSection";
import CTASection from "@/components/astro/CTASection";
import ConsultationPackages from "@/components/astro/ConsultationPackages";
import QuoteOfDay from "@/components/astro/QuoteOfDay";
import ProductsSection from "@/components/astro/ProductsSection";
import Footer from "@/components/astro/Footer";

export default function AstroPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <AboutSection />
      <CTASection />
      <ConsultationPackages />
      <QuoteOfDay />
      <ProductsSection />
      <Footer />
    </div>
  );
}
