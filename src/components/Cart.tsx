import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2, ShoppingCart, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalTokens, 
    getTotalMoney, 
    userTokens,
    clearCart 
  } = useCart();
  const navigate = useNavigate();

  const totalTokens = getTotalTokens();
  const totalMoney = getTotalMoney();
  const totalMoneyKSH = totalMoney * 130; // Convert USD to KSH (approximate rate)

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some books to get started
            </p>
            <Button onClick={() => navigate('/')}>
              Browse Books
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">by {item.author}</p>
                      <Badge variant="outline" className="text-xs mb-2">
                        {item.condition}
                      </Badge>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.paymentMethod === 'tokens' ? (
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-token" />
                              <span className="font-medium">{item.tokenValue} tokens</span>
                            </div>
                          ) : (
                            <span className="font-medium">
                              KSH {((item.price || 0) * 130).toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Token Summary */}
                {totalTokens > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-token" />
                        Token Items
                      </span>
                      <span className="font-medium">{totalTokens} tokens</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Available: {userTokens} tokens
                    </div>
                    {totalTokens > userTokens && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        Insufficient tokens
                      </Badge>
                    )}
                  </div>
                )}

                {/* Money Summary */}
                {totalMoney > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span>Cash Items</span>
                      <span className="font-medium">
                        KSH {totalMoneyKSH.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <div className="text-right">
                      {totalTokens > 0 && (
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-token" />
                          <span>{totalTokens} tokens</span>
                        </div>
                      )}
                      {totalMoney > 0 && (
                        <div>KSH {totalMoneyKSH.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={totalTokens > userTokens}
                >
                  Proceed to Checkout
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;