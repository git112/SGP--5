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

  const socialIconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
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
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                className="w-12 h-12 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700/50 hover:border-cyan-500/50 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-all duration-300"
                variants={socialIconVariants}
                whileHover="hover"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </motion.a>
              <motion.a 
                href="#" 
                className="w-12 h-12 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700/50 hover:border-cyan-500/50 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-all duration-300"
                variants={socialIconVariants}
                whileHover="hover"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </motion.a>
              <motion.a 
                href="#" 
                className="w-12 h-12 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700/50 hover:border-cyan-500/50 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-all duration-300"
                variants={socialIconVariants}
                whileHover="hover"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.391-2.108 4.543-1.314 1.247-2.98 1.93-4.95 1.93-1.97 0-3.636-.683-4.95-1.93C4.448 11.551 3.721 10.018 3.552 8.16c1.188.22 2.43.22 3.618 0-.169 1.858.558 3.391 1.87 4.543 1.314 1.247 2.98 1.93 4.95 1.93s3.636-.683 4.95-1.93c1.312-1.152 2.039-2.685 1.87-4.543 1.188.22 2.43.22 3.618 0z"/>
                </svg>
              </motion.a>
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div variants={itemVariants}>
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
          
          {/* Support */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-white mb-6">Support</h3>
            <ul className="space-y-3">
              {[
                "Help Center",
                "Contact Us", 
                "Privacy Policy",
                "Terms of Service"
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