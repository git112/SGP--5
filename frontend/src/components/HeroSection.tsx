import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const HeroSection = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const handleButtonClick = (destination: string) => {
    if (isLoggedIn) {
      navigate(destination);
      return;
    }
    navigate("/login");
  };

  const stars = Array.from({ length: 150 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 5,
  }));
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#1a1f3a] animate-gradient-x bg-[length:400%_400%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        ></motion.div>
        
        {/* Additional gradient layers for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-[#1a1f3a]/50 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#36b5d3]/5 via-transparent to-[#14788f]/5 animate-pulse"></div>
        
        {/* Geometric background elements with enhanced animations */}
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        
        {/* Floating orbs with Framer Motion */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#36b5d3]/10 blur-3xl"
          variants={floatingVariants}
          animate="animate"
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-[#14788f]/10 blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#36b5d3]/15 blur-xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-[#14788f]/15 blur-lg"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 3 }}
        ></motion.div>
        
        {/* Enhanced floating geometric shapes */}
        <motion.div 
          className="absolute top-20 left-20 w-3 h-3 bg-[#36b5d3]/40 rounded-full shadow-lg shadow-[#36b5d3]/20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-40 right-32 w-2 h-2 bg-[#14788f]/50 rounded-full shadow-lg shadow-[#14788f]/20"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-40 left-32 w-2.5 h-2.5 bg-[#36b5d3]/40 rounded-full shadow-lg shadow-[#36b5d3]/20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-20 right-20 w-2 h-2 bg-[#14788f]/45 rounded-full shadow-lg shadow-[#14788f]/20"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.45, 0.9, 0.45]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        ></motion.div>
        
        {/* Additional floating elements for more dynamic effect */}
        <motion.div 
          className="absolute top-1/3 left-1/2 w-4 h-4 bg-[#36b5d3]/20 rounded-full shadow-lg shadow-[#36b5d3]/10"
          animate={{ 
            y: [-5, 5, -5],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/2 right-1/4 w-3 h-3 bg-[#14788f]/30 rounded-full shadow-lg shadow-[#14788f]/10"
          animate={{ 
            y: [-3, 3, -3],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        ></motion.div>
        
        {/* Glowing orbs */}
        <motion.div 
          className="absolute top-10 right-10 w-6 h-6 bg-[#36b5d3]/30 rounded-full blur-sm shadow-2xl shadow-[#36b5d3]/30"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-10 left-10 w-5 h-5 bg-[#14788f]/30 rounded-full blur-sm shadow-2xl shadow-[#14788f]/30"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        
        {/* Content */}
        <motion.div 
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-8">
            {/* Enhanced badge */}
            <motion.div 
              className="inline-block px-6 py-3 rounded-2xl bg-[#36b5d3]/10 border border-[#36b5d3]/30 mb-6 backdrop-blur-sm hover:bg-[#36b5d3]/15 transition-all duration-300 shadow-lg"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(54, 181, 211, 0.15)"
              }}
            >
              <span className="text-sm text-[#36b5d3] font-medium tracking-wide">Why PlaceMentor AI?</span>
            </motion.div>
            
            {/* Main heading */}
            <motion.div 
              className="space-y-4"
              variants={itemVariants}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#dee0e1] leading-tight tracking-tight">
                Smarter Placements
                <motion.span 
                  className="block bg-gradient-to-r from-[#36b5d3] via-[#14788f] to-[#36b5d3] bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Start Here
                </motion.span>
              </h1>
            </motion.div>
            
            {/* Enhanced description */}
            <motion.p 
              className="text-lg md:text-xl text-[#dee0e1]/80 max-w-2xl mx-auto leading-relaxed font-light"
              variants={itemVariants}
            >
              Let AI help you crack the placement code—predict your chances, plan your path, and prep like a pro.
            </motion.p>
            
            {/* Enhanced buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              variants={itemVariants}
            >
              <motion.button
                onClick={() => handleButtonClick("/insights")}
                className="
                  bg-gradient-to-r from-[#36b5d3] to-[#14788f] 
                  hover:from-[#14788f] hover:to-[#36b5d3] 
                  text-white font-semibold px-8 py-4
                  rounded-2xl shadow-2xl hover:shadow-[#36b5d3]/25 
                  transition-all duration-300
                  border-0 text-base
                "
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Check My Placement Chances
              </motion.button>
              
              <motion.button
                onClick={() => handleButtonClick("/interview")}
                className="
                  text-base px-8 py-4
                  border-2 border-[#36b5d3]/30 
                  hover:border-[#36b5d3] hover:bg-[#36b5d3]/10 
                  rounded-2xl font-semibold backdrop-blur-sm
                  text-[#dee0e1] hover:text-[#36b5d3]
                  transition-all duration-300
                  hover:shadow-lg bg-transparent
                "
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                I'm a Senior – Share My Experience
              </motion.button>
            </motion.div>

            {/* Enhanced status indicator */}
            <motion.div 
              className="flex items-center justify-center gap-3 text-sm text-[#dee0e1]/70 mt-8"
              variants={itemVariants}
            >
              <motion.div 
                className="w-2 h-2 bg-[#36b5d3] rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              ></motion.div>
              <span className="font-medium">Built for students. Powered by data. Backed by AI.</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Additional overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/30 via-transparent to-[#1a1f3a]/20 pointer-events-none"></div>
        
        {/* Subtle animated mesh pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#36b5d3]/10 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#14788f]/10 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>
      
      {/* Login modal removed; buttons route to /login if not authenticated */}

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
        `
      }} />
    </>
  );
};