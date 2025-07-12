import { useState } from "react";

export const HeroSection = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#1a1f3a] animate-gradient-x bg-[length:400%_400%]"></div>
        
        {/* Additional gradient layers for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-[#1a1f3a]/50 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#36b5d3]/5 via-transparent to-[#14788f]/5 animate-pulse"></div>
        
        {/* Geometric background elements with enhanced animations */}
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#36b5d3]/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-[#14788f]/10 blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#36b5d3]/15 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-[#14788f]/15 blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Enhanced floating geometric shapes */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-[#36b5d3]/40 rounded-full animate-ping shadow-lg shadow-[#36b5d3]/20"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-[#14788f]/50 rounded-full animate-ping shadow-lg shadow-[#14788f]/20" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-32 w-2.5 h-2.5 bg-[#36b5d3]/40 rounded-full animate-ping shadow-lg shadow-[#36b5d3]/20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-[#14788f]/45 rounded-full animate-ping shadow-lg shadow-[#14788f]/20" style={{ animationDelay: '3s' }}></div>
        
        {/* Additional floating elements for more dynamic effect */}
        <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-[#36b5d3]/20 rounded-full animate-bounce shadow-lg shadow-[#36b5d3]/10" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/2 right-1/4 w-3 h-3 bg-[#14788f]/30 rounded-full animate-bounce shadow-lg shadow-[#14788f]/10" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-10 right-10 w-6 h-6 bg-[#36b5d3]/30 rounded-full blur-sm animate-pulse shadow-2xl shadow-[#36b5d3]/30"></div>
        <div className="absolute bottom-10 left-10 w-5 h-5 bg-[#14788f]/30 rounded-full blur-sm animate-pulse shadow-2xl shadow-[#14788f]/30" style={{ animationDelay: '2s' }}></div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 slide-up">
          <div className="space-y-8">
            {/* Enhanced badge */}
            <div className="inline-block px-6 py-3 rounded-2xl bg-[#36b5d3]/10 border border-[#36b5d3]/30 mb-6 backdrop-blur-sm hover:bg-[#36b5d3]/15 transition-all duration-300 shadow-lg">
              <span className="text-sm text-[#36b5d3] font-medium tracking-wide">Why PlaceMentor AI?</span>
            </div>
            
            {/* Main heading without blinking cursor */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#dee0e1] leading-tight tracking-tight">
                Smarter Placements
                <span className="block bg-gradient-to-r from-[#36b5d3] via-[#14788f] to-[#36b5d3] bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]">
                  Start Here
                </span>
              </h1>
            </div>
            
            {/* Enhanced description */}
            <p className="text-lg md:text-xl text-[#dee0e1]/80 max-w-2xl mx-auto leading-relaxed font-light">
              Let AI help you crack the placement code—predict your chances, plan your path, and prep like a pro.
            </p>
            
            {/* Enhanced buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button
                onClick={() => setShowLogin(true)}
                className="
                  bg-gradient-to-r from-[#36b5d3] to-[#14788f] 
                  hover:from-[#14788f] hover:to-[#36b5d3] 
                  text-white font-semibold px-8 py-4
                  rounded-2xl shadow-2xl hover:shadow-[#36b5d3]/25 
                  transition-all duration-300 hover:scale-105
                  border-0 text-base
                "
              >
                Check My Placement Chances
              </button>
              
              <button
                onClick={() => setShowLogin(true)}
                className="
                  text-base px-8 py-4
                  border-2 border-[#36b5d3]/30 
                  hover:border-[#36b5d3] hover:bg-[#36b5d3]/10 
                  rounded-2xl font-semibold backdrop-blur-sm
                  text-[#dee0e1] hover:text-[#36b5d3]
                  transition-all duration-300 hover:scale-105
                  hover:shadow-lg bg-transparent
                "
              >
                I'm a Senior – Share My Experience
              </button>
            </div>

            {/* Enhanced status indicator */}
            <div className="flex items-center justify-center gap-3 text-sm text-[#dee0e1]/70 mt-8">
              <div className="w-2 h-2 bg-[#36b5d3] rounded-full animate-pulse"></div>
              <span className="font-medium">Built for students. Powered by data. Backed by AI.</span>
            </div>
          </div>
        </div>

        {/* Additional overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/30 via-transparent to-[#1a1f3a]/20 pointer-events-none"></div>
        
        {/* Subtle animated mesh pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#36b5d3]/10 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#14788f]/10 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>
      
      {/* Simple Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f3a] border border-[#36b5d3]/30 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-[#dee0e1] mb-4">Get Started</h2>
            <p className="text-[#dee0e1]/80 mb-6">
              Ready to transform your career journey? Sign up to get personalized placement insights.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-[#2d3561]/20 border border-[#36b5d3]/30 rounded-xl text-[#dee0e1] placeholder-[#dee0e1]/50 focus:outline-none focus:border-[#36b5d3]"
              />
              <button className="w-full bg-gradient-to-r from-[#36b5d3] to-[#14788f] text-white font-semibold py-3 rounded-xl hover:from-[#14788f] hover:to-[#36b5d3] transition-all duration-300">
                Start Your Journey
              </button>
            </div>
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-[#dee0e1]/60 hover:text-[#dee0e1] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradient-x {
            0%, 100% {
              background-position: 0% 50%;
            }
            25% {
              background-position: 100% 0%;
            }
            50% {
              background-position: 100% 50%;
            }
            75% {
              background-position: 0% 100%;
            }
          }
          
          .animate-gradient-x {
            animation: gradient-x 8s ease infinite;
          }
          
          .slide-up {
            animation: slideUp 1s ease-out;
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `
      }} />
    </>
  );
};