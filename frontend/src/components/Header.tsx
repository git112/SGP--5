import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, user, logout } = useAuth();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
        hover: { y: -2, transition: { duration: 0.2, ease: "easeInOut" } }
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
        exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
        visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
        exit: { opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
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
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* FONT SIZE INCREASED: text-xl -> text-2xl */}
                        <Link to="/" className="text-2xl font-bold tracking-tight transition-all duration-300 group">
                            <span className="text-cyan-400 transition-colors duration-300 group-hover:text-cyan-300">Place</span>
                            <span className="text-white transition-colors duration-300 group-hover:text-slate-200">Mentor AI</span>
                        </Link>
                    </motion.div>
                    
                    {/* Right side of header */}
                    {isLoggedIn ? (
                        <>
                            {/* Desktop Navigation */}
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
                                                // FONT SIZE INCREASED: text-sm -> text-base
                                                className={`relative px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg ${
                                                    location.pathname === item.path
                                                        ? 'text-cyan-400 bg-cyan-400/10 shadow-lg'
                                                        : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                                                }`}
                                            >
                                                <span className="relative z-10">{item.name}</span>
                                            </Button>
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            {/* Mobile Menu Button */}
                            <div className="lg:hidden">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="ghost"
                                        className="text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-all duration-300"
                                        onClick={() => setIsMobileMenuOpen((v) => !v)}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Profile Avatar & Dropdown */}
                            <div className="relative hidden lg:block">
                                <motion.button
                                    onClick={() => setShowProfileDropdown((v) => !v)}
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
                                    {showProfileDropdown && (
                                        <motion.div
                                            className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/30 rounded-xl shadow-2xl z-50 backdrop-blur-xl"
                                            variants={dropdownVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            {/* FONT SIZE INCREASED: text-sm -> text-base */}
                                            <div className="px-4 py-3 text-base text-slate-300 border-b border-slate-700/30">
                                                {user?.name || user?.email}
                                            </div>
                                            <motion.button
                                                // FONT SIZE INCREASED: text-sm -> text-base
                                                className="w-full text-left px-4 py-3 text-base text-red-400 hover:bg-slate-800/50 hover:text-red-300 transition-all duration-300 rounded-b-xl"
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
                        </>
                    ) : (
                        // "Get Started" Button for logged-out users
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Button
                                onClick={() => navigate('/login')}
                                // FONT SIZE INCREASED: Added text-base
                                className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 text-base"
                            >
                                Get Started
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Mobile Navigation Menu */}
                <AnimatePresence>
                    {isLoggedIn && isMobileMenuOpen && (
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
                                            <Link to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                                                <Button
                                                    variant="ghost"
                                                    // FONT SIZE INCREASED: text-sm -> text-base
                                                    className={`w-full justify-start px-4 py-3 text-base font-medium transition-all duration-300 rounded-lg ${
                                                        location.pathname === item.path
                                                            ? 'text-cyan-400 bg-cyan-400/10'
                                                            : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                                                    }`}
                                                >
                                                    {item.name}
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    ))}
                                    {/* Logout button for mobile */}
                                    <div className="border-t border-slate-700/30 pt-3 mt-3">
                                        <button
                                            className="w-full text-left px-4 py-3 text-base text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                                            onClick={() => {
                                                logout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </>
    );
};