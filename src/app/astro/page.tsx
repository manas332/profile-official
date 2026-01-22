import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import Header from "@/components/astro/Header";
import HeroSection from "@/components/astro/HeroSection";
import AboutSection from "@/components/astro/AboutSection";
import ConsultationPackages from "@/components/astro/ConsultationPackages";
import QuoteOfDay from "@/components/astro/QuoteOfDay";
import ProductsSection from "@/components/astro/ProductsSection";
import PanchangCard from "@/components/astro/PanchangCard";
import Footer from "@/components/astro/Footer";
import FloatingConsultationButton from "@/components/astro/FloatingConsultationButton";

export default async function AstroPage() {
  const session = await getSession();

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <AboutSection />
      <ConsultationPackages />
      <QuoteOfDay />
      <ProductsSection />
      <PanchangCard />
      <Footer />
      <FloatingConsultationButton />
    </div>
  );
}
