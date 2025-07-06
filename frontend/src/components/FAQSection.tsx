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
    <section className="py-16 relative bg-background geometric-bg">
      <div className="absolute inset-0 grid-pattern opacity-5"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base muted max-w-2xl mx-auto font-light">
            Get answers to common questions about placement preparation and our AI assistant
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <Collapsible
              key={index}
              open={openItems.includes(index)}
              onOpenChange={() => toggleItem(index)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="card text-left hover:bg-primary/5 transition-all duration-300 slide-up backdrop-blur-sm" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground pr-4 tracking-tight">
                      {faq.question}
                    </h3>
                    <div className={`transform transition-transform duration-200 ${openItems.includes(index) ? 'rotate-45' : ''}`}>
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="px-6 py-4 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                  <p className="text-sm muted leading-relaxed font-light">
                    {faq.answer}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
};