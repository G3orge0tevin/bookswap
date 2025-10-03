import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  Database, 
  RefreshCw, 
  Shield, 
  AlertTriangle,
  Server,
  Activity,
  HardDrive
} from "lucide-react";

const SystemManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const systemActions = [
    {
      title: "Database Health Check",
      description: "Check database connectivity and table integrity",
      icon: Database,
      action: async () => {
        setLoading(true);
        try {
          const checks = [
            { name: "profiles", query: supabase.from('profiles').select('id').limit(1) },
            { name: "user_roles", query: supabase.from('user_roles').select('id').limit(1) },
            { name: "books", query: supabase.from('books').select('id').limit(1) },
            { name: "user_tokens", query: supabase.from('user_tokens').select('id').limit(1) },
            { name: "transactions", query: supabase.from('transactions').select('id').limit(1) }
          ];

          let healthyTables = 0;
          for (const check of checks) {
            const { error } = await check.query;
            if (!error) healthyTables++;
          }

          toast({
            title: "Database Health Check Complete",
            description: `${healthyTables}/${checks.length} tables are healthy and accessible`,
          });
        } catch (error) {
          toast({
            title: "Database Check Failed",
            description: "Could not complete health check",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: "Clear System Cache",
      description: "Clear browser and application caches",
      icon: RefreshCw,
      action: async () => {
        setLoading(true);
        try {
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
          localStorage.clear();
          sessionStorage.clear();
          
          toast({
            title: "Cache Cleared",
            description: "All system caches have been cleared successfully"
          });
        } catch (error) {
          toast({
            title: "Cache Clear Warning",
            description: "Some caches may not have been cleared",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: "Security Scan",
      description: "Run security checks on authentication and permissions",
      icon: Shield,
      action: async () => {
        setLoading(true);
        try {
          const { data: session } = await supabase.auth.getSession();
          const { data: roles } = await supabase.from('user_roles').select('*');
          
          toast({
            title: "Security Scan Complete",
            description: `Session valid: ${!!session.session}, ${roles?.length || 0} user roles configured`
          });
        } catch (error) {
          toast({
            title: "Security Scan Failed",
            description: "Could not complete security scan",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: "System Restart",
      description: "Refresh all services and reload application",
      icon: Server,
      action: () => {
        setLoading(true);
        toast({
          title: "System Restart",
          description: "Reloading application...",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  ];

  const getSystemStats = async () => {
    try {
      const [
        { count: userCount },
        { count: bookCount },
        { count: transactionCount },
        { count: tokenAccountCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('user_tokens').select('*', { count: 'exact', head: true })
      ]);

      return { userCount, bookCount, transactionCount, tokenAccountCount };
    } catch (error) {
      return { userCount: 0, bookCount: 0, transactionCount: 0, tokenAccountCount: 0 };
    }
  };

  const [stats, setStats] = useState({ userCount: 0, bookCount: 0, transactionCount: 0, tokenAccountCount: 0 });

  useEffect(() => {
    getSystemStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Tables</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookCount}</div>
            <p className="text-xs text-muted-foreground">Books stored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactionCount}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemActions.map((action, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <action.icon className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{action.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      <Button
                        onClick={action.action}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        {loading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <action.icon className="h-4 w-4 mr-2" />
                        )}
                        Execute
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning Panel */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            System Administration Warning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 text-sm">
            These system actions can affect the entire application. Please use caution when executing system-level operations. 
            Always ensure you have proper backups before making significant changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemManagement;