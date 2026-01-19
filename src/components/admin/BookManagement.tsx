import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Search, Trash2, Check, X, Upload, Image as ImageIcon, Coins } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  condition: string;
  description: string;
  price_ksh: number;
  token_price: number;
  availability_status: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    display_name: string;
    first_name: string;
    last_name: string;
  };
}

interface BookPricing {
  tokenPrice: number;
  priceKsh: number;
}

const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingCover, setUploadingCover] = useState<string | null>(null);
  const [bookPricing, setBookPricing] = useState<{ [key: string]: BookPricing }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
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

  const updateBookPricing = (bookId: string, field: keyof BookPricing, value: number) => {
    setBookPricing(prev => ({
      ...prev,
      [bookId]: {
        ...prev[bookId] || { tokenPrice: 0, priceKsh: 0 },
        [field]: value,
      }
    }));
  };

  const approveBook = async (bookId: string) => {
    const pricing = bookPricing[bookId] || { tokenPrice: 0, priceKsh: 0 };
    
    if (pricing.tokenPrice <= 0) {
      toast({
        title: "Token Price Required",
        description: "Please set a token value for this book before approving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-approve-book', {
        body: { 
          bookId,
          tokenPrice: pricing.tokenPrice,
          priceKsh: pricing.priceKsh,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Book Approved",
        description: `Book is now available for ${pricing.tokenPrice} tokens`,
      });

      // Clear pricing for this book
      setBookPricing(prev => {
        const newPricing = { ...prev };
        delete newPricing[bookId];
        return newPricing;
      });

      loadBooks();
    } catch (error) {
      console.error('Error approving book:', error);
      toast({
        title: "Error",
        description: "Failed to approve book",
        variant: "destructive"
      });
    }
  };

  const updateBookStatus = async (bookId: string, status: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-update-book-status', {
        body: { bookId, status },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Book Updated",
        description: `Book status updated to ${status}`,
      });

      loadBooks();
    } catch (error) {
      console.error('Error updating book status:', error);
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-delete-book', {
        body: { bookId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Book Deleted",
        description: "Book has been removed from the system",
      });

      loadBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive"
      });
    }
  };

  const uploadCover = async (bookId: string, file: File) => {
    setUploadingCover(bookId);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `covers/${bookId}-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("book-images")
        .upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type || undefined });

      if (uploadErr) throw new Error(`Image upload failed: ${uploadErr.message}`);

      const { data: publicData } = supabase.storage.from("book-images").getPublicUrl(path);
      const imageUrl = publicData?.publicUrl;

      const { error: updateErr } = await supabase
        .from('books')
        .update({ image_url: imageUrl })
        .eq('id', bookId);

      if (updateErr) throw updateErr;

      toast({
        title: "Cover Updated",
        description: "Book cover has been uploaded successfully",
      });

      loadBooks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to upload cover",
        variant: "destructive"
      });
    } finally {
      setUploadingCover(null);
    }
  };

  const handleFileSelect = (bookId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCover(bookId, file);
    }
  };

  const pendingBooks = books.filter(b => b.availability_status === 'pending');
  const approvedBooks = books.filter(b => b.availability_status !== 'pending');
  
  const filteredApproved = approvedBooks.filter(book =>
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
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Review ({pendingBooks.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved Books ({approvedBooks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Books Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingBooks.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  No books pending review
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingBooks.map((book) => (
                    <Card key={book.id} className="border-2 border-warning/50">
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-[200px_1fr] gap-6">
                          {/* Book Image */}
                          <div className="space-y-2">
                            {book.image_url ? (
                              <img 
                                src={book.image_url} 
                                alt={book.title}
                                className="w-full aspect-[2/3] object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-full aspect-[2/3] bg-muted rounded-lg border flex items-center justify-center">
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => fileInputRefs.current[book.id]?.click()}
                              disabled={uploadingCover === book.id}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingCover === book.id ? "Uploading..." : "Upload Cover"}
                            </Button>
                            <input
                              ref={(el) => (fileInputRefs.current[book.id] = el)}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileSelect(book.id, e)}
                            />
                          </div>

                          {/* Book Details */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold">{book.title}</h3>
                              <p className="text-muted-foreground">by {book.author}</p>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline">{book.genre}</Badge>
                              <Badge variant="outline">Condition: {book.condition}</Badge>
                              <Badge variant="secondary">Pending</Badge>
                            </div>

                            {book.description && (
                              <div>
                                <p className="text-sm font-medium mb-1">Description:</p>
                                <p className="text-sm text-muted-foreground">{book.description}</p>
                              </div>
                            )}

                            <div className="text-sm">
                              <p><span className="font-medium">Owner:</span> {book.profiles?.display_name || `${book.profiles?.first_name} ${book.profiles?.last_name}`}</p>
                              <p><span className="font-medium">Submitted:</span> {new Date(book.created_at).toLocaleDateString()}</p>
                            </div>

                            {/* Pricing Section */}
                            <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Coins className="h-4 w-4" />
                                Set Book Value
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label htmlFor={`token-${book.id}`} className="text-xs">
                                    Token Price *
                                  </Label>
                                  <Input
                                    id={`token-${book.id}`}
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 5"
                                    value={bookPricing[book.id]?.tokenPrice || ''}
                                    onChange={(e) => updateBookPricing(book.id, 'tokenPrice', parseInt(e.target.value) || 0)}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor={`ksh-${book.id}`} className="text-xs">
                                    Price (KSH)
                                  </Label>
                                  <Input
                                    id={`ksh-${book.id}`}
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 500"
                                    value={bookPricing[book.id]?.priceKsh || ''}
                                    onChange={(e) => updateBookPricing(book.id, 'priceKsh', parseInt(e.target.value) || 0)}
                                    className="h-9"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Token price is required. KSH price is optional for cash purchases.
                              </p>
                            </div>

                            {/* Admin Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => approveBook(book.id)}
                                className="flex-1"
                                disabled={!bookPricing[book.id]?.tokenPrice}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve & Publish
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => deleteBook(book.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Approved Books ({approvedBooks.length})
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
                {filteredApproved.map((book) => (
                  <Card key={book.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-2 mb-3">
                        {book.image_url ? (
                          <img 
                            src={book.image_url} 
                            alt={book.title}
                            className="w-full aspect-[2/3] object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => fileInputRefs.current[book.id]?.click()}
                          disabled={uploadingCover === book.id}
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          {uploadingCover === book.id ? "Uploading..." : "Change Cover"}
                        </Button>
                        <input
                          ref={(el) => (fileInputRefs.current[book.id] = el)}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileSelect(book.id, e)}
                        />
                      </div>
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
                          <p>Owner: {book.profiles?.display_name || `${book.profiles?.first_name} ${book.profiles?.last_name}`}</p>
                        </div>
                        <div className="flex gap-1 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookStatus(book.id, book.availability_status === 'available' ? 'rented' : 'available')}
                            className="text-xs flex-1"
                          >
                            {book.availability_status === 'available' ? 'Mark Rented' : 'Mark Available'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteBook(book.id)}
                            className="text-xs"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredApproved.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No books found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookManagement;
