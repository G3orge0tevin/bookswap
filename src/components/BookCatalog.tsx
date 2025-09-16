import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, Filter } from "lucide-react";
import BookCard from "./BookCard";

const BookCatalog = () => {
  // Sample book data
  const books = [
    {
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      condition: "excellent" as const,
      tokenValue: 45,
      price: 12.99,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
      rating: 4.8,
      genre: "Fiction"
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      condition: "good" as const,
      tokenValue: 38,
      price: 15.99,
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
      rating: 4.6,
      genre: "Self-Help"
    },
    {
      title: "The Silent Patient",
      author: "Alex Michaelides",
      condition: "good" as const,
      tokenValue: 32,
      price: 10.99,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
      rating: 4.3,
      genre: "Thriller"
    },
    {
      title: "Educated",
      author: "Tara Westover",
      condition: "fair" as const,
      tokenValue: 28,
      price: 9.99,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
      rating: 4.7,
      genre: "Memoir"
    },
    {
      title: "The Midnight Library",
      author: "Matt Haig",
      condition: "excellent" as const,
      tokenValue: 40,
      price: 13.99,
      image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=600&fit=crop",
      rating: 4.2,
      genre: "Fiction"
    },
    {
      title: "Becoming",
      author: "Michelle Obama",
      condition: "good" as const,
      tokenValue: 35,
      price: 11.99,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
      rating: 4.9,
      genre: "Biography"
    }
  ];

  return (
    <section id="browse" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Discover Your Next Read
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse thousands of books from our community. Use tokens or purchase directly.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title, author, or genre..." 
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="fiction">Fiction</SelectItem>
              <SelectItem value="non-fiction">Non-Fiction</SelectItem>
              <SelectItem value="mystery">Mystery</SelectItem>
              <SelectItem value="romance">Romance</SelectItem>
              <SelectItem value="biography">Biography</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Book Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book, index) => (
            <BookCard key={index} {...book} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Load More Books
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BookCatalog;