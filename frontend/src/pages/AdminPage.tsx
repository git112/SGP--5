import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { createAnnouncement, sendAnnouncementEmail } from '@/services/announcementsApi';
import { toast } from 'sonner';

const AdminPage: React.FC = () => {
  const [announcement, setAnnouncement] = useState({
    company: '',
    location: '',
    packageOffers: '',
    jobDescription: '',
    date: ''
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [sheetTarget, setSheetTarget] = useState<'insights' | 'companies' | 'interview' | 'chatbot' | null>(null);
  const [insightsType, setInsightsType] = useState<string>('');
  const [interviewType, setInterviewType] = useState<string>('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const { token } = useAuth();

  const addAnnouncement = () => {
    setAnnouncements(prev => [announcement, ...prev]);
    setAnnouncement({ company: '', location: '', packageOffers: '', jobDescription: '', date: '' });
  };

  const removeLocalAnnouncement = (removeIndex: number) => {
    setAnnouncements(prev => prev.filter((_, idx) => idx !== removeIndex));
    toast.message('Draft announcement discarded');
  };

  const sendToBoard = async (a: any) => {
    try {
      if (!token) { toast.error('Please login again'); return; }
      await createAnnouncement({
        company: a.company,
        location: a.location,
        role: a.jobDescription?.split('\n')[0] || 'Role',
        package: a.packageOffers,
        date: a.date,
        instructions: a.jobDescription,
      }, token);
      toast.success('Sent to Announcement board');
    } catch (e: any) {
      toast.error(e.message || 'Failed to send');
    }
  };

  const openEmailDialog = (a: any) => {
    setCurrentAnnouncement(a);
    setEmailRecipients('');
    setEmailDialogOpen(true);
  };

  const sendMail = async () => {
    try {
      if (!token) { toast.error('Please login again'); return; }
      if (!currentAnnouncement) return;

      const emails = emailRecipients
        .split(/[,;\s]+/)
        .map(s => s.trim())
        .filter(Boolean);
      if (emails.length === 0) {
        toast.error('Please enter at least one email address');
        return;
      }
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      const invalid = emails.filter(e => !emailRegex.test(e));
      if (invalid.length) {
        toast.error(`Invalid emails: ${invalid.slice(0, 3).join(', ')}`);
        return;
      }

      const res = await sendAnnouncementEmail({
        company: currentAnnouncement.company,
        location: currentAnnouncement.location,
        role: currentAnnouncement.jobDescription?.split('\n')[0] || 'Role',
        package: currentAnnouncement.packageOffers,
        date: currentAnnouncement.date,
        instructions: currentAnnouncement.jobDescription,
        emails,
      }, token);

      toast.success(`Emails sent: ${res.sent}, failed: ${res.failed?.length || 0}`);
      setEmailDialogOpen(false);
      setEmailRecipients('');
      setCurrentAnnouncement(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to send emails');
    }
  }


  const handleUpload = async () => {
    if (!file || !sheetTarget) {
      toast.error('Please select a target and upload a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', sheetTarget);
    if (year) formData.append('year', year);

    setIsUploading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api';
      const res = await fetch(`${backendUrl}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');

      toast.success(data.message);
      setFile(null);
      setYear('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, hover: { y: -6, scale: 1.01 } };

  const templates = {
    insights: {
      cgpa: {
        title: "CGPA vs Offers Template",
        headers: ["Year", "CGPA", "Offers"],
        rows: [
          ["2020", "9.29", "1"],
          ["2020", "7.6", "1"]
        ]
      },
      salary: {
        title: "Salary Growth Template",
        headers: ["Year", "Average Package", "Highest Package", "Lowest Package"],
        rows: [
          ["2020", "3.83", "7", "2.4"],
          ["2021", "4.28", "14.5", "1.2"]
        ]
      },
      "top-companies": {
        title: "Top Companies Template",
        headers: ["Company", "Total Offers", "Years"],
        rows: [
          ["ACE INFOWAY", "0", "2023, 2024"],
          ["Alian Software", "3", "2024, 2025"]
        ]
      },
      overview: {
        title: "Roles/Overview Template",
        headers: ["Year", "Role", "Count"],
        rows: [
          ["2020", "Software Engineer", "34"],
          ["2020", "Analyst", "1"]
        ]
      }
    },
    companies: {
      title: "Companies Directory Template",
      headers: ["Company", "Location", "Avg. Package", "Roles"],
      rows: [
        ["Agami Tech", "Surat", "1", "Software Engineer"],
        ["Amazon", "Seattle", "14.5", "Software Engineer"]
      ]
    }
  };

  const renderTemplate = () => {
    let template = null;
    if (sheetTarget === 'companies') {
      template = templates.companies;
    } else if (sheetTarget === 'insights' && insightsType) {
      template = templates.insights[insightsType as keyof typeof templates.insights];
    }

    if (!template) return null;

    return (
      <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-cyan-200">{template.title}</h4>
          <span className="text-xs text-slate-400">Expected CSV/Excel Format</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                {template.headers.map((h, i) => <th key={i} className="px-3 py-2 border-b border-slate-700">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {template.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-700/50 last:border-0">
                  {row.map((cell, j) => <td key={j} className="px-3 py-2">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
                    <Input value={announcement.company} onChange={(e) => setAnnouncement({ ...announcement, company: e.target.value })} className="bg-white/5 border-cyan-500/20 text-cyan-100" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-cyan-100">Location</Label>
                      <Input value={announcement.location} onChange={(e) => setAnnouncement({ ...announcement, location: e.target.value })} className="bg-white/5 border-cyan-500/20 text-cyan-100" />
                    </div>
                    <div>
                      <Label className="text-cyan-100">Package Offers</Label>
                      <Input value={announcement.packageOffers} onChange={(e) => setAnnouncement({ ...announcement, packageOffers: e.target.value })} className="bg-white/5 border-cyan-500/20 text-cyan-100" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-cyan-100">Job Description</Label>
                    <textarea
                      value={announcement.jobDescription}
                      onChange={(e) => setAnnouncement({ ...announcement, jobDescription: e.target.value })}
                      rows={8}
                      placeholder="Write a concise description, responsibilities, eligibility, important dates, and application link."
                      className="w-full rounded-md bg-white/5 border border-cyan-500/20 text-cyan-100 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60 placeholder:text-cyan-200/40"
                    />
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
                    onClick={() => sendToBoard(announcement)}
                    className="bg-slate-700/70 hover:bg-slate-600/70 active:bg-slate-600 text-cyan-100 border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60"
                  >
                    Send to Board
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => openEmailDialog(announcement)}
                    className="bg-slate-700/70 hover:bg-slate-600/70 active:bg-slate-600 text-cyan-100 border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60"
                  >
                    Send via Email
                  </Button>
                </div>

                <div className="space-y-3 mt-4">
                  {announcements.map((a, idx) => (
                    <div key={idx} className="relative p-4 rounded-xl border border-cyan-500/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <button
                        aria-label="Discard draft announcement"
                        onClick={() => removeLocalAnnouncement(idx)}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-slate-700/70 hover:bg-slate-600/70 text-cyan-100 border border-cyan-500/20"
                      >
                        ×
                      </button>
                      <div className="font-semibold text-cyan-100 pr-10">{a.company}</div>
                      <div className="text-cyan-200/80 text-sm">{a.location} • {a.date}</div>
                      <div className="text-cyan-100 mt-2">Package: {a.packageOffers}</div>
                      <div className="text-cyan-100 mt-1">{a.jobDescription}</div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => sendToBoard(a)} className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60">Send to Board</Button>
                        <Button size="sm" variant="secondary" onClick={() => openEmailDialog(a)} className="bg-slate-700/80 text-cyan-100 hover:bg-slate-600/80 active:bg-slate-600 border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60">Send via Email</Button>
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
                    onClick={() => { setSheetTarget('insights') }}
                    className={`${sheetTarget === 'insights' ? 'bg-cyan-600' : 'bg-slate-700/70'} hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60`}
                  >
                    Insights Page
                  </Button>
                  <Button
                    onClick={() => { setSheetTarget('companies') }}
                    className={`${sheetTarget === 'companies' ? 'bg-cyan-600' : 'bg-slate-700/70'} hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60`}
                  >
                    Companies Page
                  </Button>
                  <Button
                    onClick={() => { setSheetTarget('interview') }}
                    className={`${sheetTarget === 'interview' ? 'bg-cyan-600' : 'bg-slate-700/70'} hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60`}
                  >
                    Interview Page
                  </Button>
                  <Button
                    onClick={() => { setSheetTarget('chatbot') }}
                    className={`${sheetTarget === 'chatbot' ? 'bg-cyan-600' : 'bg-slate-700/70'} hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60`}
                  >
                    Chatbot
                  </Button>
                </div>

                {sheetTarget === 'insights' && (
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

                {sheetTarget === 'interview' && (
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

                {(sheetTarget === 'insights' || sheetTarget === 'companies' || sheetTarget === 'interview') && (
                  <div>
                    <Label className="text-cyan-100">Year (Optional)</Label>
                    <Input
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 2025"
                      className="bg-white/5 border-cyan-500/20 text-cyan-100"
                    />
                  </div>
                )}

                {renderTemplate()}

                <div>
                  <Label className="text-cyan-100">Upload File</Label>
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="bg-white/5 border-cyan-500/20 text-cyan-100"
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/60"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-cyan-100">
          <DialogHeader>
            <DialogTitle className="text-cyan-50">Send Announcement via Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentAnnouncement && (
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="font-semibold text-cyan-200 mb-2">Announcement Preview:</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Company:</strong> {currentAnnouncement.company}</div>
                  <div><strong>Location:</strong> {currentAnnouncement.location}</div>
                  <div><strong>Package:</strong> {currentAnnouncement.packageOffers}</div>
                  <div><strong>Date:</strong> {currentAnnouncement.date}</div>
                </div>
              </div>
            )}

            <div>
              <Label className="text-cyan-100">Recipient Email Addresses</Label>
              <Textarea
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="Enter email addresses separated by commas (e.g., student1@charusat.ac.in, student2@charusat.ac.in)"
                className="bg-white/5 border-cyan-500/20 text-cyan-100 placeholder:text-cyan-200/40"
                rows={4}
              />
              <p className="text-xs text-cyan-200/70 mt-1">
                You can enter multiple email addresses separated by commas, or upload a CSV file with email addresses.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={sendMail}
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Send Emails
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEmailDialogOpen(false)}
                className="bg-slate-700 hover:bg-slate-600 text-cyan-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </motion.div>
  );
};

export default AdminPage;
