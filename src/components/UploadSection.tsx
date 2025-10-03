import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Coins, BookOpen } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const bookSchema = z.object({
  title: z.string().trim().min(1, { message: "Title is required" }),
  author: z.string().trim().min(1, { message: "Author is required" }),
  genre: z.string().min(1, { message: "Genre is required" }),
  condition: z.string().min(1, { message: "Condition is required" }),
  description: z.string().trim().max(500).optional(),
});

const UploadSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [description, setDescription] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChooseFiles = () => fileInputRef.current?.click();
  const handleFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setCondition("");
    setDescription("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const listBook = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to list a book.", variant: "destructive" });
      return;
    }

    const parsed = bookSchema.safeParse({ title, author, genre, condition, description });
    if (!parsed.success) {
      const firstErr = parsed.error.errors[0]?.message ?? "Please fill all required fields.";
      toast({ title: "Invalid details", description: firstErr, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Upload first image if provided
      let imageUrl: string | null = null;
      if (files.length > 0) {
        const file = files[0];
        const ext = file.name.split(".").pop() || "jpg";
        const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
        const path = `${user.id}/${Date.now()}-${safeTitle}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("book-images")
          .upload(path, file, { upsert: false, cacheControl: "3600", contentType: file.type || undefined });
        if (uploadErr) {
          throw new Error(`Image upload failed: ${uploadErr.message}`);
        }
        const { data: publicData } = supabase.storage.from("book-images").getPublicUrl(path);
        imageUrl = publicData?.publicUrl ?? null;
      }

      const { error: insertErr } = await supabase
        .from("books")
        .insert({
          user_id: user.id,
          title,
          author,
          genre,
          condition,
          description: description || null,
          image_url: imageUrl,
        });

      if (insertErr) throw new Error(insertErr.message);

      toast({ title: "Book listed!", description: "Your book is now available for trade." });
      resetForm();
    } catch (e: any) {
      toast({ title: "Could not list book", description: e?.message ?? "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="list" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            List Your Books
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Turn your finished books into tokens. Quick, easy, and rewarding.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Book Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Book Title</Label>
                    <Input id="title" placeholder="Enter book title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input id="author" placeholder="Author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fiction">Fiction</SelectItem>
                        <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                        <SelectItem value="mystery">Mystery</SelectItem>
                        <SelectItem value="romance">Romance</SelectItem>
                        <SelectItem value="biography">Biography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Book condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Any additional details about the book's condition..."
                    className="h-20"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button className="w-full" size="lg" onClick={listBook} disabled={submitting}>
                  <Upload className="h-5 w-5 mr-2" />
                  {submitting ? "Listing..." : "List Book for Trade"}
                </Button>
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Camera className="h-6 w-6 text-primary" />
                  Book Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Upload Book Photos</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Take clear photos of the cover, spine, and any wear
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button variant="outline" onClick={handleChooseFiles} disabled={submitting}>
                        Choose Files
                      </Button>
                      {files.length > 0 && (
                        <span className="text-sm text-muted-foreground">{files.length} selected</span>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple={false}
                      className="hidden"
                      onChange={handleFilesSelected}
                      aria-label="Choose book photos"
                    />
                  </div>

                  {/* Estimated Value */}
                  <div className="bg-gradient-token rounded-lg p-6 text-center">
                    <Coins className="h-8 w-8 text-token-foreground mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-token-foreground mb-2">
                      Estimated Token Value
                    </h3>
                    <div className="text-3xl font-bold text-token-foreground mb-2">
                      35-45 Tokens
                    </div>
                    <p className="text-sm text-token-foreground/80">
                      Based on condition, popularity, and rarity
                    </p>
                  </div>

                  {/* Tips */}
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <h4 className="font-medium text-foreground">Photography Tips:</h4>
                    <ul className="space-y-1">
                      <li>• Use good lighting</li>
                      <li>• Include front cover, back cover, and spine</li>
                      <li>• Show any damage or wear clearly</li>
                      <li>• Keep images in focus</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
