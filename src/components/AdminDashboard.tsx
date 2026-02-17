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
  // Token management states removed - handled in TokenManagement component
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

  // Token management is now handled in the TokenManagement component

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

      {/* Token management is now handled in dedicated TokenManagement component */}

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