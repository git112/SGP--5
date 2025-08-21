import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompanyCard } from "@/components/CompanyCard";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { companiesApi, Company, CompaniesResponse } from "@/services/companiesApi";

export default function CompanyDirectory() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [pkg, setPkg] = useState("All Packages");
  const [companiesData, setCompaniesData] = useState<CompaniesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies data on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await companiesApi.getCompanies(5); // Sheet #5
        setCompaniesData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch companies');
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter logic for real-time data
  const filtered = companiesData?.companies?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (location === "All Locations" || c.location === location) &&
    (pkg === "All Packages" || c.packageLPA.toString() === pkg)
  ) || [];

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
            
            {/* Refresh Button */}
            {companiesData && (
              <motion.button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const data = await companiesApi.refreshCache(5);
                    setCompaniesData(data);
                    setError(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to refresh data');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </motion.button>
            )}
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
              value={location}
              onChange={e => setLocation(e.target.value)}
            >
              <option>All Locations</option>
              {companiesData?.filters?.locations?.map(location => (
                <option key={location} value={location}>{location}</option>
              )) || []}
            </select>
            <select
              className="w-full max-w-xs px-4 py-3 bg-white/10 border border-cyan-400/30 rounded-xl text-foreground focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 shadow-md transition-all duration-300 backdrop-blur-md focus:shadow-cyan-400/20 custom-select"
              value={pkg}
              onChange={e => setPkg(e.target.value)}
            >
              <option>All Packages</option>
              {companiesData?.filters.packages.map(pkg => (
                <option key={pkg} value={pkg.toString()}>{pkg} LPA</option>
              ))}
            </select>
          </motion.div>
          {/* Loading State */}
          {loading && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4"></div>
              <p className="text-cyan-300">Loading companies...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-red-400 mb-4">⚠️ Error loading companies</div>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors"
              >
                Retry
              </button>
            </motion.div>
          )}

          {/* Companies Grid */}
          {!loading && !error && (
            <>
              {/* Data Info */}
              {companiesData && (
                <motion.div
                  className="text-center mb-6 text-sm text-cyan-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  
                </motion.div>
              )}

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
                    <CompanyCard 
                      icon={<span role="img" aria-label={c.name}>{c.icon}</span>}
                      name={c.name}
                      domain={c.domain}
                      status={c.status}
                      packageLPA={c.packageLPA}
                      packageDisplay={c.packageDisplay}
                      roles={c.roles}
                      eligibility={c.eligibility}
                    />
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center text-muted py-12">
                    {search || location !== "All Locations" || pkg !== "All Packages" 
                      ? "No companies match your filters." 
                      : "No companies found in the data."}
                  </div>
                )}
              </motion.div>
            </>
          )}
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