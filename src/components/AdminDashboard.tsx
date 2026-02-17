import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Trash2,
  ShieldAlert,
  History,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [books, setBooks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, loading, navigate]);

  const fetchData = async () => {
    // 1. Fetch Books
    const { data: booksData } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 2. Fetch Users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // 3. Fetch Transactions
    const { data: txData } = await supabase
      .from('transactions')
      .select('*, profiles(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (booksData) setBooks(booksData);
    if (usersData) setUsers(usersData);
    if (txData) setTransactions(txData);
  };

  const handleApproveBook = async (bookId: string) => {
    const { error } = await supabase
      .from('books')
      .update({ status: 'available' })
      .eq('id', bookId);

    if (error) {
      toast({ title: "Error", description: "Failed to approve book", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Book approved" });
      fetchData();
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete book", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Book deleted" });
      fetchData();
    }
  };

  if (loading) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
        <Button onClick={fetchData} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Books
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" /> Transactions
          </TabsTrigger>
        </TabsList>

        {/* --- BOOKS TAB --- */}
        <TabsContent value="books">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Book Management</CardTitle>
              <Input 
                placeholder="Search books..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map((book) => (
                  <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h3 className="font-semibold">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">by {book.author}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          book.status === 'available' ? 'bg-green-100 text-green-800' : 
                          book.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {book.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {book.token_price} Tokens
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {book.status === 'pending' && (
                        <Button size="sm" onClick={() => handleApproveBook(book.id)} className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteBook(book.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {books.length === 0 && <p className="text-center text-muted-foreground py-4">No books found.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- USERS TAB (Cleaned: No Buttons) --- */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {/* User Avatar Icon */}
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Right side is completely empty now */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TRANSACTIONS TAB --- */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {tx.payment_method === 'tokens' 
                          ? `${tx.token_amount} Tokens` 
                          : `KSH ${tx.amount_ksh?.toLocaleString()}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.profiles?.first_name || 'User'} • {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full capitalize">
                      {tx.status}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-center text-muted-foreground py-4">No transactions found.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AdminDashboard;