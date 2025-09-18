import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const ResumeBuilder = () => {
  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#0f172a] text-foreground overflow-x-hidden">
      <Header />
      <section className="pt-24 pb-12 relative z-10 flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-gradient-primary">Resume Builder</h1>
            <p className="text-[#dee0e1]/80">Coming soon</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ResumeBuilder;


