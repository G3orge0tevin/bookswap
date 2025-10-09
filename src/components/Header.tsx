import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Coins, User, LogOut, ShoppingCart, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate, Link, useLocation } from "react-router-dom";



const Header = () => {
  const { user, signOut } = useAuth();
  const { items, userTokens } = useCart();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">BookSwap</span>
        </Link>
        

        {!location.pathname.includes('/admin') && (
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => {
                const element = document.getElementById('browse');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-foreground hover:text-primary transition-colors"
            >
              Browse Books
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('how-it-works');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-foreground hover:text-primary transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('list');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-foreground hover:text-primary transition-colors"
            >
              List a Book
            </button>
          </nav>
        )}
        {/* Navigation buttons removed from header - not functional yet */}

        <div className="flex items-center gap-4">
          {user && (
            <Badge 
              variant="secondary" 
              className="bg-gradient-token text-token-foreground cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/tokens')}
            >
              <Coins className="h-4 w-4 mr-1" />
              {userTokens} Tokens
            </Badge>
          )}
          
          {user ? (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/cart')}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Button>
              
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="secondary" size="sm"
                   className="gap-2 hover:bg-accent hover:text-accent-foreground">
                    <Shield className="h-4 w-4 mr-2" /> 
                    Admin
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Welcome {user?.user_metadata?.first_name || 'back'}!</span>
              </div>
              <Button variant="outline" onClick={handleAuthAction}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;