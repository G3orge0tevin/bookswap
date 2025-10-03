import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Coins, CreditCard, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { items, getTotalTokens, getTotalMoney, clearCart, userTokens, setUserTokens } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const totalTokens = getTotalTokens();
  const totalMoney = getTotalMoney();
  const totalMoneyKSH = totalMoney * 130;

  const handleTokenPayment = async () => {
    if (totalTokens > userTokens) {
      toast({
        title: "Insufficient Tokens",
        description: "You don't have enough tokens for this purchase",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate token transaction
    setTimeout(() => {
      setUserTokens(userTokens - totalTokens);
      clearCart();
      toast({
        title: "Payment Successful!",
        description: `Used ${totalTokens} tokens for your purchase`
      });
      navigate('/');
      setLoading(false);
    }, 2000);
  };

  const handleMoneyPayment = async () => {
    if (paymentMethod === 'mpesa' && !phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      toast({
        title: "Card Details Required",  
        description: "Please fill in all card details",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      clearCart();
      toast({
        title: "Payment Successful!",
        description: `Paid KSH ${totalMoneyKSH.toLocaleString()} for your purchase`
      });
      navigate('/');
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  const tokenItems = items.filter(item => item.paymentMethod === 'tokens');
  const moneyItems = items.filter(item => item.paymentMethod === 'money');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tokenItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-token" />
                      <span>{item.tokenValue * item.quantity}</span>
                    </div>
                  </div>
                ))}

                {moneyItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span>KSH {((item.price || 0) * 130 * item.quantity).toLocaleString()}</span>
                  </div>
                ))}

                <Separator />

                {totalTokens > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Token Total:</span>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-token" />
                      <span className="font-semibold">{totalTokens} tokens</span>
                    </div>
                  </div>
                )}

                {totalMoney > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Cash Total:</span>
                    <span className="font-semibold">KSH {totalMoneyKSH.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            {/* Token Payment */}
            {totalTokens > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-token" />
                    Token Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Available: {userTokens} tokens
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Required: {totalTokens} tokens
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleTokenPayment}
                    disabled={totalTokens > userTokens || loading}
                  >
                    {loading ? 'Processing...' : `Pay with ${totalTokens} Tokens`}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Money Payment */}
            {totalMoney > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cash Payment - KSH {totalMoneyKSH.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={(value: 'mpesa' | 'card') => setPaymentMethod(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mpesa" id="mpesa" />
                      <Label htmlFor="mpesa" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        M-Pesa
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'mpesa' && (
                    <div>
                      <Label htmlFor="phone">M-Pesa Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="254XXXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="expiry">Expiry</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={handleMoneyPayment}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Pay KSH ${totalMoneyKSH.toLocaleString()}`}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;