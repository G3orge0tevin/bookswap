import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Coins, CreditCard, Phone, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TokenPurchase = () => {
  const { user } = useAuth();
  const { userTokens, setUserTokens } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tokenAmount, setTokenAmount] = useState(50);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const tokenPackages = [
    { tokens: 50, price: 500, popular: false },
    { tokens: 100, price: 900, popular: true },
    { tokens: 250, price: 2000, popular: false },
    { tokens: 500, price: 3500, popular: false },
  ];

  const priceKSH = tokenPackages.find(pkg => pkg.tokens === tokenAmount)?.price || 
    Math.round(tokenAmount * 8);

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase tokens",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

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

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update token balance in database
      const { data: currentBalance, error: fetchError } = await supabase
        .from('user_tokens')
        .select('token_balance, total_earned')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If no record exists, create one
        const { error: insertError } = await supabase
          .from('user_tokens')
          .insert({
            user_id: user.id,
            token_balance: tokenAmount,
            total_earned: tokenAmount
          });

        if (insertError) throw insertError;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_tokens')
          .update({
            token_balance: currentBalance.token_balance + tokenAmount,
            total_earned: currentBalance.total_earned + tokenAmount
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: user.id,
        token_amount: tokenAmount,
        amount_ksh: priceKSH,
        transaction_type: 'token_purchase',
        payment_method: paymentMethod,
        status: 'completed'
      });

      setUserTokens(userTokens + tokenAmount);

      toast({
        title: "Purchase Successful!",
        description: `You've purchased ${tokenAmount} tokens for KSH ${priceKSH.toLocaleString()}`
      });

      navigate('/');
    } catch (error) {
      console.error('Token purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Purchase Tokens</h1>
          <p className="text-muted-foreground">
            Buy tokens to trade for books on our platform
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Token Packages */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-token" />
                  Select Token Package
                </CardTitle>
                <CardDescription>
                  Current Balance: {userTokens} tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {tokenPackages.map((pkg) => (
                    <button
                      key={pkg.tokens}
                      onClick={() => setTokenAmount(pkg.tokens)}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        tokenAmount === pkg.tokens
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Popular
                          </span>
                        </div>
                      )}
                      <div className="text-2xl font-bold mb-1">{pkg.tokens}</div>
                      <div className="text-sm text-muted-foreground">tokens</div>
                      <div className="text-lg font-semibold mt-2">
                        KSH {pkg.price}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Label htmlFor="customAmount">Or enter custom amount</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    min="10"
                    max="1000"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(Number(e.target.value))}
                    placeholder="Enter token amount"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Price: KSH {priceKSH.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Total: KSH {priceKSH.toLocaleString()} for {tokenAmount} tokens
                </CardDescription>
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
                  onClick={handlePurchase}
                  disabled={loading || tokenAmount < 10}
                >
                  {loading ? 'Processing...' : `Purchase ${tokenAmount} Tokens`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By purchasing, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPurchase;
