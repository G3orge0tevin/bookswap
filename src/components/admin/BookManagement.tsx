import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Search, Eye, Trash2, Edit } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  condition: string;
  price_ksh: number;
  token_price: number;
  availability_status: string;
  created_at: string;
  profiles: {
    display_name: string;
    first_name: string;
    last_name: string;
  };
}

const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const { data: books, error } = await supabase
        .from('books')
        .select(`
          *,
          profiles (
            display_name,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && books) {
        setBooks(books);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookStatus = async (bookId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ availability_status: status })
        .eq('id', bookId);

      if (error) throw error;

      toast({
        title: "Book Updated",
        description: `Book status updated to ${status}`,
      });

      loadBooks(); // Reload books
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update book status",
        variant: "destructive"
      });
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;

      toast({
        title: "Book Deleted",
        description: "Book has been removed from the system",
      });

      loadBooks(); // Reload books
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive"
      });
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Book Management ({books.length} books)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">{book.title}</h4>
                    <p className="text-xs text-muted-foreground">by {book.author}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{book.genre}</Badge>
                      <Badge variant={book.availability_status === 'available' ? 'default' : 'secondary'} className="text-xs">
                        {book.availability_status}
                      </Badge>
                    </div>
                    <div className="text-xs">
                      <p>Condition: {book.condition}</p>
                      <p>Price: KSH {book.price_ksh} | {book.token_price} tokens</p>
                      <p>Owner: {book.profiles?.display_name || `${book.profiles?.first_name} ${book.profiles?.last_name}`}</p>
                    </div>
                    <div className="flex gap-1 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookStatus(book.id, book.availability_status === 'available' ? 'rented' : 'available')}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {book.availability_status === 'available' ? 'Rent' : 'Available'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBook(book.id)}
                        className="text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No books found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookManagement;