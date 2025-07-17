import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/Footer";

// Mock data for demonstration
const companies = ["Google", "Microsoft", "Amazon", "Apple", "Netflix", "Meta"];
const hrTechnicalQuestions = [
  {
    company: "Google",
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
    title: "Two Sum",
    tags: ["Array", "HashMap"],
    difficulty: "Easy",
    company: "Google",
    link: "https://leetcode.com/problems/two-sum/",
  },
  {
    title: "Longest Increasing Subsequence",
    tags: ["DP", "Array"],
    difficulty: "Medium",
    company: "Amazon",
    link: "https://leetcode.com/problems/longest-increasing-subsequence/",
  },
  // ...more
];

export default function InterviewPage() {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    round: "HR",
    questions: "",
    tips: "",
    anonymous: false,
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  // Tab 1 filters
  const [typeFilter, setTypeFilter] = useState("Both");
  const [companyFilter, setCompanyFilter] = useState("all");
  // Tab 2 filters
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [codingCompanyFilter, setCodingCompanyFilter] = useState("all");
  // Random question logic
  const [showRandom, setShowRandom] = useState(false);
  const [randomQuestion, setRandomQuestion] = useState(null);

  // Filtered data
  const filteredHRTech = hrTechnicalQuestions.filter(q => {
    const typeMatch = typeFilter === "Both" || q.category === typeFilter;
    const companyMatch = companyFilter === "all" || q.company === companyFilter;
    return typeMatch && companyMatch;
  });
  const filteredCoding = codingQuestions.filter(q => {
    const diffMatch = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    const companyMatch = codingCompanyFilter === "all" || q.company === codingCompanyFilter;
    return diffMatch && companyMatch;
  });

  // Random question handler
  const handleRandomQuestion = () => {
    const pool = filteredHRTech.length ? filteredHRTech : hrTechnicalQuestions;
    const idx = Math.floor(Math.random() * pool.length);
    setRandomQuestion(pool[idx]);
    setShowRandom(true);
  };
  const handleNextRandom = () => {
    handleRandomQuestion();
  };

  // Modal form handlers
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (form.email && !/^[\w.-]+@charusat\.edu\.in$/.test(form.email)) {
      setFormError("Email must be a @charusat.edu.in address");
      return;
    }
    // TODO: Submit to backend
    setFormSuccess("Thank you for sharing your experience!");
    setForm({ name: "", email: "", company: "", round: "HR", questions: "", tips: "", anonymous: false });
    setTimeout(() => setModalOpen(false), 1200);
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#0f172a] text-foreground overflow-x-hidden">
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
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-700/30 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-cyan-400 tracking-tight drop-shadow-glow">Interview Prep</h1>
          <Button variant="cosmic" size="lg" onClick={() => setModalOpen(true)}>
            Submit Your Experience
          </Button>
        </div>
      </div>
      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg card border-primary/20 slide-up bg-white/10 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-foreground">Share Your Interview Experience</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 p-2" onSubmit={handleFormSubmit}>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleFormChange} placeholder="(Optional)" className="w-full" />
              </div>
              <div className="flex-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={form.email} onChange={handleFormChange} placeholder="@charusat.edu.in" type="email" className="w-full" />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" name="company" value={form.company} onChange={handleFormChange} required className="w-full" />
            </div>
            <div>
              <Label>Interview Round</Label>
              <RadioGroup name="round" value={form.round} onValueChange={val => setForm(f => ({ ...f, round: val }))} className="flex flex-col sm:flex-row gap-4 mt-1">
                <div className="flex items-center gap-2"><RadioGroupItem value="HR" id="hr" /> <Label htmlFor="hr">HR</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="Technical" id="tech" /> <Label htmlFor="tech">Technical</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="Coding" id="coding" /> <Label htmlFor="coding">Coding</Label></div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="questions">Questions</Label>
              <Textarea id="questions" name="questions" value={form.questions} onChange={handleFormChange} required rows={3} className="w-full" />
            </div>
            <div>
              <Label htmlFor="tips">Interview Tips / Experience</Label>
              <Textarea id="tips" name="tips" value={form.tips} onChange={handleFormChange} rows={2} className="w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="anonymous" name="anonymous" checked={form.anonymous} onCheckedChange={val => setForm(f => ({ ...f, anonymous: !!val }))} />
              <Label htmlFor="anonymous">Submit as anonymous</Label>
            </div>
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            {formSuccess && <div className="text-green-500 text-sm">{formSuccess}</div>}
            <Button type="submit" className="w-full mt-2">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto py-10 px-4 max-w-7xl relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-glow">
            Interview Questions & Coding Prep
          </h2>
          <p className="text-lg text-[#dee0e1]/80 max-w-2xl mx-auto font-light">
            Practice real interview questions, filter by company or type, and share your experience to help your juniors!
          </p>
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 relative">
          {/* Vertical Divider for desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-cyan-400/10 via-slate-400/20 to-purple-400/10 z-10" style={{transform: 'translateX(-50%)'}}></div>
          {/* Left: HR/Technical/Domain-based Questions */}
          <div className="flex-1 min-w-0 px-0 lg:pr-8 flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-cyan-300 mb-2 tracking-tight">HR / Technical / Domain Questions</h3>
              <p className="text-sm text-slate-200/80 mb-4">Browse and practice real interview questions asked in HR, technical, and domain rounds.</p>
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
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="hero" size="lg" className="flex-1 md:max-w-xs shadow-xl" onClick={handleRandomQuestion}>
                  Test Your Confidence!
                </Button>
              </div>
            </div>
            {/* Random Question Fade-in */}
            <AnimatePresence>
              {showRandom && randomQuestion && (
                <motion.div
                  key={randomQuestion.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="h-[220px]">
                    <Card className="border-cyan-400/40 bg-white/10 backdrop-blur-xl shadow-2xl h-full flex flex-col justify-between">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">{randomQuestion.company}</span>
                          <Badge variant="secondary">{randomQuestion.category}</Badge>
                          <span className="text-xs text-muted-foreground ml-2">{randomQuestion.round}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-medium mb-2">{randomQuestion.text}</div>
                        <div className="flex gap-2 flex-wrap">
                          {randomQuestion.tags.map((tag, i) => <Badge key={i} variant="outline">{tag}</Badge>)}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="outline" onClick={handleNextRandom}>Next Question</Button>
                      </CardFooter>
                    </Card>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Question Cards Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                },
              }}
            >
              {filteredHRTech.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.18 }}
                  className="h-[220px]"
                >
                  <Card className="border-cyan-400/20 bg-white/10 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{q.company}</span>
                        <Badge variant="secondary">{q.category}</Badge>
                        <span className="text-xs text-muted-foreground ml-2">{q.round}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-base font-medium mb-2">{q.text}</div>
                      <div className="flex gap-2 flex-wrap">
                        {q.tags.map((tag, i) => <Badge key={i} variant="outline">{tag}</Badge>)}
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                      <Button size="icon" variant="ghost" title="Upvote"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-6 0v4M5 15h14l-1.34 5.36A2 2 0 0115.7 22H8.3a2 2 0 01-1.96-1.64L5 15z" /></svg></Button>
                      <Button size="icon" variant="ghost" title="Save"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg></Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
              {filteredHRTech.length === 0 && <div className="col-span-full text-center text-muted py-12">No questions found.</div>}
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
                <Select value={codingCompanyFilter} onValueChange={setCodingCompanyFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                  {filteredCoding.map((q, i) => (
                    <tr key={i} className="bg-white/10 backdrop-blur-xl border border-purple-400/10 rounded-xl transition-all duration-200 hover:bg-purple-400/10 group">
                      <td className="px-3 py-2 font-medium text-purple-200 whitespace-nowrap">{q.title}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 flex-wrap">
                          {q.tags.map((tag, j) => <Badge key={j} variant="outline" className="border-purple-400/30 text-purple-200 group-hover:border-purple-400/60 group-hover:text-purple-100">{tag}</Badge>)}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={q.difficulty === 'Easy' ? 'secondary' : q.difficulty === 'Medium' ? 'default' : 'destructive'} className="text-xs px-2 py-1">{q.difficulty}</Badge>
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
