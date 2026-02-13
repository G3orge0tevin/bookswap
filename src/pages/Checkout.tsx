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
import { Coins, CreditCard, Phone, CheckCircle2, Home, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "@/components/Receipt"; 

const Checkout = () => {
  const { items, getTotalTokens, getTotalMoney, clearCart, userTokens, setUserTokens } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for showing the receipt after successful payment
  const [receipt, setReceipt] = useState<any>(null);

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

  // --- 1. TOKEN PAYMENT HANDLER ---
  const handleTokenPayment = async () => {
    if (totalTokens > userTokens) {
      toast({ title: "Insufficient Tokens", description: "You don't have enough tokens.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setLoading(true);
    
    try {
      // A. Deduct Tokens
      const { data: currentData, error: fetchError } = await supabase
        .from('user_tokens')
        .select('token_balance, total_spent')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newBalance = currentData.token_balance - totalTokens;
      const newTotalSpent = currentData.total_spent + totalTokens;

      const { error: updateError } = await supabase
        .from('user_tokens')
        .update({ token_balance: newBalance, total_spent: newTotalSpent })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // B. Record Transaction (FIXED: Saves book_id now)
      const { error: txError } = await supabase.from('transactions').insert(
        items.filter(item => item.paymentMethod === 'tokens').map(item => ({
          user_id: user.id,
          book_id: item.bookId, // <--- SAVES THE REAL BOOK ID
          transaction_type: 'purchase',
          payment_method: 'tokens',
          token_amount: item.tokenValue,
          amount_ksh: 0,
          status: 'completed'
        }))
      );

      if (txError) console.error("Transaction Record Error:", txError);

      // C. Success State
      setUserTokens(newBalance);
      
      const receiptId = `TKN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setReceipt({
        receiptNumber: receiptId,
        date: new Date().toLocaleString(),
        items: [...items.filter(i => i.paymentMethod === 'tokens')],
        total: `${totalTokens} Tokens`,
        paymentMethod: 'Token Balance'
      });

      toast({ title: "Payment Successful!", description: `Used ${totalTokens} tokens` });
      
    } catch (error: any) {
      toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. MONEY PAYMENT HANDLER (M-Pesa & Card) ---
  const handleMoneyPayment = async () => {
    if (!user) return;

    if (paymentMethod === 'mpesa' && !phoneNumber) {
      toast({ title: "Error", description: "Phone number required", variant: "destructive" });
      return;
    }

    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      toast({ title: "Error", description: "Card details required", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'mpesa') {
        // --- REAL MPESA STK PUSH ---
        const formattedPhone = phoneNumber.startsWith('254') 
          ? phoneNumber 
          : `254${phoneNumber.replace(/^0/, '')}`;

        const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
          body: { amount: totalMoneyKSH, phoneNumber: formattedPhone, userId: user.id }
        });

        if (error) throw error;

        if (data?.ResponseCode === "0") {
          toast({ title: "STK Push Sent", description: "Check your phone to enter PIN" });
          // Note: We don't show receipt yet because we wait for callback confirmation
        } else {
          throw new Error(data?.CustomerMessage || "Failed to initiate M-Pesa");
        }

      } else {
        // --- CARD PAYMENT (Simulated) ---
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Record Transaction (FIXED: Saves book_id now)
        await supabase.from('transactions').insert(
          items.filter(item => item.paymentMethod === 'money').map(item => ({
            user_id: user.id,
            book_id: item.bookId, // <--- SAVES THE REAL BOOK ID
            transaction_type: 'purchase',
            payment_method: 'card',
            token_amount: 0,
            amount_ksh: item.price! * 130,
            status: 'completed'
          }))
        );

        const receiptId = `CRD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        setReceipt({
          receiptNumber: receiptId,
          date: new Date().toLocaleString(),
          items: [...items.filter(i => i.paymentMethod === 'money')],
          total: `KSH ${totalMoneyKSH.toLocaleString()}`,
          paymentMethod: 'Credit Card'
        });

        toast({ title: "Success", description: "Card payment processed" });
      }
    } catch (error: any) {
      toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0 && !receipt) {
      navigate('/cart');
    }
  }, [items.length, receipt, navigate]);

  // --- 3. RENDER RECEIPT VIEW ---
  if (receipt) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-700">Payment Successful!</h1>
          <p className="text-muted-foreground">Your transaction has been recorded.</p>
        </div>

        <Receipt {...receipt} />

        <div className="flex gap-4 mt-8">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button onClick={() => { clearCart(); navigate('/'); }} className="gap-2">
            <Home className="h-4 w-4" /> Finish
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

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
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
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
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
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
                    <p className="text-sm text-muted-foreground">Available: {userTokens} tokens</p>
                    <p className="text-sm text-muted-foreground">Required: {totalTokens} tokens</p>
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
                        <Phone className="h-4 w-4" /> M-Pesa
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Credit/Debit Card
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'mpesa' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="phone">M-Pesa Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="2547XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <Input placeholder="Cardholder Name" value={cardDetails.name} onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})} />
                      <Input placeholder="Card Number" value={cardDetails.number} onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})} />
                        <Input placeholder="CVV" value={cardDetails.cvv} onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})} />
                      </div>
                    </div>
                  )}

                  <Button className="w-full" onClick={handleMoneyPayment} disabled={loading}>
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