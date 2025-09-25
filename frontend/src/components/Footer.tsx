import React, { useState } from "react";

export const Footer = () => {
  const [hoveredLink, setHoveredLink] = useState(null);

  // Generate floating particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
  }));

  const mainLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/interview", label: "Interview Prep", icon: "💼" },
    { href: "/companies", label: "Company Hub", icon: "🏢" },
    { href: "/insights", label: "Market Insights", icon: "📊" },
    { href: "/resume-analyzer", label: "AI Analyzer", icon: "🔍" },
    { href: "/resume-builder", label: "Resume Builder", icon: "📝" },
    { href: "/about", label: "About", icon: "ℹ️" },
  ];

  
  return (
    <footer className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-cyan-500/30 backdrop-blur-xl overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '3s',
            }}
          />
        ))}
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 via-transparent to-blue-500/3" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>

      <div className="relative container mx-auto px-6 py-12">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          
          {/* Brand Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <span className="text-white font-bold text-xl">P</span>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="text-2xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Place</span>
                <span className="text-white">Mentor AI</span>
              </div>
            </div>
            
            <p className="text-slate-300 text-base max-w-sm leading-relaxed">
              Empowering the next generation of professionals with AI-driven career guidance and placement solutions.
            </p>

            {/* Status indicator */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-slate-400">All systems operational</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 max-w-2xl">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
              Quick Navigation
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
              {mainLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-all duration-300 group py-1"
                  onMouseEnter={() => setHoveredLink(index)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <span className="text-xs opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    {link.icon}
                  </span>
                  <span className="text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                    {link.label}
                  </span>
                  {hoveredLink === index && (
                    <div className="w-1 h-1 bg-cyan-400 rounded-full ml-1 animate-pulse" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

      
      </div>

      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </footer>
  );
};