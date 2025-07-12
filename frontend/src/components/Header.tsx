import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const { isLoggedIn, userEmail, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Predict", path: "/predict" },
    { name: "Companies", path: "/companies" },
    { name: "Insights", path: "/insights" },
    { name: "Interview", path: "/interview" }
  ];

  return (
    <>
      <header className="relative z-50 w-full border-b border-slate-700/30 bg-slate-900/95 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link 
              to="/" 
              className="text-xl font-bold text-cyan-400 tracking-tight hover:text-cyan-300 transition-all duration-300 hover:scale-105"
            >
              PlaceMentor AI
            </Link>
          </div>

          {/* Navigation */}
          {isLoggedIn && (
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path}>
                  <Button 
                    variant="ghost" 
                    className={`
                      relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg
                      ${location.pathname === item.path 
                        ? 'text-cyan-400 bg-cyan-400/10 shadow-lg' 
                        : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                      }
                      hover:scale-105 hover:shadow-md
                      before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r 
                      before:from-cyan-400/0 before:to-blue-400/0 before:transition-all before:duration-300
                      hover:before:from-cyan-400/10 hover:before:to-blue-400/10
                    `}
                  >
                    <span className="relative z-10">{item.name}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          )}

          {/* Mobile Menu Button */}
          {isLoggedIn && (
            <div className="lg:hidden">
              <Button 
                variant="ghost" 
                className="text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-all duration-300"
                onClick={() => setShowDropdown((v) => !v)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          )}

          {/* Profile or Login Button */}
          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown((v) => !v)}
                className="transition-all duration-300 hover:scale-105"
              >
                <Avatar className="border-2 border-cyan-400/30 hover:border-cyan-400 transition-all duration-300">
                  <AvatarFallback className="bg-cyan-400/20 text-cyan-400 font-semibold">
                    {userEmail?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/30 rounded-xl shadow-2xl z-50 backdrop-blur-xl">
                  <div className="px-4 py-3 text-sm text-slate-300 border-b border-slate-700/30">
                    {userEmail}
                  </div>
                  <button 
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800/50 hover:text-red-300 transition-all duration-300 rounded-b-xl" 
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button 
              onClick={() => setShowLogin(true)}
              className="
                bg-gradient-to-r from-cyan-500 to-blue-500 
                hover:from-cyan-400 hover:to-blue-400 
                text-white font-semibold px-6 py-2 rounded-lg 
                shadow-lg hover:shadow-xl 
                transition-all duration-300 
                hover:scale-105 
                border-0
                text-sm
              "
            >
              Get Started
            </Button>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isLoggedIn && showDropdown && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/30 shadow-xl">
            <nav className="container mx-auto px-6 py-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link key={item.name} to={item.path}>
                    <Button 
                      variant="ghost" 
                      className={`
                        w-full justify-start px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg
                        ${location.pathname === item.path 
                          ? 'text-cyan-400 bg-cyan-400/10' 
                          : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                        }
                      `}
                    >
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </header>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};