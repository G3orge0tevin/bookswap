import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import BookCatalog from "@/components/BookCatalog";
import UploadSection from "@/components/UploadSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <BookCatalog />
      <UploadSection />
    </div>
  );
};

export default Index;
