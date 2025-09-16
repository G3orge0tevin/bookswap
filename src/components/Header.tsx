import { useState } from "react"
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { BookOpen, Coins } from "lucide-react";
import { AuthDialog} from "../components/AuthDialog";


export function Header() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">BookSwap</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#browse" className="text-foreground hover:text-primary transition-colors">Browse Books</a>
          <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">How it Works</a>
          <a href="#list" className="text-foreground hover:text-primary transition-colors">List a Book</a>
        </nav>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-gradient-token text-token-foreground">
            <Coins className="h-4 w-4 mr-1" />
            125 Tokens
          </Badge>
          <Button onClick={() => setAuthDialogOpen(true)}>
            Sign In
          </Button>
          <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
          <Button onClick={() => document.getElementById("list")?.scrollIntoView({ behavior: "smooth" })}>
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;