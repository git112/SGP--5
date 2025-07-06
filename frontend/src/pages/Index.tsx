import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { FloatingBot } from "@/components/FloatingBot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground fade-in">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <FAQSection />
      <Footer />
      <FloatingBot />
    </div>
  );
};

export default Index;
