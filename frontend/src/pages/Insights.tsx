import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Insights = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
    hover: {
      y: -5,
      scale: 1.02,
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
    hover: {
      scale: 1.05,
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <motion.div 
      className="min-h-screen bg-background text-foreground"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Header />
      
      {/* 1. Page Header Section */}
      <section className="py-16 relative bg-background geometric-bg">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        
        {/* Floating background elements */}
        <motion.div 
          className="absolute top-20 left-20 w-2 h-2 bg-primary/30 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-secondary/40 rounded-full"
          animate={{ 
            scale: [1, 1.8, 1],
            opacity: [0.4, 0.9, 0.4]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/3 w-1 h-1 bg-primary/25 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.7, 0.25]
          }}
          transition={{ 
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Placement Insights Dashboard
            </motion.h1>
            <motion.p 
              className="text-lg muted max-w-3xl mx-auto font-light mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Dive into 5 years of IT placement data to understand trends, roles, and packages.
            </motion.p>
            <motion.div 
              className="flex justify-center gap-4"
              variants={buttonVariants}
            >
              <motion.div
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="outline" className="border-border hover:bg-card rounded-2xl font-medium">
                  2020–2024
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. CGPA vs Placement Offers */}
      <section className="py-16 relative bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              variants={itemVariants}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Does CGPA Matter?
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                A visual correlation between academic performance and placement chances.
              </p>
            </motion.div>
            <motion.div 
              className="card backdrop-blur-sm"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: CGPA vs Placement Offers</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Top Companies Hiring */}
      <section className="py-16 relative bg-background geometric-bg">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        
        {/* Additional floating elements */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-secondary/30 rounded-full"
          animate={{ 
            scale: [1, 1.6, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            duration: 2.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-primary/35 rounded-full"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.35, 0.85, 0.35]
          }}
          transition={{ 
            duration: 2.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        ></motion.div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              variants={itemVariants}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Top Hiring Companies
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                The most consistent recruiters from the IT department.
              </p>
            </motion.div>
            <motion.div 
              className="card backdrop-blur-sm"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: Top Companies Hiring</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Role-Wise Placement Distribution */}
      <section className="py-16 relative bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              variants={itemVariants}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Popular Roles Offered
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                Breakdown of job titles offered across placements.
              </p>
            </motion.div>
            <motion.div 
              className="card backdrop-blur-sm"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: Role-Wise Placement Distribution</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Package Distribution */}
      <section className="py-16 relative bg-background geometric-bg">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        
        {/* Floating elements */}
        <motion.div 
          className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-primary/25 rounded-full"
          animate={{ 
            scale: [1, 1.7, 1],
            opacity: [0.25, 0.75, 0.25]
          }}
          transition={{ 
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-secondary/30 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              variants={itemVariants}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Package Trends
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                Average, highest, and most common package ranges across years.
              </p>
            </motion.div>
            <motion.div 
              className="card backdrop-blur-sm"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: Package Distribution</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Year-on-Year Placement Summary */}
      <section className="py-16 relative bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              variants={itemVariants}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                Placement Trends Over the Years
              </h2>
              <p className="text-base muted max-w-2xl mx-auto font-light">
                Total offers, highest package, and company participation by year.
              </p>
            </motion.div>
            <motion.div 
              className="card backdrop-blur-sm"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted font-light">Chart: Year-on-Year Placement Summary</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Call-to-Action */}
      <section className="py-16 relative bg-background geometric-bg">
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        
        {/* Enhanced floating elements for CTA */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full"
          animate={{ 
            scale: [1, 1.8, 1],
            opacity: [0.2, 0.7, 0.2]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-secondary/25 rounded-full"
          animate={{ 
            scale: [1, 1.6, 1],
            opacity: [0.25, 0.8, 0.25]
          }}
          transition={{ 
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 right-1/3 w-1 h-1 bg-primary/30 rounded-full"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.75, 0.3]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        ></motion.div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={itemVariants}
          >
            <motion.div 
              className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 backdrop-blur-sm"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Want to see how you compare?
              </motion.h2>
              <motion.p 
                className="text-base muted mb-8 font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Try our Placement Predictor to analyze your chances instantly.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={buttonVariants}
              >
                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button className="btn-primary font-semibold">
                    Try Placement Predictor
                  </Button>
                </motion.div>
                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button variant="outline" className="border-border hover:bg-card rounded-2xl font-semibold">
                    Contribute My Experience
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </motion.div>
  );
};

export default Insights; 