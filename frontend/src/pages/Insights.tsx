import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Insights = () => {
  return (
    <div className="min-h-screen bg-background text-foreground fade-in">
      <Header />
      
      {/* 1. Page Header Section */}
      <section className="py-16 relative bg-background geometric-bg">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center slide-up">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Placement Insights Dashboard
            </h1>
            <p className="text-lg muted max-w-3xl mx-auto font-light mb-8">
              Dive into 5 years of IT placement data to understand trends, roles, and packages.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="border-border hover:bg-card rounded-2xl font-medium">
                2020–2024
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CGPA vs Placement Offers */}
      <section className="py-16 relative bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 slide-up">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Does CGPA Matter?
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                A visual correlation between academic performance and placement chances.
              </p>
            </div>
            <div className="card backdrop-blur-sm">
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: CGPA vs Placement Offers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Top Companies Hiring */}
      <section className="py-16 relative bg-background geometric-bg">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 slide-up">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Top Hiring Companies
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                The most consistent recruiters from the IT department.
              </p>
            </div>
            <div className="card backdrop-blur-sm">
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: Top Companies Hiring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Role-Wise Placement Distribution */}
      <section className="py-16 relative bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 slide-up">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Popular Roles Offered
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                Breakdown of job titles offered across placements.
              </p>
            </div>
            <div className="card backdrop-blur-sm">
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: Role-Wise Placement Distribution</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Package Distribution */}
      <section className="py-16 relative bg-background geometric-bg">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 slide-up">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Package Trends
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                Average, highest, and most common package ranges across years.
              </p>
            </div>
            <div className="card backdrop-blur-sm">
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: Package Distribution</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Year-on-Year Placement Summary */}
      <section className="py-16 relative bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 slide-up">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Placement Trends Over the Years
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                Total offers, highest package, and company participation by year.
              </p>
            </div>
            <div className="card backdrop-blur-sm">
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: Year-on-Year Placement Summary</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call-to-Action */}
      <section className="py-16 relative bg-background geometric-bg">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center slide-up">
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 backdrop-blur-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Want to see how you compare?
              </h2>
              <p className="text-base muted mb-8 font-light">
                Try our Placement Predictor to analyze your chances instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-primary font-semibold">
                  Try Placement Predictor
                </Button>
                <Button variant="outline" className="border-border hover:bg-card rounded-2xl font-semibold">
                  Contribute My Experience
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Insights; 