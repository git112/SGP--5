import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

export const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    
    { name: "Resume Builder", path: "/resume-builder" },
    { name: "Companies", path: "/companies" },
    { name: "Insights", path: "/insights" },
    { name: "Interview", path: "/interview" },
    { name: "About", path: "/about" },
  ];

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: {
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <>
      <motion.header 
        className="relative z-50 w-full border-b border-slate-700/30 bg-slate-900/95 backdrop-blur-xl sticky top-0"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link 
              to="/" 
              className="text-xl font-bold text-cyan-400 tracking-tight hover:text-cyan-300 transition-all duration-300"
            >
              PlaceMentor AI
            </Link>
          </motion.div>

          {/* Navigation */}
          {isLoggedIn && (
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={item.path}>
                    <Button 
                      variant="ghost" 
                      className={`
                        relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg
                        ${location.pathname === item.path 
                          ? 'text-cyan-400 bg-cyan-400/10 shadow-lg' 
                          : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                        }
                        hover:shadow-md
                        before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r 
                        before:from-cyan-400/0 before:to-blue-400/0 before:transition-all before:duration-300
                        hover:before:from-cyan-400/10 hover:before:to-blue-400/10
                      `}
                    >
                      <span className="relative z-10">{item.name}</span>
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </nav>
          )}

          {/* Mobile Menu Button */}
          {isLoggedIn && (
            <div className="lg:hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  className="text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-all duration-300"
                  onClick={() => setShowDropdown((v) => !v)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </motion.div>
            </div>
          )}

          {/* Profile or Login Button */}
          {isLoggedIn ? (
            <div className="relative">
              <motion.button 
                onClick={() => setShowDropdown((v) => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="border-2 border-cyan-400/30 hover:border-cyan-400 transition-all duration-300">
                  <AvatarFallback className="bg-cyan-400/20 text-cyan-400 font-semibold">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.button>
              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/30 rounded-xl shadow-2xl z-50 backdrop-blur-xl"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="px-4 py-3 text-sm text-slate-300 border-b border-slate-700/30">
                      {user?.name || user?.email}
                    </div>
                    <motion.button 
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800/50 hover:text-red-300 transition-all duration-300 rounded-b-xl" 
                      onClick={logout}
                      whileHover={{ backgroundColor: "rgba(30, 41, 59, 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Logout
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setShowLogin(true)}
                className="
                  bg-gradient-to-r from-cyan-500 to-blue-500 
                  hover:from-cyan-400 hover:to-blue-400 
                  text-white font-semibold px-6 py-2 rounded-lg 
                  shadow-lg hover:shadow-xl 
                  transition-all duration-300 
                  border-0
                  text-sm
                "
              >
                Get Started
              </Button>
            </motion.div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isLoggedIn && showDropdown && (
            <motion.div 
              className="lg:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/30 shadow-xl overflow-hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <nav className="container mx-auto px-6 py-4">
                <div className="flex flex-col space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={item.path}>
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
                    </motion.div>
                  ))}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};