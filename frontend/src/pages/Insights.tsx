import React, { useState, useEffect, useMemo } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Building2, TrendingUp, DollarSign, BookOpen, Target, BarChart3, RefreshCw, Quote
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { insightsApi, InsightsData, SheetsMetadata, RoleData } from '../services/insightsApi';

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

// No mock/fallback: we will use only Google Sheets API via insightsApi

const FloatingDot = ({ className, delay }: { className: string; delay: number }) => (
  <motion.div
    className={`absolute rounded-full ${className}`}
    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

// Glassy chart container utility
const glassyChart = "glass shadow-2xl border border-white/10 p-4 md:p-8 rounded-3xl relative overflow-hidden";

// Custom glassy tooltip
const GlassyTooltip = (props: any) => {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-400/20 shadow-xl rounded-xl px-4 py-3 text-cyan-200 text-sm font-medium animate-fade-in">
      <div className="mb-1 font-semibold text-cyan-300">{label}</div>
      {payload.map((entry: any, i: number) => (
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
  const [selectedYear, setSelectedYear] = useState('2024');
  const queryClient = useQueryClient();

  // Fetch insights data with React Query
  const { data: insightsData, isLoading, error, refetch } = useQuery({
    queryKey: ['insights'],
    queryFn: insightsApi.getInsights,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
  });

  // Fetch sheets metadata
  const { data: metadata } = useQuery({
    queryKey: ['sheets-metadata'],
    queryFn: insightsApi.getSheetsMetadata,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debug logging
  console.log('Insights API instance:', insightsApi);
  console.log('Insights Data:', insightsData);
  console.log('Error:', error);
  console.log('Loading:', isLoading);

  const data = insightsData as InsightsData | undefined;

  // Build dynamic year list from roles data
  const availableYears = useMemo(() => {
    const years = (data?.roles_data || []).map(r => r.year).filter(Boolean);
    const unique = Array.from(new Set(years));
    return unique.sort((a, b) => parseInt(a) - parseInt(b));
  }, [data?.roles_data]);

  // Initialize active tab to last available year when data arrives
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(activeTab)) {
      setActiveTab(availableYears[availableYears.length - 1]);
    }
  }, [availableYears]);

  // Initialize selected year for companies section
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears]);

  const getRolesDataForYear = (year: string) => {
    return (data?.roles_data || []).filter(r => r.year === year);
  };

  const getTopRolesForYear = (year: string) => {
    return [...getRolesDataForYear(year)].sort((a, b) => b.count - a.count);
  };

  const rolesByYear = useMemo(() => {
    const grouped: Record<string, RoleData[]> = {};
    (data?.roles_data || []).forEach((r) => {
      if (!grouped[r.year]) grouped[r.year] = [];
      grouped[r.year].push(r);
    });
    return grouped;
  }, [data?.roles_data]);

  const rolesForYear = useMemo(() => getTopRolesForYear(activeTab), [activeTab, data?.roles_data]);
  const maxRoleCount = useMemo(() => (rolesForYear.length ? Math.max(...rolesForYear.map(r => r.count)) : 1), [rolesForYear]);
  const top5Roles = useMemo(() => rolesForYear.slice(0, 5), [rolesForYear]);

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await insightsApi.refreshSheetsData();
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      queryClient.invalidateQueries({ queryKey: ['sheets-metadata'] });
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#1a1f3a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading insights data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#1a1f3a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-cyan-400 text-lg">No insights data available.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative min-h-screen text-foreground fade-in overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background */}
      {/* --- NEW Proper & Balanced Background --- */}

{/* 1. Base Gradient: A sophisticated, evenly distributed dark blue and slate gradient */}
<div 
  className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] z-0" 
/>

{/* 2. Ambient Glow: A soft, centered radial gradient to gently lift the middle */}
<div 
  className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.1),_transparent_70%)] z-0" 
/>

{/* 3. Subtle Grid Pattern: A clean, uniform texture */}
<div 
  className="absolute inset-0 grid-pattern-balanced opacity-10 z-0" 
/>

{/* 4. Floating Orbs: For gentle, ambient motion (optional, but recommended for a dynamic feel) */}
<motion.div 
  className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"
  animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
/>
<motion.div 
  className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"
  animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
/>

{/* Add this <style> tag to your component or a global CSS file */}
<style dangerouslySetInnerHTML={{ __html: `
  .grid-pattern-balanced {
    background-image: linear-gradient(rgba(100, 116, 139, 0.4) 1px, transparent 1px), 
                      linear-gradient(90deg, rgba(100, 116, 139, 0.4) 1px, transparent 1px);
    background-size: 3rem 3rem;
  }
`}} />
      
      {/* Floating orbs */}
      <motion.div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#36b5d3]/10 blur-3xl z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-[#14788f]/10 blur-2xl z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      <motion.div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#36b5d3]/15 blur-xl z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      <motion.div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-[#14788f]/15 blur-lg z-0" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 3 }} />

      <Header />

      {/* Hero Section */}
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
  
  {/* --- NEW Brighter & More Dynamic Background --- */}

  {/* 1. Lighter, More Vibrant Gradient */}
  <motion.div 
    className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#334155] z-0"
  />
  
  {/* 2. Subtle Grid Texture (unchanged) */}
  <div className="absolute inset-0 bg-grid-slate-700/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,#000)] opacity-20 z-0"></div>

  {/* 3. Floating Orbs for soft color (unchanged) */}
  <motion.div 
    className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
    animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  />
  <motion.div 
    className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"
    animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
  />

  {/* 4. MORE Blinking Stars for a lively effect */}
  <motion.div 
      className="absolute top-[15%] left-[10%] w-[2px] h-[2px] bg-white rounded-full"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
  />
  <motion.div 
      className="absolute top-[30%] right-[15%] w-1 h-1 bg-cyan-200 rounded-full"
      animate={{ opacity: [0, 0.8, 0], scale: [1, 1.3, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
  />
  <motion.div 
      className="absolute bottom-[20%] left-[20%] w-[3px] h-[3px] bg-white rounded-full"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
  />
  <motion.div 
      className="absolute top-[55%] left-[40%] w-1 h-1 bg-slate-400 rounded-full"
      animate={{ opacity: [0, 0.7, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
  />
  <motion.div 
      className="absolute top-[40%] left-[70%] w-[2px] h-[2px] bg-cyan-300 rounded-full"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.9 }}
  />
  <motion.div 
      className="absolute bottom-[40%] right-[30%] w-1.5 h-1.5 bg-white rounded-full"
      animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 2.3 }}
  />
    <motion.div 
      className="absolute top-[80%] left-[50%] w-[2px] h-[2px] bg-slate-300 rounded-full"
      animate={{ opacity: [0, 0.9, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 2.8 }}
  />
  <motion.div 
      className="absolute bottom-[5%] right-[55%] w-1 h-1 bg-cyan-400 rounded-full"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 3.1 }}
  />
  
  {/* --- Background End --- */}


  {/* Main Content (Your original content sits on top) */}
  <motion.div
    className="relative z-10 text-center max-w-4xl mx-auto px-6"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    <div className="space-y-8">
      
      {/* "Hook" Badge */}
      <motion.div 
        className="inline-block px-6 py-3 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
        variants={itemVariants}
      >
        <span className="text-sm text-cyan-400 font-semibold tracking-wide">
          Welcome to Your Insights Dashboard
        </span>
      </motion.div>
      
      {/* Main Headline */}
      <motion.div 
        className="space-y-4"
        variants={itemVariants}
      >
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
          <span className="block bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
            Placement Clarity,
          </span>
          <span className="block text-white mt-2">
            Delivered.
          </span>
        </h1>
      </motion.div>
      
      {/* Subtitle */}
      <motion.p 
        className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
        variants={itemVariants}
      >
        Explore data-driven trends, company details, and salary insights to chart your path to success.
      </motion.p>
      
    </div>
  </motion.div>
</section>

      {/* Stats Overview */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.stats_overview?.map((stat, index) => (
            <motion.div
              key={stat.metric}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:shadow-xl transition-all"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-cyan-500/20 rounded-full p-3">
                  {index === 0 && <TrendingUp className="w-6 h-6 text-cyan-400" />}
                  {index === 1 && <DollarSign className="w-6 h-6 text-cyan-400" />}
                  {index === 2 && <Building2 className="w-6 h-6 text-cyan-400" />}
                </div>
                <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-slate-300">{stat.metric}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CGPA vs Placement Offers */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={itemVariants}>
  
  {/* Updated h2 with a white-to-blue gradient */}
  <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
    Does CGPA Matter?
  </h2>
  
  {/* Updated underline to match the new gradient */}
  <div className="mx-auto w-16 h-1 bg-gradient-to-r from-slate-100 to-blue-400 rounded-full mb-4"></div>
  
  {/* Unchanged subtitle */}
  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
    Correlation between academic performance and placement success.
  </p>
  
</motion.div>
          <motion.div className={glassyChart} variants={cardVariants} whileHover="hover">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.cgpa_data} barCategoryGap={24}>
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

      {/* Top Hiring Companies - Updated with Year-wise Buttons */}
       {/* Top Companies Hiring */}
          <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
              Top Hiring Companies
            </h2>
            <div className="mx-auto w-16 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full mb-4"></div>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Companies with the highest student placement rates.
            </p>
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
                    data={data.companies_data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    dataKey="hires"
                    label={({ name, percent }: any) => 
                      percent > 0.05 ? `${name}\n${(percent * 100).toFixed(1)}%` : ''
                    }
                    labelLine={false}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationBegin={300}
                  >
                    {data.companies_data?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ 
                          filter: `drop-shadow(0 0 12px ${entry.color}40)`,
                          stroke: "#7e9a61ff",
                          strokeWidth: 0.30
                        }} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const companyData = payload[0].payload;
                        const totalHires = data.companies_data?.reduce((sum: number, company: any) => sum + company.hires, 0) || 0;
                        const percentage = totalHires > 0 ? ((companyData.hires / totalHires) * 100).toFixed(1) : '0.0';
                        return (
                          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 shadow-lg">
                            <p className="text-white font-medium">{companyData.name}</p>
                            <p className="text-cyan-400 text-sm">{percentage}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
            
            {/* Top 10 Company Rankings - Side Panel */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-white">Top 10 Companies</h3>
              </div>
              {data.companies_data?.map((company, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:shadow-xl transition-all hover:scale-105"
                  variants={cardVariants}
                  whileHover="hover"
                  style={{
                    background: `linear-gradient(135deg, ${company.color}10 0%, rgba(30, 41, 59, 0.5) 100%)`,
                    borderColor: `${company.color}30`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, ${company.color} 0%, ${company.color}80 100%)`,
                        boxShadow: `0 4px 16px ${company.color}40`
                      }}
                    >
                      <span className="text-sm font-bold text-white relative z-10">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm">{company.name}</h4>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: company.color }}
                        />
                        <p className="text-slate-400 text-xs">Technology Partner</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Roles */}
      <section className="py-16 px-6 relative overflow-hidden">
        {/* Floating background elements */}
        <motion.div className="absolute top-1/4 right-1/4 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0s'}} />
        <motion.div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}} />
        <motion.div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-400/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '2s'}} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-12" variants={itemVariants}>
  
  {/* Updated h2 with the white-to-blue gradient */}
  <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
    In-Demand Job Roles
  </h2>
  
  {/* Updated underline to match the new gradient */}
  <div className="mx-auto w-16 h-1 bg-gradient-to-r from-slate-100 to-blue-400 rounded-full mb-4"></div>
  
  {/* Unchanged subtitle */}
  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
    Most sought-after positions in the job market.
  </p>
  
</motion.div>
          
          {/* Year Filter Tabs */}
          <motion.div className="flex flex-wrap justify-center gap-3 mb-8" variants={itemVariants}>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setActiveTab(year)}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === year
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30 hover:scale-105'
                }`}
              >
                {year}
              </button>
            ))}
          </motion.div>

          {/* Roles Cards Grid (Popular Roles) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {top5Roles.map((role, index) => (
              <motion.div
                key={`${role.role}-${index}`}
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
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-cyan-400 mb-2">{role.role}</div>
                  <div className="text-slate-300 text-sm">Top Role</div>
                </div>
                <div
                  className="h-3 rounded-full transition-all duration-1000 bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${(role.count / maxRoleCount) * 100}%` }}
                />
              </motion.div>
            ))}
          </div>

          {/* Year Summary Stats */}
          <motion.div className="mt-12" variants={itemVariants}>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 chart-hover">
              <div className="text-center mb-6">
                <h3 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
  Yearly Placement Overview
</h3>
                <p className="text-slate-400 text-sm">Total placements and top roles by year</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                {availableYears.map((year) => {
                  const roles = rolesByYear[year] || [];
                  const totalPlacements = roles.reduce((sum, role) => sum + role.count, 0);
                  const topRole = [...roles].sort((a, b) => b.count - a.count)[0];
                  return (
                    <div key={year} className="space-y-2 p-3 rounded-xl bg-slate-800/20 hover:bg-slate-700/30 transition-colors">
                      <div className="text-lg font-bold text-white">{year}</div>
                      <div className="text-2xl font-bold text-cyan-400">{totalPlacements}</div>
                      <div className="text-xs text-slate-400">Total</div>
                      {topRole && (
                        <div className="text-xs text-slate-300">
                          Top: {topRole.role.length > 15 ? topRole.role.substring(0, 15) + '...' : topRole.role}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Package Trends */}
      <section className="py-16 px-6 relative overflow-hidden">
        <motion.div className="absolute top-1/3 left-1/3 w-2 h-2 bg-cyan-400/30 rounded-full animate-ping" style={{animationDelay: '0.8s'}} />
        <motion.div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-blue-300/40 rounded-full animate-ping" style={{animationDelay: '2s'}} />
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={itemVariants}>
  
  {/* Updated h2 with the white-to-blue gradient */}
  <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
    Salary Growth Trajectory
  </h2>
  
  {/* Updated underline to match the new gradient */}
  <div className="mx-auto w-16 h-1 bg-gradient-to-r from-slate-100 to-blue-400 rounded-full mb-4"></div>
  
  {/* Unchanged subtitle */}
  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
    Trends in compensation packages over the years.
  </p>
  
</motion.div>
          <motion.div className={glassyChart} variants={cardVariants} whileHover="hover">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data.package_data}>
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
      <Footer />
    </motion.div>
  );
}
