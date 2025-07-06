import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";

export const FloatingBot = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowLogin(true)}
          className="w-14 h-14 rounded-full bg-primary shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-primary/25"
        >
          <svg 
            className="w-6 h-6 text-primary-foreground" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
        </Button>
      </div>
      
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}; 