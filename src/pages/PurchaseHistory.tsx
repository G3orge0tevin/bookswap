import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, Calendar, BookOpen } from "lucide-react";
import { format } from "date-fns";

const PurchaseHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          books (
            title,
            author,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Receipt className="h-6 w-6" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(tx.created_at), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tx.books?.title || "Unknown Item"}
                      {tx.books?.author && (
                        <span className="text-xs text-muted-foreground block">
                          by {tx.books.author}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {tx.transaction_type}
                    </TableCell>
                    <TableCell>
                      {tx.payment_method === "tokens" ? (
                        <span className="text-token font-bold">
                          {tx.token_amount} Tokens
                        </span>
                      ) : (
                        <span className="font-bold">
                          KSH {tx.amount_ksh?.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.status === "completed" ? "default" : "secondary"
                        }
                        className={
                          tx.status === "completed" ? "bg-green-600" : ""
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseHistory;