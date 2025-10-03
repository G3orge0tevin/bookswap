import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Coins, Plus, Minus, TrendingUp } from "lucide-react";

interface UserToken {
  id: string;
  user_id: string;
  token_balance: number;
  total_earned: number;
  total_spent: number;
  profiles: {
    display_name: string;
    first_name: string;
    last_name: string;
  };
}

const TokenManagement = () => {
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTokenData();
  }, []);

  const loadTokenData = async () => {
    try {
      const { data: tokens, error } = await supabase
        .from('user_tokens')
        .select(`
          *,
          profiles (
            display_name,
            first_name,
            last_name
          )
        `);

      if (!error && tokens) {
        setUserTokens(tokens);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load token data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserTokens = async (userId: string, amount: number, action: 'add' | 'subtract') => {
    try {
      const currentUser = userTokens.find(ut => ut.user_id === userId);
      if (!currentUser) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive"
        });
        return;
      }

      const newBalance = action === 'add' 
        ? currentUser.token_balance + amount 
        : Math.max(0, currentUser.token_balance - amount);

      const { error } = await supabase
        .from('user_tokens')
        .update({ 
          token_balance: newBalance,
          total_earned: action === 'add' ? currentUser.total_earned + amount : currentUser.total_earned,
          total_spent: action === 'subtract' ? currentUser.total_spent + amount : currentUser.total_spent
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Tokens Updated",
        description: `${action === 'add' ? 'Added' : 'Removed'} ${amount} tokens`,
      });

      loadTokenData(); // Reload data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tokens",
        variant: "destructive"
      });
    }
  };

  const createUserTokenAccount = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_tokens')
        .insert({
          user_id: userId,
          token_balance: parseInt(tokenAmount) || 100,
          total_earned: parseInt(tokenAmount) || 100
        });

      if (error) throw error;

      toast({
        title: "Token Account Created",
        description: "User token account created successfully",
      });

      loadTokenData();
      setSelectedUserId('');
      setTokenAmount('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create token account",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalTokensInSystem = userTokens.reduce((sum, ut) => sum + ut.token_balance, 0);
  const totalEarned = userTokens.reduce((sum, ut) => sum + ut.total_earned, 0);
  const totalSpent = userTokens.reduce((sum, ut) => sum + ut.total_spent, 0);

  return (
    <div className="space-y-6">
      {/* Token Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTokensInSystem}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEarned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Token Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            User Token Accounts ({userTokens.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userTokens.map((userToken) => (
              <div key={userToken.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">
                    {userToken.profiles?.display_name || 
                     `${userToken.profiles?.first_name} ${userToken.profiles?.last_name}`}
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Balance: {userToken.token_balance} tokens</p>
                    <p>Earned: {userToken.total_earned} | Spent: {userToken.total_spent}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const amount = prompt('Enter token amount to add:');
                      if (amount) updateUserTokens(userToken.user_id, parseInt(amount), 'add');
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const amount = prompt('Enter token amount to remove:');
                      if (amount) updateUserTokens(userToken.user_id, parseInt(amount), 'subtract');
                    }}
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {userTokens.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No token accounts found. Users will have accounts created automatically when they interact with the token system.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenManagement;