import { Camera, Coins, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

const HowItWorks = () => {
  const steps = [
    {
      icon: Camera,
      title: "Photograph Your Book",
      description: "Take clear photos showing the title, condition, and any wear. Our AI helps assess the book's value instantly.",
      color: "text-condition-excellent"
    },
    {
      icon: Coins,
      title: "Earn Tokens",
      description: "Once received and verified, your book is converted to tokens based on condition, popularity, and rarity.",
      color: "text-token"
    },
    {
      icon: BookOpen,
      title: "Discover New Books",
      description: "Browse our community catalog and use your tokens to claim books that interest you. Or buy directly with money.",
      color: "text-primary"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            How BookSwap Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trading books has never been simpler. Join thousands of readers 
            building the world's most trusted book exchange.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4`}>
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    <span className="text-4xl font-bold text-primary/20">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow between cards */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-accent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;