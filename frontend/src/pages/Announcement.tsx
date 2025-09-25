import React, { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

type Announcement = {
  _id: string;
  company: string;
  location: string;
  role: string;
  package: string;
  date: string;
  instructions?: string;
  created_at: string;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AnnouncementPage: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const { data } = useQuery<Announcement[]>({
    queryKey: ['announcements', sortOrder],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/announcements?sort=${sortOrder}`);
      if (!res.ok) throw new Error('Failed to fetch announcements');
      return res.json();
    },
    staleTime: 60_000,
  });

  const announcements = useMemo(() => data || [], [data]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, hover: { y: -6, scale: 1.01 } };

  return (
    <motion.div className="relative min-h-screen text-foreground overflow-x-hidden" variants={containerVariants} initial="hidden" animate="visible">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.08),_transparent_70%)]" />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(100,116,139,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.35) 1px, transparent 1px)', backgroundSize: '3rem 3rem', opacity: 0.1 }} />
      <motion.div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" animate={{ y: [10, -10, 10], x: [5, -5, 5] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 5 }} />

      <Header />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent">Announcements</h1>
          <div className="w-48">
            <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
              <SelectTrigger className="bg-white/5 border-cyan-500/20 text-cyan-100"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700/50">
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {announcements.map((a) => (
            <motion.div key={a._id} variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
              <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/40 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-cyan-50 flex items-center justify-between">
                    <span>{a.company}</span>
                    <span className="text-sm text-cyan-200/80">{new Date(a.created_at).toLocaleString()}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-cyan-100 space-y-1">
                  <div className="text-cyan-200/80 text-sm">{a.location} • {a.date}</div>
                  <div>Role: {a.role}</div>
                  <div>Package: {a.package}</div>
                  {a.instructions && <div className="mt-2 whitespace-pre-wrap text-cyan-100/90">{a.instructions}</div>}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {announcements.length === 0 && (
            <div className="text-center text-cyan-200/70 py-10">No announcements yet.</div>
          )}
        </div>
      </div>
      <Footer />
    </motion.div>
  );
};

export default AnnouncementPage;


