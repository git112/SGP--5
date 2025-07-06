import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";

export const HeroSection = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background geometric-bg">
        {/* Geometric background elements */}
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-secondary/5 blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-success/5 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-warning/5 blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary/30 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-secondary/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-32 w-1.5 h-1.5 bg-success/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-warning/35 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 slide-up">
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm">
              <span className="text-sm text-primary font-medium tracking-wide">Why PlaceMentor AI?</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
              Smarter Placements
              <span className="block text-gradient">
                Start Here
              </span>
            </h1>
            
            <p className="text-lg md:text-xl muted max-w-2xl mx-auto leading-relaxed font-light">
              Let AI help you crack the placement code—predict your chances, plan your path, and prep like a pro.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg"
                onClick={() => setShowLogin(true)}
                className="btn-primary text-base px-8 py-3 h-auto font-semibold"
              >
                Check My Placement Chances
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="text-base px-8 py-3 h-auto border-border hover:bg-card rounded-2xl font-semibold backdrop-blur-sm"
              >
                I'm a Senior – Share My Experience
              </Button>
            </div>

            <div className="flex items-center justify-center gap-3 text-sm muted mt-8">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="font-medium">Built for students. Powered by data. Backed by AI.</span>
            </div>
          </div>
        </div>
      </section>
      
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};