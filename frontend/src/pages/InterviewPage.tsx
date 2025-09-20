import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Mock data for demonstration
const hrTechnicalQuestions = [
  {
    company: "Amazon",
    text: "Tell me about yourself.",
    category: "HR",
    round: "HR Round 1",
    tags: ["Behavioral", "Introduction"],
  },
  {
    company: "Amazon",
    text: "Explain a technical challenge you faced.",
    category: "Technical",
    round: "Technical Round 2",
    tags: ["Problem Solving", "Experience"],
  },
  // ...more
];
const codingQuestions = [
  {
    company: "Amazon",
    title: "Two Sum",
    tags: ["Array", "HashMap"],
    difficulty: "Easy",
    link: "https://leetcode.com/problems/two-sum/",
  },
  {
    company: "Amazon",
    title: "Longest Increasing Subsequence",
    tags: ["DP", "Array"],
    difficulty: "Medium",
    link: "https://leetcode.com/problems/longest-increasing-subsequence/",
  },
  // ...more
];

export default function InterviewPage() {
  const navigate = useNavigate();
  // Tab 1 filters
  const [typeFilter, setTypeFilter] = useState("Both");
  // Tab 2 filters
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Filtered data
  const filteredHRTech = hrTechnicalQuestions.filter(q => {
    const typeMatch = typeFilter === "Both" || q.category === typeFilter;
    return typeMatch;
  });
  const filteredCoding = codingQuestions.filter(q => {
    const diffMatch = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    return diffMatch;
  });



  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#0f172a] text-foreground overflow-x-hidden">
      <Header />
      
      {/* Animated homepage-style background overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/60 via-transparent to-[#1a1f3a]/80 opacity-90"></div>
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#36b5d3]/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[#14788f]/10 blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#36b5d3]/15 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-[#14788f]/15 blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Floating dots */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-[#36b5d3]/40 rounded-full animate-ping shadow-lg shadow-[#36b5d3]/20"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-[#14788f]/50 rounded-full animate-ping shadow-lg shadow-[#14788f]/20" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-32 w-2.5 h-2.5 bg-[#36b5d3]/40 rounded-full animate-ping shadow-lg shadow-[#36b5d3]/20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-[#14788f]/45 rounded-full animate-ping shadow-lg shadow-[#14788f]/20" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto pt-10 pb-10 px-4 max-w-7xl relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-glow">
            Interview Questions & Coding Prep
          </h2>
          <p className="text-lg text-[#dee0e1]/80 max-w-2xl mx-auto font-light mb-8">
            Practice real interview questions and filter by type to prepare for your interviews!
          </p>
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 relative">
          {/* Vertical Divider for desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-cyan-400/10 via-slate-400/20 to-purple-400/10 z-10" style={{transform: 'translateX(-50%)'}}></div>
          {/* Left: HR/Technical/Domain-based Questions */}
          <div className="flex-1 min-w-0 px-0 lg:pr-8 flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-cyan-300 mb-2 tracking-tight">HR / Technical Questions</h3>
              <p className="text-sm text-slate-200/80 mb-4">Browse and practice real interview questions asked in HR and technical rounds.</p>
              <div className="flex gap-2 flex-wrap mb-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Both">Both</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Question List - Q&A style, no company names, no cards */}
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
              }}
            >
              {filteredHRTech.map((q) => (
                <motion.div
                  key={`${q.category}-${q.round}-${q.text}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.25 }}
                  className="bg-white/10 backdrop-blur-xl border border-cyan-400/10 rounded-lg px-4 py-3"
                >
                  <div className="text-base md:text-lg font-medium leading-relaxed text-slate-100">
                    {q.text}
                  </div>
                </motion.div>
              ))}
              {filteredHRTech.length === 0 && (
                <div className="text-center text-muted py-12">No questions found.</div>
              )}
            </motion.div>
          </div>
          {/* Right: Coding Questions */}
          <div className="flex-1 min-w-0 px-0 lg:pl-8 flex flex-col mt-12 lg:mt-0">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-purple-300 mb-2 tracking-tight">Frequently Asked Coding Questions</h3>
              <p className="text-sm text-slate-200/80 mb-4">Explore and practice coding questions commonly asked in interviews. Filter by difficulty or company.</p>
              <div className="flex gap-2 flex-wrap mb-4">
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Coding Questions Table/List */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-300">
                    <th className="px-3 py-2 font-semibold">Title</th>
                    <th className="px-3 py-2 font-semibold">Tags</th>
                    <th className="px-3 py-2 font-semibold">Difficulty</th>
                    <th className="px-3 py-2 font-semibold">Practice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoding.map((q) => (
                    <tr key={`${q.title}-${q.company}`} className="bg-white/10 backdrop-blur-xl border border-purple-400/10 rounded-xl transition-all duration-200 hover:bg-purple-400/10 group">
                      <td className="px-3 py-2 font-medium text-purple-200 whitespace-nowrap">{q.title}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 flex-wrap">
                          {q.tags.map((tag) => <Badge key={`${q.title}-${tag}`} variant="outline" className="border-purple-400/30 text-purple-200 group-hover:border-purple-400/60 group-hover:text-purple-100">{tag}</Badge>)}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {(() => {
                          let variant: 'secondary' | 'default' | 'destructive' = 'default';
                          if (q.difficulty === 'Easy') variant = 'secondary';
                          else if (q.difficulty === 'Hard') variant = 'destructive';
                          return <Badge variant={variant} className="text-xs px-2 py-1">{q.difficulty}</Badge>;
                        })()}
                      </td>
                      <td className="px-3 py-2">
                        <a href={q.link} target="_blank" rel="noopener noreferrer" className="text-purple-300 font-medium underline underline-offset-2 group-hover:text-purple-200 transition-colors">Practice</a>
                      </td>
                    </tr>
                  ))}
                  {filteredCoding.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted py-12">No coding questions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Global CTA below both sections */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex justify-center">
          <Button variant="hero" size="lg" className="shadow-xl" onClick={() => navigate('/competency-test')}>
            Test Your Confidence!
          </Button>
        </div>
      </div>
      <Footer />
      {/* Custom style for select dropdown options */}
      <style>{`
        select.custom-select, select.custom-select option {
          background-color: #1a223a;
          color: #e0f2fe;
        }
        select.custom-select:focus, select.custom-select option:checked {
          background-color: #164e63;
          color: #38bdf8;
        }
      `}</style>
    </div>
  );
}
