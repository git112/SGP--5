import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="relative z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="text-lg font-bold text-primary tracking-tight hover:text-primary/80 transition-colors">
              PlaceMentor AI
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/">
              <Button variant="ghost" className={`text-sm transition-colors font-medium ${location.pathname === '/' ? 'text-primary' : 'text-foreground hover:text-primary'}`}>
                Predict
              </Button>
            </Link>
            <Button variant="ghost" className="text-sm text-foreground hover:text-primary transition-colors font-medium">
              Companies
            </Button>
            <Link to="/insights">
              <Button variant="ghost" className={`text-sm transition-colors font-medium ${location.pathname === '/insights' ? 'text-primary' : 'text-foreground hover:text-primary'}`}>
                Insights
              </Button>
            </Link>
            <Button variant="ghost" className="text-sm text-foreground hover:text-primary transition-colors font-medium">
              Seniors
            </Button>
          </nav>

          {/* Login Button */}
          <Button 
            onClick={() => setShowLogin(true)}
            className="btn-primary text-sm px-4 py-2 font-semibold"
          >
            Get Started
          </Button>
        </div>
      </header>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};