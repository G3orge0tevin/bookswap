import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Coins, BookOpen } from "lucide-react";

const UploadSection = () => {
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
                    <Input id="title" placeholder="Enter book title" />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input id="author" placeholder="Author name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Select>
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
                    <Select>
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
                  />
                </div>

                <Button className="w-full" size="lg">
                  <Upload className="h-5 w-5 mr-2" />
                  List Book for Trade
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
                    <Button variant="outline">
                      Choose Files
                    </Button>
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