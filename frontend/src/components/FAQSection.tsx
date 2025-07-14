import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How accurate are the job predictions?",
    answer: "Our AI models are trained on extensive market data and have an accuracy rate of over 85%. The predictions consider your skills, experience, market trends, and company requirements to provide highly relevant job matches."
  },
  {
    question: "Can I get information about specific companies?",
    answer: "Yes! Our database includes detailed information about thousands of companies including culture, interview processes, salary ranges, growth opportunities, and current job openings."
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely. We use enterprise-grade encryption and follow strict data privacy protocols. Your personal information is never shared with third parties without your explicit consent."
  },
  {
    question: "How does the AI generate insights?",
    answer: "Our AI analyzes real-time market data, industry trends, company hiring patterns, and your profile to generate personalized insights and recommendations for your career growth."
  }
];

export const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
        delayChildren: 0.2,
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
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
      {/* Matching homepage background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900/80 to-purple-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_70%)]"></div>
      
      {/* Enhanced animated particles effect */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400 rounded-full"
          animate={{ 
            scale: [1, 1.8, 1],
            opacity: [0.2, 0.9, 0.2]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-purple-400 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.7, 0.2]
          }}
          transition={{ 
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12 lg:mb-16"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed">
            Get answers to common questions about placement preparation and our AI assistant
          </p>
        </motion.div>
        
        <motion.div 
          className="max-w-4xl mx-auto space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              custom={index}
            >
              <Collapsible
                open={openItems.includes(index)}
                onOpenChange={() => toggleItem(index)}
              >
                <CollapsibleTrigger className="w-full group">
                  <motion.div 
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 text-left hover:bg-white/10 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-400/10 transition-all duration-500"
                    whileHover={{ 
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-semibold text-white pr-4 group-hover:text-cyan-300 transition-colors duration-300">
                        {faq.question}
                      </h3>
                      <motion.div 
                        className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:from-cyan-400/30 group-hover:to-blue-500/30 group-hover:border-cyan-400/50 ${openItems.includes(index) ? 'rotate-45 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-cyan-400/50' : ''}`}
                        animate={{ 
                          rotate: openItems.includes(index) ? 45 : 0,
                          scale: openItems.includes(index) ? 1.1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg 
                          className={`w-5 h-5 transition-all duration-300 ${openItems.includes(index) ? 'text-cyan-300' : 'text-slate-300 group-hover:text-cyan-300'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>
                </CollapsibleTrigger>
                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <CollapsibleContent className="overflow-hidden">
                        <motion.div 
                          className="mt-3 mx-2 mb-2 px-6 sm:px-8 py-6 bg-gradient-to-r from-white/5 to-cyan-400/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-inner"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <p className="text-slate-200 leading-relaxed font-light text-base sm:text-lg">
                            {faq.answer}
                          </p>
                        </motion.div>
                      </CollapsibleContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Collapsible>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};