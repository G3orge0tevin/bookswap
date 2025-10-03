import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Coins, Star, Eye } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface BookCardProps {
  title: string;
  author: string;
  condition: "excellent" | "good" | "fair" | "poor";
  tokenValue: number;
  price?: number;
  image: string;
  rating: number;
  genre: string;
}

const BookCard = ({ 
  title, 
  author, 
  condition, 
  tokenValue, 
  price, 
  image, 
  rating, 
  genre 
}: BookCardProps) => {
  const { addToCart, userTokens } = useCart();
  const { toast } = useToast();

  const handleUseTokens = () => {
    if (userTokens < tokenValue) {
      toast({
        title: "Insufficient Tokens",
        description: `You need ${tokenValue} tokens but only have ${userTokens}`,
        variant: "destructive"
      });
      return;
    }

    addToCart({
      title,
      author,
      image,
      tokenValue,
      price,
      condition,
      paymentMethod: 'tokens'
    });

    toast({
      title: "Added to Cart",
      description: `${title} added to cart (${tokenValue} tokens)`
    });
  };

  const handleBuyWithMoney = () => {
    if (!price) return;

    addToCart({
      title,
      author,
      image,
      tokenValue,
      price,
      condition,
      paymentMethod: 'money'
    });

    toast({
      title: "Added to Cart", 
      description: `${title} added to cart (KSH ${(price * 130).toLocaleString()})`
    });
  };
  const conditionColors = {
    excellent: "bg-condition-excellent text-white",
    good: "bg-condition-good text-white", 
    fair: "bg-condition-fair text-white",
    poor: "bg-condition-poor text-white"
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="relative overflow-hidden rounded-t-lg">
        <img 
          src={image} 
          alt={title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className={`absolute top-3 left-3 ${conditionColors[condition]} capitalize`}>
          {condition}
        </Badge>
        <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
          {genre}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-3">by {author}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${
                  i < Math.floor(rating) 
                    ? 'text-token fill-current' 
                    : 'text-muted-foreground'
                }`} 
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({rating})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-token" />
            <span className="font-semibold text-token">{tokenValue} tokens</span>
          </div>
          {price && (
            <span className="text-sm text-muted-foreground">or KSH {(price * 130).toLocaleString()}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          className="flex-1" 
          size="sm" 
          onClick={handleUseTokens}
          disabled={userTokens < tokenValue}
        >
          <Coins className="h-4 w-4 mr-2" />
          Use Tokens
        </Button>
        {price && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleBuyWithMoney}
          >
            Buy KSH {(price * 130).toLocaleString()}
          </Button>
        )}
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookCard;