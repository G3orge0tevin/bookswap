import React from "react";
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

  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">BookSwap</span>
        </Link>

        {/* Mobile: compact icons + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <>
              <Badge 
                variant="secondary" 
                className="bg-gradient-token text-token-foreground cursor-pointer hover:opacity-80 transition-opacity text-xs px-2 py-0.5"
                onClick={() => navigate('/tokens')}
              >
                <Coins className="h-3 w-3 mr-1" />
                {userTokens}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative h-8 w-8">
                <ShoppingCart className="h-4 w-4" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    {items.length}
                  </span>
                )}
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </Button>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/cart')} className="relative">
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
                  <Button variant="secondary" size="sm">
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
              <Button variant="outline" onClick={() => navigate('/auth')}>Sign In</Button>
              <Button onClick={() => navigate('/auth')}>Get Started</Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-card px-4 py-3 flex flex-col gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 py-1">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Welcome {user?.user_metadata?.first_name || 'back'}!</span>
              </div>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { handleAuthAction(); setMenuOpen(false); }}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="w-full" onClick={() => { navigate('/auth'); setMenuOpen(false); }}>Sign In</Button>
              <Button size="sm" className="w-full" onClick={() => { navigate('/auth'); setMenuOpen(false); }}>Get Started</Button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;