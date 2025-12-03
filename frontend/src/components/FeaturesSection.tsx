import { Button } from "@/components/ui/button";

const features = [
  {
    icon: "📊",
    title: "Know Where You Stand",
    description: "Upload your profile and let our ML model show you how close you are to landing your dream job.",
    tagline: "From uncertainty to clarity—AI makes it easier."
  },
  {
    icon: "🛠",
    title: "Get Skill-Savvy",
    description: "Wondering what skills companies are actually hiring for? We extract and recommend the real deal—no fluff.",
    tagline: "No guesswork. Just smart work."
  },
  {
    icon: "💬",
    title: "Interview Decoder",
    description: "Search and explore interview questions asked by top companies—shared by your own seniors.",
    tagline: "Plan better. Apply smarter. Prepare deeper."
  },
  {
    icon: "🏢",
    title: "Find Your Fit",
    description: "Filter companies by location, role, or tech stack. Because your goals aren't one-size-fits-all.",
    tagline: "Data doesn't lie. Let's use it well."
  },
  {
    icon: "🎓",
    title: "Seniors Speak",
    description: "Real stories. Real strategies. Learn exactly what worked from students who've been there, done that.",
    tagline: "Help juniors get where you are."
  },
  {
    icon: "📈",
    title: "Track the Trends",
    description: "See who's hiring who. When. Why. How much. Visualize your future, backed by real placement data.",
    tagline: "Share your interview experience & tips—it takes 2 minutes, but means everything to them."
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 sm:py-20 relative bg-slate-900 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-cyan-300/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-blue-300/40 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16 slide-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Key Features
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-light">
            Fun + Formal Tone - Everything you need to succeed in your placement journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="group slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="relative h-full p-4 sm:p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-cyan-500/20 group-hover:bg-slate-800/80">
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
                <div className="absolute inset-[1px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl -z-10"></div>

                <div className="flex flex-col h-full">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 text-3xl group-hover:scale-110 transition-transform duration-300 filter group-hover:drop-shadow-lg">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed mb-3 font-light">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 relative">
                    {/* Glowing badge effect */}
                    <div className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-cyan-400/30">
                      <p className="text-xs text-cyan-400 font-medium italic tracking-wide">
                        "{feature.tagline}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};