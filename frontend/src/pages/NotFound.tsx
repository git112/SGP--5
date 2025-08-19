import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground fade-in">
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <div className="card text-center slide-up">
          <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
          <p className="text-xl muted mb-6">Oops! Page not found</p>
          <a 
            href="/" 
            className="btn-primary inline-block"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
