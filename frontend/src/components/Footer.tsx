import { motion } from "framer-motion";

export const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    hover: {
      x: 5,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.footer 
      className="relative bg-slate-900/95 border-t border-slate-800/50 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="container mx-auto px-6 py-16">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Logo and Description */}
          <motion.div 
            className="col-span-1 md:col-span-2"
            variants={itemVariants}
          >
            <motion.div 
              className="text-2xl font-bold text-white mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-cyan-400">Place</span>Mentor AI
            </motion.div>
            <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-md">
              Your AI-powered placement assistant helping students and professionals 
              navigate their career journey with intelligent insights and personalized guidance.
            </p>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div 
            variants={itemVariants} 
            className="md:col-start-4"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                "Predict Jobs",
                "Company Database", 
                "Market Insights",
                "Coding Practice"
              ].map((link, index) => (
                <motion.li 
                  key={link}
                  variants={linkVariants}
                  custom={index}
                >
                  <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors duration-200 flex items-center group">
                    <motion.span 
                      className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.2 }}
                    ></motion.span>
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          
        </motion.div>
        
        {/* Bottom Section */}
        <motion.div 
          className="border-t border-slate-800/50 mt-16 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p 
              className="text-slate-400 text-sm"
              whileHover={{ color: "#06b6d4" }}
              transition={{ duration: 0.2 }}
            >
              © 2024 PlaceMentor AI. All rights reserved.
            </motion.p>
            <motion.p 
              className="text-slate-400 text-sm"
              whileHover={{ color: "#06b6d4" }}
              transition={{ duration: 0.2 }}
            >
              Empowering careers through AI
            </motion.p>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
    </motion.footer>
  );
};