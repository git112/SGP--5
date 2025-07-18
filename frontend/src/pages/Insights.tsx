import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Building2, TrendingUp, DollarSign, BookOpen, Target, BarChart3
} from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { y: -5, scale: 1.02, transition: { duration: 0.3 } }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// Sample data
const cgpaData = [
  { cgpa: '6.0-7.0', offers: 12, students: 45 },
  { cgpa: '7.0-8.0', offers: 28, students: 60 },
  { cgpa: '8.0-9.0', offers: 42, students: 55 },
  { cgpa: '9.0-10.0', offers: 38, students: 40 }
];

const companiesData = [
  { name: 'TCS', hires: 45, color: '#4F46E5' },
  { name: 'Infosys', hires: 38, color: '#06B6D4' },
  { name: 'Wipro', hires: 32, color: '#10B981' },
  { name: 'Accenture', hires: 28, color: '#F59E0B' },
  { name: 'IBM', hires: 25, color: '#EF4444' },
  { name: 'Cognizant', hires: 22, color: '#8B5CF6' }
];

const rolesData = [
  { role: 'Software Developer', count: 85, color: '#4F46E5' },
  { role: 'Data Analyst', count: 45, color: '#06B6D4' },
  { role: 'System Engineer', count: 38, color: '#10B981' },
  { role: 'Quality Analyst', count: 32, color: '#F59E0B' },
  { role: 'DevOps Engineer', count: 28, color: '#EF4444' }
];

const packageData = [
  { year: '2020', avg: 4.2, highest: 12, total: 180 },
  { year: '2021', avg: 4.8, highest: 15, total: 195 },
  { year: '2022', avg: 5.4, highest: 18, total: 210 },
  { year: '2023', avg: 6.1, highest: 22, total: 225 },
  { year: '2024', avg: 6.8, highest: 25, total: 240 }
];

const FloatingDot = ({ className, delay }) => (
  <motion.div
    className={`absolute rounded-full ${className}`}
    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

// 1. Glassy chart container utility
const glassyChart = "glass shadow-2xl border border-white/10 p-4 md:p-8 rounded-3xl relative overflow-hidden";

// 2. Modern gradients for charts
// (Define in SVG <defs> for each chart)

// 4. Custom glassy tooltip
const GlassyTooltip = (props: any) => {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-400/20 shadow-xl rounded-xl px-4 py-3 text-cyan-200 text-sm font-medium animate-fade-in">
      <div className="mb-1 font-semibold text-cyan-300">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: entry.color }}></span>
          <span>{entry.name}: <span className="font-bold">{entry.value}</span></span>
        </div>
      ))}
    </div>
  );
};

export default function Insights() {
  const [activeTab, setActiveTab] = useState('2024');

  return (
    <motion.div
      className="relative min-h-screen text-foreground fade-in overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Exact home page hero background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#1a1f3a] animate-gradient-x bg-[length:400%_400%] z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      ></motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-[#1a1f3a]/50 opacity-80 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#36b5d3]/5 via-transparent to-[#14788f]/5 animate-pulse z-0"></div>
      <div className="absolute inset-0 grid-pattern opacity-20 z-0"></div>
      {/* Floating orbs and shapes (copied from HeroSection) */}
      <motion.div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#36b5d3]/10 blur-3xl z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-[#14788f]/10 blur-2xl z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      <motion.div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#36b5d3]/15 blur-xl z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      <motion.div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-[#14788f]/15 blur-lg z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
      <motion.div className="absolute top-20 left-20 w-3 h-3 bg-[#36b5d3]/40 rounded-full shadow-lg shadow-[#36b5d3]/20 z-0" animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-40 right-32 w-2 h-2 bg-[#14788f]/50 rounded-full shadow-lg shadow-[#14788f]/20 z-0" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      <motion.div className="absolute bottom-40 left-32 w-2.5 h-2.5 bg-[#36b5d3]/40 rounded-full shadow-lg shadow-[#36b5d3]/20 z-0" animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      <motion.div className="absolute bottom-20 right-20 w-2 h-2 bg-[#14788f]/45 rounded-full shadow-lg shadow-[#14788f]/20 z-0" animate={{ scale: [1, 1.3, 1], opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
      <motion.div className="absolute top-1/3 left-1/2 w-4 h-4 bg-[#36b5d3]/20 rounded-full shadow-lg shadow-[#36b5d3]/10 z-0" animate={{ y: [-5, 5, -5], rotate: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
      <motion.div className="absolute bottom-1/2 right-1/4 w-3 h-3 bg-[#14788f]/30 rounded-full shadow-lg shadow-[#14788f]/10 z-0" animate={{ y: [-3, 3, -3], rotate: [0, -180, -360] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} />
      <motion.div className="absolute top-10 right-10 w-6 h-6 bg-[#36b5d3]/30 rounded-full blur-sm shadow-2xl shadow-[#36b5d3]/30 z-0" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      {/* End home page hero background */}
      <Header />

      {/* Header Section */}
      <section className="py-16 px-6 relative overflow-hidden">
        {/* Floating dots styled like home page */}
        <motion.div className="absolute top-20 left-20 w-3 h-3 bg-cyan-400/30 rounded-full animate-ping" style={{animationDelay: '0s'}} />
        <motion.div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-400/40 rounded-full animate-ping" style={{animationDelay: '1s'}} />
        <motion.div className="absolute top-1/2 left-1/3 w-2 h-2 bg-cyan-300/30 rounded-full animate-ping" style={{animationDelay: '2s'}} />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div variants={itemVariants}>
            <div className="flex justify-center mb-6">
              <div className="bg-cyan-500/20 backdrop-blur-sm rounded-full p-4">
                <BarChart3 className="w-12 h-12 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              Placement Insights
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              Unlock data-driven insights into placement trends, roles, and salaries.
            </p>
            <motion.div className="flex justify-center gap-4 mt-8" variants={buttonVariants}>
              <Button
                variant="outline"
                className="border-cyan-400/30 hover:bg-cyan-500/20 rounded-full font-semibold"
                onClick={() => setActiveTab('2020-2024')}
              >
                2020–2024
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, value: '94.2%', label: 'Placement Rate', change: '+12.5%' },
            { icon: DollarSign, value: '₹6.8L', label: 'Average Package', change: '+8.9%' },
            { icon: Building2, value: '120+', label: 'Partner Companies', change: '+15.3%' }
          ].map(({ icon: Icon, value, label, change }, index) => (
            <motion.div
              key={label}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:shadow-xl transition-all"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-cyan-500/20 rounded-full p-3">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-green-400 text-sm font-semibold">{change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
              <p className="text-slate-300">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CGPA vs Placement Offers */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
              Does CGPA Matter?
            </h2>
            <div className="mx-auto w-16 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full mb-4"></div>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Correlation between academic performance and placement success.
            </p>
          </motion.div>
          <motion.div className={glassyChart} variants={cardVariants} whileHover="hover">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={cgpaData} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="cgpa" stroke="#A5F3FC" tick={{ fontWeight: 600 }} />
                <YAxis stroke="#A5F3FC" tick={{ fontWeight: 600 }} />
                <Tooltip content={(props: any) => <GlassyTooltip {...props} />} cursor={{ fill: "#06B6D4", fillOpacity: 0.08 }} />
                <Bar dataKey="offers" fill="url(#modernBarGradient)" radius={[16, 16, 8, 8]} isAnimationActive={true} animationDuration={1200} />
                <defs>
                  <linearGradient id="modernBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* Top Companies Hiring */}
      <section className="py-16 px-6 relative overflow-hidden">
        <motion.div className="absolute top-1/4 right-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
        <motion.div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-cyan-300/30 rounded-full animate-ping" style={{animationDelay: '1.5s'}} />
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
              Top Recruiting Partners
            </h2>
            <div className="mx-auto w-16 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full mb-4"></div>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">Leading companies hiring our graduates.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div className={glassyChart} variants={cardVariants} whileHover="hover">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-white">Hiring Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={companiesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="hires"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    isAnimationActive={true}
                    animationDuration={1200}
                  >
                    {companiesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: "drop-shadow(0 0 8px "+entry.color+"33)" }} />
                    ))}
                  </Pie>
                  <Tooltip content={(props: any) => <GlassyTooltip {...props} />} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-white">Company Rankings</h3>
              </div>
              {companiesData.map((company, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:shadow-xl transition-all"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${company.color}20` }}>
                        <span className="text-lg font-bold" style={{ color: company.color }}>#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-white">{company.name}</h4>
                        <p className="text-slate-400 text-sm">Technology Partner</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{company.hires}</div>
                      <div className="text-sm text-slate-400">Students Hired</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Roles */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
              In-Demand Job Roles
            </h2>
            <div className="mx-auto w-16 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full mb-4"></div>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">Most sought-after positions in the job market.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolesData.map((role, index) => (
              <motion.div
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 hover:shadow-xl transition-all hover:-translate-y-1"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${role.color}20` }}>
                    <BookOpen className="w-7 h-7" style={{ color: role.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white group-hover:text-cyan-400 transition-colors">{role.role}</h3>
                    <p className="text-slate-400 text-sm">High Demand</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{role.count}</div>
                <div className="text-slate-300 mb-4">Total Placements</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(role.count / 85) * 100}%`, backgroundColor: role.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Trends */}
      <section className="py-16 px-6 relative overflow-hidden">
        <motion.div className="absolute top-1/3 left-1/3 w-2 h-2 bg-cyan-400/30 rounded-full animate-ping" style={{animationDelay: '0.8s'}} />
        <motion.div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-blue-300/40 rounded-full animate-ping" style={{animationDelay: '2s'}} />
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
              Salary Growth Trajectory
            </h2>
            <div className="mx-auto w-16 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full mb-4"></div>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">Trends in compensation packages over the years.</p>
          </motion.div>
          <motion.div className={glassyChart} variants={cardVariants} whileHover="hover">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={packageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#A5F3FC" tick={{ fontWeight: 600 }} />
                <YAxis stroke="#A5F3FC" tick={{ fontWeight: 600 }} />
                <Tooltip content={(props: any) => <GlassyTooltip {...props} />} cursor={{ fill: "#6366f1", fillOpacity: 0.08 }} />
                <Area type="monotone" dataKey="highest" stackId="1" stroke="#4F46E5" fill="url(#modernArea1)" strokeWidth={3} dot={{ r: 6, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }} isAnimationActive={true} animationDuration={1200} />
                <Area type="monotone" dataKey="avg" stackId="2" stroke="#06B6D4" fill="url(#modernArea2)" strokeWidth={3} dot={{ r: 6, fill: "#06B6D4", stroke: "#fff", strokeWidth: 2 }} isAnimationActive={true} animationDuration={1200} />
                <defs>
                  <linearGradient id="modernArea1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="modernArea2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#0891B2" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-16 px-6 relative overflow-hidden">
        <motion.div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-ping" style={{animationDelay: '0s'}} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-ping" style={{animationDelay: '1.2s'}} />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Shape Your Future?</h2>
            <p className="text-xl text-indigo-100 mb-8">Use these insights to plan your career path.</p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={buttonVariants}>
              <Button className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full hover:bg-indigo-50">
                Check My Chances
              </Button>
              <Button
                variant="outline"
                className="border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-indigo-600"
              >
                Get Career Guidance
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </motion.div>
  );
}