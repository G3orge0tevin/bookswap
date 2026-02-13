import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Coins, CreditCard, Phone, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkRateLimit, recordAttempt, RATE_LIMITS } from "@/lib/rateLimit";

const TokenPurchase = () => {
  const { user } = useAuth();
  const { userTokens, setUserTokens } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [tokenAmount, setTokenAmount] = useState<number>(50);
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
    { tokens: 100, price: 950, popular: true },
    { tokens: 200, price: 1800, popular: false },
    { tokens: 500, price: 4250, popular: false }
  ];

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tokens",
        variant: "destructive"
      });
      return;
    }

    // Check rate limit
    const { allowed, remainingAttempts } = await checkRateLimit({
      operationType: 'token_purchase',
      userId: user.id,
      maxAttempts: RATE_LIMITS.TOKEN_PURCHASE.maxAttempts,
      windowMinutes: RATE_LIMITS.TOKEN_PURCHASE.windowMinutes,
    });

    if (!allowed) {
      toast({
        title: "Rate limit exceeded",
        description: `You can only make ${RATE_LIMITS.TOKEN_PURCHASE.maxAttempts} purchases per hour. Please try again later.`,
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'mpesa') {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: { amount: totalPrice, phoneNumber: phoneNumber }
      });

      if (error) throw error;

      toast({
        title: "STK Push Sent",
        description: "Please enter your PIN on your phone to complete the purchase.",
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Could not initiate M-Pesa payment.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
      // Fetch current token balance
      const { data: currentData, error: fetchError } = await supabase
        .from('user_tokens')
        .select('token_balance, total_earned')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newBalance = currentData.token_balance + tokenAmount;
      const newTotalEarned = currentData.total_earned + tokenAmount;

      // Update token balance in database
      const { error: updateError } = await supabase
        .from('user_tokens')
        .update({ 
          token_balance: newBalance,
          total_earned: newTotalEarned
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record successful purchase
      await recordAttempt('token_purchase', user.id);

      // Update local state
      setUserTokens(newBalance);
      
      toast({
        title: "Purchase Successful!",
        description: `You've purchased ${tokenAmount} tokens`
      });
      
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPackage = tokenPackages.find(pkg => pkg.tokens === tokenAmount);
  const totalPrice = selectedPackage?.price || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-2">Purchase Tokens</h1>
        <p className="text-muted-foreground mb-8">
          Current Balance: <span className="font-semibold text-token">{userTokens} tokens</span>
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Token Packages */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-token" />
                  Select Token Package
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tokenPackages.map((pkg) => (
                  <div
                    key={pkg.tokens}
                    onClick={() => setTokenAmount(pkg.tokens)}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      tokenAmount === pkg.tokens
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <Coins className="h-5 w-5 text-token" />
                          <span className="font-bold text-lg">{pkg.tokens} Tokens</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          KSH {pkg.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payment Method */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Selected Package:</span>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-token" />
                      <span className="font-semibold">{tokenAmount} tokens</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">KSH {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

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
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Purchase ${tokenAmount} Tokens`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPurchase;
