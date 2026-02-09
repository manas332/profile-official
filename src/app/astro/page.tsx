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
import { getAstroData } from "@/lib/aws/astro";
import { getProducts } from "@/app/actions";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function AstroPage() {
  // Public access - no session check required


  // Fetch directly from DB instead of internal API to avoid network issues inside server component
  const astroData = await getAstroData();

  // Fetch products for the products section
  const productsResult = await getProducts();
  const allProducts = productsResult.success && productsResult.data ? productsResult.data : [];
  const topProducts = (allProducts as Product[]).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection
        name={astroData.name}
        description={astroData.description}
        photoUrl={astroData.photoUrl}
      />
      <AboutSection
        name={astroData.name}
        description={astroData.description}
      />
      <ConsultationPackages packages={astroData.packages} />
      <QuoteOfDay quotes={astroData.quotes} />
      <ProductsSection products={topProducts} />
      <PanchangCard />
      <Footer />
      <FloatingConsultationButton />
    </div>
  );
}
