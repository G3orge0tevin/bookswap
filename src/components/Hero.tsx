import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Coins, Camera } from "lucide-react";
import heroImage from "@/assets/hero-books.jpg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-85"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Trade Your Books,
            <span className="block text-accent"> Unlock New Stories</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Turn your finished books into tokens. Use tokens to discover your next favorite read. 
            Build a community of book lovers, one trade at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="accent" className="font-semibold" onClick={() => scrollToSection('upload')}>
              Start Trading
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => scrollToSection('catalog')}>
              Browse Books
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-sm opacity-80">Books Available</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-8 w-8 text-accent" />
              </div>
              <div className="text-2xl font-bold">50,000+</div>
              <div className="text-sm opacity-80">Tokens Traded</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Camera className="h-8 w-8 text-accent" />
              </div>
              <div className="text-2xl font-bold">5,000+</div>
              <div className="text-sm opacity-80">Happy Traders</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;