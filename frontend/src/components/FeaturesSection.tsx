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
    <section className="py-20 relative bg-background overflow-hidden geometric-bg">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-secondary/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-success/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-warning/25 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Key Features
          </h2>
          <p className="text-base muted max-w-2xl mx-auto font-light">
            Fun + Formal Tone - Everything you need to succeed in your placement journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="group slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="card h-full group-hover:bg-primary/5 transition-all duration-500 backdrop-blur-sm">
                <div className="flex flex-col h-full">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 text-3xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm muted leading-relaxed mb-3 font-light">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border/20">
                    <p className="text-xs text-primary font-medium italic tracking-wide">
                      "{feature.tagline}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA Banner */}
        <div className="mt-20 text-center slide-up">
          <div className="card max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
              Ready to plan your placement journey the smart way?
            </h3>
            <p className="text-base muted mb-6 font-light">
              Let's make data your biggest strength. Try PlaceMentor AI today.
            </p>
            <Button className="btn-primary font-semibold">
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};