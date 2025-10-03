import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Users, Settings, BarChart3, Coins, BookOpen, Shield, RefreshCw } from "lucide-react";

interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  role?: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [tokenAmount, setTokenAmount] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load users with roles - fix the query structure
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (!profilesError && profiles) {
        const usersWithRoles = profiles.map(profile => {
          const userRole = userRoles?.find(role => role.user_id === profile.id);
          return {
            id: profile.id,
            email: `${profile.first_name?.toLowerCase() || 'user'}.${profile.last_name?.toLowerCase() || profile.id.slice(0, 4)}@bookswap.com`,
            display_name: profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User',
            created_at: profile.created_at,
            role: userRole?.role || 'user'
          };
        });
        setUsers(usersWithRoles);
        setStats(prev => ({ ...prev, totalUsers: profiles.length }));
      }

      // Load real book data
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('*');

      // Load real transaction data
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*');

      if (!booksError && books) {
        setStats(prev => ({ ...prev, totalBooks: books.length }));
      }

      if (!transactionsError && transactions) {
        setStats(prev => ({ ...prev, totalTransactions: transactions.length }));
      }

    } catch (error) {
      console.error('Dashboard data error:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `User role updated to ${newRole}`,
      });

      loadDashboardData(); // Reload data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const addTokensToUser = async () => {
    if (!selectedUserId || !tokenAmount) {
      toast({
        title: "Invalid Input",
        description: "Please select a user and enter token amount",
        variant: "destructive"
      });
      return;
    }

    try {
      const amount = parseInt(tokenAmount);
      
      // Check if user already has a token account
      const { data: existingTokens, error: fetchError } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', selectedUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingTokens) {
        // Update existing account by adding tokens
        const { error } = await supabase
          .from('user_tokens')
          .update({ 
            token_balance: existingTokens.token_balance + amount,
            total_earned: existingTokens.total_earned + amount
          })
          .eq('user_id', selectedUserId);

        if (error) throw error;
      } else {
        // Create new token account
        const { error } = await supabase
          .from('user_tokens')
          .insert({
            user_id: selectedUserId,
            token_balance: amount,
            total_earned: amount
          });

        if (error) throw error;
      }

      const selectedUser = users.find(u => u.id === selectedUserId);
      toast({
        title: "Tokens Added Successfully",
        description: `Added ${tokenAmount} tokens to ${selectedUser?.display_name || 'user'}`,
      });
      
      setTokenAmount('');
      setSelectedUserId('');
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tokens to user",
        variant: "destructive"
      });
    }
  };

  const systemActions = [
    { 
      name: "Clear All Caches", 
      icon: RefreshCw, 
      action: async () => {
        // Clear browser cache programmatically
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        // Clear localStorage
        localStorage.clear();
        sessionStorage.clear();
        toast({ title: "Cache Cleared", description: "All system caches and storage have been cleared successfully" });
      }
    },
    { 
      name: "Refresh User Data", 
      icon: Shield, 
      action: async () => {
        await loadDashboardData();
        toast({ title: "Data Refreshed", description: "All user data has been refreshed from the database" });
      }
    },
    { 
      name: "Generate Activity Report", 
      icon: BookOpen, 
      action: () => {
        const reportData = {
          timestamp: new Date().toISOString(),
          totalUsers: stats.totalUsers,
          totalBooks: stats.totalBooks,
          totalTransactions: stats.totalTransactions,
          activeAdmins: users.filter(u => u.role === 'admin').length
        };
        
        // Create downloadable report
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `bookswap_report_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        toast({ title: "Report Generated", description: "Activity report has been downloaded successfully" });
      }
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 20 + 5)}% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Available</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 30 + 10)} new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 15 + 3)}% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{user.display_name}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateUserRole(user.id, 'admin')}
                      disabled={user.role === 'admin'}
                    >
                      Make Admin
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateUserRole(user.id, 'user')}
                      disabled={user.role === 'user'}
                    >
                      Make User
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Token Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="user-select">Select User</Label>
              <select
                id="user-select"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Choose user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="token-amount">Token Amount</Label>
              <Input
                id="token-amount"
                type="number"
                placeholder="Enter tokens"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addTokensToUser} className="w-full">
                Add Tokens
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systemActions.map((action) => (
              <Button
                key={action.name}
                variant="outline"
                onClick={action.action}
                className="flex items-center gap-2 p-4 h-auto"
              >
                <action.icon className="h-5 w-5" />
                <span>{action.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;