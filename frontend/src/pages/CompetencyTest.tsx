import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { generateQuestions, analyzeAnswer, makeSummary, type GenerateQuestionsPayload, type Question } from "@/services/competencyApi";
import { InterviewResponseInput } from "@/components/InterviewResponseInput";
import { Copy, Check, Download, Sparkles } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, duration: 0.8 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7 } },
  hover: { y: -5, scale: 1.02, transition: { duration: 0.3 } }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export default function CompetencyTest() {
  const [form, setForm] = useState<GenerateQuestionsPayload>({
    num_of_questions: 3,
    interview_type: "mixed",
    role: "Software Engineer",
    experience_level: "fresher",
    company_name: "",
    company_description: "",
    job_description: "",
    focus_area: "",
    resume_text: "",
  });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<{ score: number; feedback: string }[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answerValid, setAnswerValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Speech synthesis state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null as any;
    };
  }, []);

  const pickMaleVoice = (list: SpeechSynthesisVoice[]) => {
    if (!list || list.length === 0) return null;
    const preferredNames = [
      "David","Guy","Matthew","Justin","Brian","Joey","Adam","Christopher","Michael","Eric","Mark","Russell","Arthur",
      "Microsoft David","Google US English Male","en-US-Wavenet-D","en-US-Standard-D"
    ];
    // Heuristics: english + preferred names
    const english = list.filter(v => /en[-_]/i.test(v.lang));
    for (const name of preferredNames) {
      const found = english.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (found) return found;
    }
    // Otherwise first English voice
    if (english.length > 0) return english[0];
    return list[0];
  };

  const stopSpeaking = () => {
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    setIsSpeaking(false);
    utteranceRef.current = null;
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    stopSpeaking();
    const utt = new SpeechSynthesisUtterance(text);
    const voice = pickMaleVoice(voices);
    if (voice) utt.voice = voice;
    utt.rate = 1.5;
    utt.pitch = 1.0;
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
    setIsSpeaking(true);
  };

  useEffect(() => {
    // When question changes, stop current speech
    stopSpeaking();
    // Optionally auto-read new question: comment out if not desired
    // if (started && questions[current]) speakText(questions[current].question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const onSelect = (name: keyof GenerateQuestionsPayload, value: string) => {
    setForm(f => ({ ...f, [name]: value as any }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Check all mandatory fields except resume_text
    if (!form.role.trim()) {
      errors.role = "Role is required";
    }
    if (!form.company_name.trim()) {
      errors.company_name = "Company Name is required";
    }
    if (!form.company_description.trim()) {
      errors.company_description = "Company Description is required";
    }
    if (!form.job_description.trim()) {
      errors.job_description = "Job Description is required";
    }
    if (!form.focus_area.trim()) {
      errors.focus_area = "Focus Area is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startTest = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSummary("");
    setEvaluations([]);
    try {
      const qs = await generateQuestions(form);
      setQuestions(qs);
      setAnswers(Array(qs.length).fill(""));
      setStarted(true);
      setCurrent(0);
      setAnswerValid(false);
      stopSpeaking();
    } catch (e: any) {
      alert(e?.message || "Failed to start test");
    } finally {
      setLoading(false);
    }
  };

  const validateAnswer = (answer: string) => {
    const trimmed = answer.trim();
    return trimmed.length >= 10; // Minimum 10 characters for a meaningful answer
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setAnswers(prev => {
      const copy = [...prev];
      copy[current] = newAnswer;
      return copy;
    });
    setAnswerValid(validateAnswer(newAnswer));
  };

  const generateFallbackFeedback = (score: number, answerLength: number, questionIndex: number) => {
    if (score >= 70) {
      return `BRUTALLY HONEST: This answer shows some competence with ${answerLength} characters, but still needs significant improvement in depth and technical accuracy for a ${form.role} role.`;
    } else if (score >= 50) {
      return `BRUTALLY HONEST: This answer is mediocre at best. With ${answerLength} characters, you've shown basic understanding but lack the depth and precision expected for a ${form.role} position. You need to be more specific and demonstrate actual expertise.`;
    } else if (score >= 30) {
      return `BRUTALLY HONEST: This answer is poor and shows you're not ready for a ${form.role} role. Only ${answerLength} characters demonstrates lack of preparation and poor communication skills. You need to completely rethink your approach.`;
    } else {
      return `BRUTALLY HONEST: This answer is completely unacceptable. With only ${answerLength} characters, you've demonstrated zero professional competence and appear completely unprepared for any serious role. This level of performance is embarrassing.`;
    }
  };

  const evaluateAll = async () => {
    setLoading(true);
    try {
      const evals: { score: number; feedback: string }[] = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const ua = answers[i] || "";
        try {
          const res = await analyzeAnswer({
            question: q.question,
            userAnswer: ua,
            preferredAnswer: q.preferred_answer,
            role: form.role,
            experience_level: form.experience_level,
            interview_type: form.interview_type,
          });
          
          // Ensure we have valid feedback
          if (!res.feedback || res.feedback === "Analysis failed to provide feedback") {
            res.feedback = generateFallbackFeedback(res.score, ua.length, i);
          }
          
          evals.push(res);
        } catch (error) {
          // Fallback evaluation if API fails
          const answerLength = ua.length;
          let fallbackScore = 25;
          if (answerLength < 30) fallbackScore = 5;
          else if (answerLength < 100) fallbackScore = 20;
          else if (answerLength < 200) fallbackScore = 40;
          else fallbackScore = 60;
          
          evals.push({
            score: fallbackScore,
            feedback: generateFallbackFeedback(fallbackScore, answerLength, i)
          });
        }
      }
      setEvaluations(evals);
      const combined = evals.map((e, idx) => `Q${idx + 1}: ${e.feedback}`).join("\n");
      const sum = await makeSummary(combined);
      setSummary(sum);
    } catch (e: any) {
      alert(e?.message || "Failed to evaluate");
    } finally {
      setLoading(false);
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const downloadSummary = () => {
    try {
      const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `overall-summary-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <motion.div
      className="relative min-h-screen text-foreground fade-in overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#1a1f3a] animate-gradient-x bg-[length:400%_400%] z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      ></motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-[#1a1f3a]/50 opacity-80 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#36b5d3]/5 via-transparent to-[#14788f]/5 animate-pulse z-0"></div>
      <div className="absolute inset-0 grid-pattern opacity-20 z-0"></div>
      
      {/* Floating orbs */}
      <motion.div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#36b5d3]/10 blur-3xl z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-[#14788f]/10 blur-2xl z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      <motion.div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#36b5d3]/15 blur-xl z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      <motion.div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-[#14788f]/15 blur-lg z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 3 }} />

      <Header />

      <section className="pt-24 pb-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <motion.div className="text-center mb-12" variants={cardVariants}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
              Competency Test
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
              Test your skills with AI-powered interview questions and get brutally honest feedback
            </p>
          </motion.div>

          {!started && (
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gradient-primary text-center">Test Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        <p className="text-red-400 font-medium">Please fill in all required fields</p>
                      </div>
                      <p className="text-red-300 text-sm">All fields marked with * are mandatory to start the test.</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block" htmlFor="interview_type">Interview Type</label>
                      <Select value={form.interview_type} onValueChange={(v) => onSelect("interview_type", v)}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="technical" className="text-white hover:bg-slate-700">Technical</SelectItem>
                          <SelectItem value="behavioral" className="text-white hover:bg-slate-700">Behavioral</SelectItem>
                          <SelectItem value="mixed" className="text-white hover:bg-slate-700">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block" htmlFor="experience_level">Experience</label>
                      <Select value={form.experience_level} onValueChange={(v) => onSelect("experience_level", v)}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                          <SelectValue placeholder="Experience" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="fresher" className="text-white hover:bg-slate-700">Fresher</SelectItem>
                          <SelectItem value="junior" className="text-white hover:bg-slate-700">Junior</SelectItem>
                          <SelectItem value="mid" className="text-white hover:bg-slate-700">Mid</SelectItem>
                          <SelectItem value="senior" className="text-white hover:bg-slate-700">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block" htmlFor="num_of_questions">Questions</label>
                      <Input 
                        id="num_of_questions" 
                        type="number" 
                        min={3} 
                        max={10} 
                        name="num_of_questions" 
                        value={form.num_of_questions}
                        onChange={(e) => onSelect("num_of_questions", String(Math.max(3, Math.min(10, Number(e.target.value)||3))))}
                        className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block" htmlFor="role">Role *</label>
                      <Input 
                        id="role" 
                        name="role" 
                        value={form.role} 
                        onChange={onChange}
                        className={`bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 ${
                          validationErrors.role ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400"
                        }`}
                      />
                      {validationErrors.role && (
                        <p className="text-sm text-red-400 mt-1 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          {validationErrors.role}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block" htmlFor="company_name">Company Name *</label>
                      <Input 
                        id="company_name" 
                        name="company_name" 
                        value={form.company_name} 
                        onChange={onChange}
                        className={`bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 ${
                          validationErrors.company_name ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400"
                        }`}
                      />
                      {validationErrors.company_name && (
                        <p className="text-sm text-red-400 mt-1 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          {validationErrors.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block" htmlFor="company_description">Company Description *</label>
                      <Textarea 
                        id="company_description" 
                        name="company_description" 
                        value={form.company_description} 
                        onChange={onChange} 
                        rows={3}
                        className={`bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 ${
                          validationErrors.company_description ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400"
                        }`}
                      />
                      {validationErrors.company_description && (
                        <p className="text-sm text-red-400 mt-1 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          {validationErrors.company_description}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block" htmlFor="job_description">Job Description *</label>
                      <Textarea 
                        id="job_description" 
                        name="job_description" 
                        value={form.job_description} 
                        onChange={onChange} 
                        rows={3}
                        className={`bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 ${
                          validationErrors.job_description ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400"
                        }`}
                      />
                      {validationErrors.job_description && (
                        <p className="text-sm text-red-400 mt-1 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          {validationErrors.job_description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block" htmlFor="focus_area">Focus Area *</label>
                    <Input 
                      id="focus_area" 
                      name="focus_area" 
                      value={form.focus_area} 
                      onChange={onChange}
                      className={`bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 ${
                        validationErrors.focus_area ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400"
                      }`}
                    />
                    {validationErrors.focus_area && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        {validationErrors.focus_area}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block" htmlFor="resume_text">Resume Text</label>
                    <Textarea 
                      id="resume_text" 
                      name="resume_text" 
                      value={form.resume_text} 
                      onChange={onChange} 
                      rows={4}
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-center">
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button 
                      onClick={startTest} 
                      disabled={loading}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? "Starting..." : "Start Test"}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {started && questions.length > 0 && (
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gradient-primary">Question {current + 1} of {questions.length}</CardTitle>
                  <div className="flex gap-2">
                    {!isSpeaking ? (
                      <Button 
                        variant="outline" 
                        onClick={() => speakText(questions[current].question)} 
                        title="Read question aloud"
                        className="border-cyan-400/30 hover:bg-cyan-500/20 text-cyan-400"
                      >
                        🔊 Read
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={stopSpeaking} 
                        title="Stop reading"
                        className="border-red-400/30 hover:bg-red-500/20 text-red-400"
                      >
                        ⏹ Stop
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30">Q{current + 1}</Badge>
                      <div className="font-medium text-white text-lg">{questions[current].question}</div>
                    </div>
                    <InterviewResponseInput
                      value={answers[current] || ""}
                      onChange={(val) => {
                        setAnswers(prev => {
                          const copy = [...prev];
                          copy[current] = val;
                          return copy;
                        });
                        setAnswerValid(validateAnswer(val));
                      }}
                      placeholder="Type your answer here or use voice-to-text... (minimum 10 characters)"
                      minLength={10}
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                    />
                    {!answerValid && answers[current] && (
                      <p className="text-sm text-red-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        Please provide a more detailed answer (at least 10 characters)
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4 justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrent((c) => Math.max(0, c - 1))} 
                      disabled={current === 0}
                      className="border-slate-600/50 hover:bg-slate-700/50 text-slate-300"
                    >
                      Previous
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {current < questions.length - 1 ? (
                      <Button 
                        onClick={() => {
                          setCurrent((c) => Math.min(questions.length - 1, c + 1));
                          setAnswerValid(false);
                        }} 
                        disabled={!answerValid}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next Question
                      </Button>
                    ) : (
                      <Button 
                        onClick={evaluateAll} 
                        disabled={loading || !answerValid}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Submitting..." : "Submit"}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {evaluations.length > 0 && (
            <motion.div variants={cardVariants} className="mt-8">
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gradient-primary text-center">Brutally Honest Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evaluations.map((ev, idx) => (
                    <motion.div 
                      key={`ev-${idx}`} 
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-sm">Q{idx + 1}</Badge>
                        <div className="text-sm font-medium text-slate-300">
                          Score: <span className={`font-bold ${ev.score >= 70 ? 'text-green-400' : ev.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {ev.score}/100
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-200 leading-relaxed">{ev.feedback}</div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {summary && (
            <motion.div variants={cardVariants} className="mt-8">
              <Card className="relative overflow-hidden border-0 shadow-2xl">
                {/* Gradient Border */}
                <div className="absolute inset-0 p-[1px] rounded-2xl bg-[linear-gradient(135deg,rgba(34,211,238,0.6),rgba(59,130,246,0.6),rgba(168,85,247,0.6))]"></div>
                <div className="relative rounded-[14px] bg-slate-900/70 backdrop-blur-xl">
                  <CardHeader className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 flex items-center justify-center border border-white/10">
                          <Sparkles className="w-5 h-5 text-cyan-300" />
                        </div>
                        <div>
                          <CardTitle className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">Overall Summary</CardTitle>
                          <p className="text-xs text-slate-400 mt-1">Generated from your answers and evaluations</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copySummary}
                          className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10"
                          title="Copy summary"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadSummary}
                          className="border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/10"
                          title="Download as text"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-800/60 to-slate-900/50 p-5 shadow-inner max-h-[50vh] overflow-y-auto custom-thin-scrollbar" data-color-mode="dark">
                        <div className="wmde-markdown-var">
                          <MDEditor.Markdown source={summary} style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent' }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </motion.div>
  );
}


