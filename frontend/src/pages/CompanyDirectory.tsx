import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompanyCard } from "@/components/CompanyCard";
import { useState } from "react";
import { motion } from "framer-motion";

const companies = [
  {
    icon: <span role="img" aria-label="Google">🔍</span>,
    name: "Google",
    domain: "Technology",
    status: "Upcoming",
    packageLPA: 45,
    roles: ["SDE", "Product Manager", "Data Scientist"],
    eligibility: "CGPA: 8+",
  },
  {
    icon: <span role="img" aria-label="Microsoft">💻</span>,
    name: "Microsoft",
    domain: "Technology",
    status: "Open",
    packageLPA: 42,
    roles: ["SDE", "Program Manager"],
    eligibility: "CGPA: 7.5+",
  },
  {
    icon: <span role="img" aria-label="Amazon">📦</span>,
    name: "Amazon",
    domain: "E-commerce",
    status: "Open",
    packageLPA: 38,
    roles: ["SDE", "Support Engineer"],
    eligibility: "CGPA: 7+",
  },
  {
    icon: <span role="img" aria-label="Apple">🍎</span>,
    name: "Apple",
    domain: "Technology",
    status: "Upcoming",
    packageLPA: 50,
    roles: ["iOS Developer", "UI/UX Designer"],
    eligibility: "CGPA: 8.5+",
  },
  {
    icon: <span role="img" aria-label="Netflix">🎬</span>,
    name: "Netflix",
    domain: "Entertainment",
    status: "Open",
    packageLPA: 55,
    roles: ["Backend Engineer", "ML Engineer"],
    eligibility: "CGPA: 8+",
  },
  {
    icon: <span role="img" aria-label="Meta">📱</span>,
    name: "Meta",
    domain: "Social Media",
    status: "Open",
    packageLPA: 48,
    roles: ["Frontend Engineer", "Data Analyst"],
    eligibility: "CGPA: 7.8+",
  },
];

export default function CompanyDirectory() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All Domains");
  const [pkg, setPkg] = useState("All Packages");

  // Filter logic (simple for mockup)
  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (domain === "All Domains" || c.domain === domain) &&
    (pkg === "All Packages" || c.packageLPA.toString() === pkg)
  );

  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#0f172a] text-foreground overflow-x-hidden">
      <Header />
      {/* Homepage-style animated background overlays */}
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
      <section className="pt-24 pb-12 relative z-10 flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-gradient-primary">Company Directory</h1>
            <p className="text-lg text-[#dee0e1]/80 max-w-2xl mx-auto font-light">Explore companies, packages, and placement opportunities</p>
          </div>
          <motion.div
            className="bg-gradient-to-br from-[#232b47]/80 via-[#1a1f3a]/80 to-[#38bdf8]/10 border border-cyan-400/30 shadow-xl rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4 mb-12 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xl text-cyan-400 drop-shadow-glow"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <input
                type="text"
                placeholder="Search companies..."
                className="w-full max-w-xs px-4 py-3 bg-white/10 border border-cyan-400/30 rounded-xl text-foreground placeholder-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 shadow-md transition-all duration-300 backdrop-blur-md focus:shadow-cyan-400/20"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="w-full max-w-xs px-4 py-3 bg-white/10 border border-cyan-400/30 rounded-xl text-foreground focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 shadow-md transition-all duration-300 backdrop-blur-md focus:shadow-cyan-400/20 custom-select"
              value={domain}
              onChange={e => setDomain(e.target.value)}
            >
              <option>All Domains</option>
              <option>Technology</option>
              <option>E-commerce</option>
              <option>Entertainment</option>
              <option>Social Media</option>
            </select>
            <select
              className="w-full max-w-xs px-4 py-3 bg-white/10 border border-cyan-400/30 rounded-xl text-foreground focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 shadow-md transition-all duration-300 backdrop-blur-md focus:shadow-cyan-400/20 custom-select"
              value={pkg}
              onChange={e => setPkg(e.target.value)}
            >
              <option>All Packages</option>
              <option>55</option>
              <option>50</option>
              <option>48</option>
              <option>45</option>
              <option>42</option>
              <option>38</option>
            </select>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
            {filtered.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.18 }}
                className="h-full"
              >
                <CompanyCard {...c} status={c.status as 'Open' | 'Upcoming'} />
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted py-12">No companies found.</div>
            )}
          </motion.div>
        </div>
      </section>
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