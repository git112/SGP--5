import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

const AdminPage: React.FC = () => {
  const [announcement, setAnnouncement] = useState({
    company: '',
    location: '',
    packageOffers: '',
    jobDescription: '',
    date: ''
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [sheetTarget, setSheetTarget] = useState<'insights'|'companies'|'interview'|'chatbot'|null>(null);
  const [insightsType, setInsightsType] = useState<string>('');
  const [interviewType, setInterviewType] = useState<string>('');

  const addAnnouncement = () => {
    setAnnouncements(prev => [announcement, ...prev]);
    setAnnouncement({ company: '', location: '', packageOffers: '', jobDescription: '', date: '' });
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, hover: { y: -6, scale: 1.01 } };

  return (
    <motion.div className="relative min-h-screen text-foreground overflow-x-hidden" variants={containerVariants} initial="hidden" animate="visible">
      {/* Background like Insights */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.08),_transparent_70%)]" />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(100,116,139,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.35) 1px, transparent 1px)', backgroundSize: '3rem 3rem', opacity: 0.1 }} />
      <motion.div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" animate={{ y: [10, -10, 10], x: [5, -5, 5] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 5 }} />

      <Header />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent">Admin Panel</h1>
          <p className="text-slate-300">Manage announcements and upload data to various sections.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Announcements */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/40 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-cyan-50">Announcements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-cyan-100">Company Name</Label>
                    <Input value={announcement.company} onChange={(e)=>setAnnouncement({...announcement, company:e.target.value})} className="bg-white/5 border-cyan-500/20 text-cyan-100" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-cyan-100">Location</Label>
                      <Input value={announcement.location} onChange={(e)=>setAnnouncement({...announcement, location:e.target.value})} className="bg-white/5 border-cyan-500/20 text-cyan-100" />
                    </div>
                    <div>
                      <Label className="text-cyan-100">Package Offers</Label>
                      <Input value={announcement.packageOffers} onChange={(e)=>setAnnouncement({...announcement, packageOffers:e.target.value})} className="bg-white/5 border-cyan-500/20 text-cyan-100" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-cyan-100">Job Description</Label>
                    <textarea
                      value={announcement.jobDescription}
                      onChange={(e)=>setAnnouncement({...announcement, jobDescription:e.target.value})}
                      rows={8}
                      placeholder="Write a concise description, responsibilities, eligibility, important dates, and application link."
                      className="w-full rounded-md bg-white/5 border border-cyan-500/20 text-cyan-100 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60 placeholder:text-cyan-200/40"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-100">Date</Label>
                    <Input type="date" value={announcement.date} onChange={(e)=>setAnnouncement({...announcement, date:e.target.value})} className="bg-white/5 border-cyan-500/20 text-cyan-100" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={addAnnouncement}
                    className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60"
                  >
                    Create Card
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-slate-700/70 hover:bg-slate-600/70 active:bg-slate-600 text-cyan-100 border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60"
                  >
                    Send Here
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-slate-700/70 hover:bg-slate-600/70 active:bg-slate-600 text-cyan-100 border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60"
                  >
                    Send Through Mail
                  </Button>
                </div>

                <div className="space-y-3 mt-4">
                  {announcements.map((a, idx)=> (
                    <div key={idx} className="p-4 rounded-xl border border-cyan-500/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="font-semibold text-cyan-100">{a.company}</div>
                      <div className="text-cyan-200/80 text-sm">{a.location} • {a.date}</div>
                      <div className="text-cyan-100 mt-2">Package: {a.packageOffers}</div>
                      <div className="text-cyan-100 mt-1">{a.jobDescription}</div>
                    <div className="mt-3 flex gap-2">
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60">Send Here</Button>
                        <Button size="sm" variant="secondary" className="bg-slate-700/80 text-cyan-100 hover:bg-slate-600/80 active:bg-slate-600 border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60">Send Through Mail</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sheet Upload */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/40 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-cyan-50">Sheet Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={()=>{setSheetTarget('insights')}}
                    className={`${sheetTarget==='insights' ? 'bg-cyan-600' : 'bg-slate-700/70'} hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60`}
                  >
                    Insights Page
                  </Button>
                  <Button
                    onClick={()=>{setSheetTarget('companies')}}
                    className={`${sheetTarget==='companies' ? 'bg-cyan-600' : 'bg-slate-700/70'} hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60`}
                  >
                    Companies Page
                  </Button>
                  <Button
                    onClick={()=>{setSheetTarget('interview')}}
                    className={`${sheetTarget==='interview' ? 'bg-cyan-600' : 'bg-slate-700/70'} hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60`}
                  >
                    Interview Page
                  </Button>
                  <Button
                    onClick={()=>{setSheetTarget('chatbot')}}
                    className={`${sheetTarget==='chatbot' ? 'bg-cyan-600' : 'bg-slate-700/70'} hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60`}
                  >
                    Chatbot
                  </Button>
                </div>

                {sheetTarget==='insights' && (
                  <div className="space-y-2">
                    <Label className="text-cyan-100">Insights Section</Label>
                    <Select onValueChange={setInsightsType}>
                      <SelectTrigger className="bg-white/5 border-cyan-500/20 text-cyan-100"><SelectValue placeholder="Select section" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700/50">
                        <SelectItem value="cgpa">CGPA vs Offers Graph</SelectItem>
                        <SelectItem value="top-companies">Top Hiring Companies</SelectItem>
                        <SelectItem value="overview">Yearly Placement Overview</SelectItem>
                        <SelectItem value="salary">Salary Growth Trajectory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {sheetTarget==='interview' && (
                  <div className="space-y-2">
                    <Label className="text-cyan-100">Interview Section</Label>
                    <Select onValueChange={setInterviewType}>
                      <SelectTrigger className="bg-white/5 border-cyan-500/20 text-cyan-100"><SelectValue placeholder="Select section" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700/50">
                        <SelectItem value="by-category">Interview Questions by Category</SelectItem>
                        <SelectItem value="coding">Frequently Asked Coding Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label className="text-cyan-100">Upload File</Label>
                  <Input type="file" className="bg-white/5 border-cyan-500/20 text-cyan-100" />
                </div>
                <Button className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60">Upload</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
};

export default AdminPage;
