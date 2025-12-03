import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const isLoggedIn = false;
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
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
    hover: { scale: 1.05, transition: { duration: 0.2, ease: "easeInOut" } },
    tap: { scale: 0.95 },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const handleButtonClick = (destination: string) => {
    if (isLoggedIn) {
      navigate(destination);
    } else {
      navigate(destination);
    }
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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans bg-[#0f1419]">
        {/* Interactive Spotlight Effect */}
        <div
          className="pointer-events-none fixed inset-0 z-30 transition duration-300"
          style={{
            background: `radial-gradient(400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(54, 181, 211, 0.1), transparent 80%)`
          }}
        ></div>

        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#1a1f3a] animate-gradient-x bg-[length:400%_400%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        ></motion.div>

        {/* Starfield */}
        <div className="absolute inset-0">
          {stars.map(star => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white/80"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
              }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
            />
          ))}
        </div>

        {/* Decorative Elements & Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-[#1a1f3a]/50 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#36b5d3]/5 via-transparent to-[#14788f]/5 animate-pulse"></div>
        <div className="absolute inset-0 grid-pattern opacity-10"></div>

        {/* Parallax Container */}
        <motion.div
          className="absolute inset-0"
          animate={{
            x: (mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) / -50,
            y: (mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) / -50
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* Floating Orbs */}
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

          {/* Pulsing Geometric Shapes */}
          <motion.div
            className="absolute top-20 left-20 w-3 h-3 bg-[#36b5d3]/40 rounded-full shadow-lg shadow-[#36b5d3]/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
          <motion.div
            className="absolute top-40 right-32 w-2 h-2 bg-[#14788f]/50 rounded-full shadow-lg shadow-[#14788f]/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          ></motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              className="inline-block px-6 py-2 rounded-full bg-[#36b5d3]/10 border border-[#36b5d3]/30 backdrop-blur-sm"
              variants={itemVariants}
            >
              <span className="text-xs sm:text-sm text-[#36b5d3] font-semibold tracking-wide">
                PlaceMentor AI – Placement Clarity, Delivered
              </span>
            </motion.div>

            {/* Main Quote */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-[#dee0e1] leading-tight tracking-tight">
                <motion.span
                  className="block bg-gradient-to-r from-[#36b5d3] via-[#14788f] to-[#36b5d3] bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]"
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  Smarter Placement,
                </motion.span>
                <motion.span
                  className="block text-[#dee0e1] mt-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Start Here
                </motion.span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-[#dee0e1]/70 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              "Leverage AI to Decode Placement Trends—Personalize Your Career Approach with Data-Backed Insights and Expert Resources."
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center pt-6"
              variants={itemVariants}
            >
              <motion.button
                onClick={() => handleButtonClick("/insights")}
                className="w-full sm:w-auto bg-gradient-to-r from-[#36b5d3] to-[#14788f] hover:from-[#14788f] hover:to-[#36b5d3] text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center space-x-2 min-h-[48px]"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Check My Placement Chances</span>
              </motion.button>

              <motion.button
                onClick={() => handleButtonClick("/interview")}
                className="w-full sm:w-auto bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-[#dee0e1] font-bold px-6 sm:px-8 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2 min-h-[48px]"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Test Your Confidence</span>
              </motion.button>
            </motion.div>

            {/* Status Indicator */}
            <motion.div
              className="flex items-center justify-center gap-2 text-sm text-[#dee0e1]/60 pt-8"
              variants={itemVariants}
            >
              <motion.div
                className="w-2 h-2 bg-[#36b5d3] rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <span className="font-medium">Built for students. Powered by data. Backed by AI.</span>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/30 via-transparent to-[#1a1f3a]/20 pointer-events-none"></div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .font-sans { font-family: 'Inter', sans-serif; }
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-x { animation: gradient-x 8s ease infinite; }
          .grid-pattern {
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
            background-size: 3rem 3rem;
          }
        `,
        }}
      />
    </>
  );
};