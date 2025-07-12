import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
      {/* Matching homepage background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900/80 to-purple-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_70%)]"></div>
      {/* Subtle animated particles effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed">
            Get answers to common questions about placement preparation and our AI assistant
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="opacity-0 animate-bounce-in"
              style={{ 
                animationDelay: `${index * 150}ms`, 
                animationFillMode: 'forwards',
                animation: `slideUp 0.6s ease-out ${index * 0.15}s forwards`
              }}
            >
              <Collapsible
                open={openItems.includes(index)}
                onOpenChange={() => toggleItem(index)}
              >
                <CollapsibleTrigger className="w-full group">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 text-left hover:bg-white/10 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-400/10 transition-all duration-500 transform hover:scale-[1.02] group-hover:translate-y-[-2px]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-semibold text-white pr-4 group-hover:text-cyan-300 transition-colors duration-300">
                        {faq.question}
                      </h3>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:from-cyan-400/30 group-hover:to-blue-500/30 group-hover:border-cyan-400/50 ${openItems.includes(index) ? 'rotate-45 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-cyan-400/50' : ''}`}>
                        <svg 
                          className={`w-5 h-5 transition-all duration-300 ${openItems.includes(index) ? 'text-cyan-300' : 'text-slate-300 group-hover:text-cyan-300'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden transition-all duration-500 ease-out">
                  <div className="mt-3 mx-2 mb-2 px-6 sm:px-8 py-6 bg-gradient-to-r from-white/5 to-cyan-400/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-inner">
                    <p className="text-slate-200 leading-relaxed font-light text-base sm:text-lg">
                      {faq.answer}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out;
          }
          
          .animate-bounce-in {
            animation: slideUp 0.6s ease-out;
          }
        `
      }} />
    </section>
  );
};