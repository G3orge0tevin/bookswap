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
      <div id="catalog">
        <BookCatalog />
      </div>
      <div id="upload">
        <UploadSection />
      </div>
    </div>
  );
};

export default Index;
