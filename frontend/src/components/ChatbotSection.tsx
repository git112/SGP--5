export const ChatbotSection = () => {
  return (
    <section className="py-20 relative bg-background">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto slide-up">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl bg-primary/10 border border-primary/20 mb-8 transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-primary-foreground" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Meet PlaceMentor AI
          </h2>
          
          <p className="text-xl muted leading-relaxed">
            Your intelligent placement assistant powered by advanced AI. Get instant answers, 
            personalized recommendations, and strategic guidance for your career journey.
          </p>
        </div>
      </div>
    </section>
  );
};