import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, duration: 0.8 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7 } },
};

const Predict = () => {
  const [formData, setFormData] = useState({
    tenthPercentage: '',
    twelfthPercentage: '',
    cgpa: '',
    graduationYear: '',
    techSkills: '',
    preferredDomain: '',
    certifications: '',
    internships: '',
    softSkills: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetResults = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPrediction({
        readiness: '65-80%',
        topCompanies: ['TCS', 'Infosys', 'Wipro'],
        skillsToImprove: ['Data Structures', 'System Design', 'Communication']
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleImprovementPlan = () => {
    // Navigate to improvement plan or open modal
    console.log('Navigate to improvement plan');
  };

  const handlePracticeInterview = () => {
    // Navigate to interview practice page
    window.location.href = '/interview';
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#0f172a] text-foreground overflow-x-hidden">
      <Header />
      
      {/* Animated Background */}
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
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-[#14788f]/45 rounded-full animate-ping shadow-lg shadow-[#14788f]/20" style={{ animationDelay: '3s' }}></div>
      </div>

      <section className="pt-24 pb-12 relative z-10 flex-1">
        <motion.div 
          className="container mx-auto px-4 max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="text-center mb-12" variants={cardVariants}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg inline-block">
              Placement Prediction & Career Fit
            </h1>
            <p className="text-lg text-[#dee0e1]/80 max-w-2xl mx-auto font-light">
              Get personalized placement insights and career guidance based on your profile
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" variants={cardVariants}>
            {/* Academic Details */}
            <Card className="card glass shadow-xl backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle className="text-gradient-primary">Academic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tenthPercentage">10th Percentage</Label>
                  <Input
                    id="tenthPercentage"
                    type="number"
                    placeholder="Enter 10th percentage"
                    value={formData.tenthPercentage}
                    onChange={(e) => handleInputChange('tenthPercentage', e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div>
                  <Label htmlFor="twelfthPercentage">12th/Diploma Percentage</Label>
                  <Input
                    id="twelfthPercentage"
                    type="number"
                    placeholder="Enter 12th/Diploma percentage"
                    value={formData.twelfthPercentage}
                    onChange={(e) => handleInputChange('twelfthPercentage', e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div>
                  <Label htmlFor="cgpa">CGPA</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    placeholder="Enter CGPA"
                    value={formData.cgpa}
                    onChange={(e) => handleInputChange('cgpa', e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Year of Graduation</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    placeholder="Enter graduation year"
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                    className="input-modern"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills & Experience */}
            <Card className="card glass shadow-xl backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle className="text-gradient-primary">Skills & Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="techSkills">Technical Skills</Label>
                  <Input
                    id="techSkills"
                    placeholder="e.g., Java, Python, React"
                    value={formData.techSkills}
                    onChange={(e) => handleInputChange('techSkills', e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div>
                  <Label htmlFor="preferredDomain">Preferred Domain</Label>
                  <Select value={formData.preferredDomain} onValueChange={(value) => handleInputChange('preferredDomain', value)}>
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="cloud-computing">Cloud Computing</SelectItem>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input
                    id="certifications"
                    placeholder="e.g., AWS, Azure, Google Cloud"
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div>
                  <Label htmlFor="internships">Internships</Label>
                  <Input
                    id="internships"
                    placeholder="Number of internships"
                    value={formData.internships}
                    onChange={(e) => handleInputChange('internships', e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div>
                  <Label htmlFor="softSkills">Soft Skills</Label>
                  <Input
                    id="softSkills"
                    placeholder="e.g., Leadership, Communication"
                    value={formData.softSkills}
                    onChange={(e) => handleInputChange('softSkills', e.target.value)}
                    className="input-modern"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Get Results Button */}
          <motion.div className="text-center mb-8" variants={cardVariants}>
            <Button 
              onClick={handleGetResults}
              disabled={isLoading}
              className="btn-primary text-lg px-8 py-4"
            >
              {isLoading ? 'Analyzing...' : 'Get Results'}
            </Button>
          </motion.div>

          {/* Results Section */}
          {prediction && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Placement Readiness */}
              <Card className="card glass shadow-xl backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-gradient-primary text-center">Placement Readiness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">{prediction.readiness}</div>
                    <p className="text-[#dee0e1]/80">Based on your profile analysis</p>
                  </div>
                </CardContent>
              </Card>

              {/* Top Companies and Skills */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                {/* Curved connecting lines */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
                <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-cyan-400/30 to-transparent"></div>
                
                <Card className="card glass shadow-xl backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-gradient-primary">Top 3 Companies</CardTitle>
                    <p className="text-[#dee0e1]/80">matching your profile</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prediction.topCompanies.map((company, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <Badge variant="secondary" className="text-sm">#{index + 1}</Badge>
                          <span className="font-medium text-foreground">{company}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card glass shadow-xl backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-gradient-primary">Top 3 Skills</CardTitle>
                    <p className="text-[#dee0e1]/80">to improve</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prediction.skillsToImprove.map((skill, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <Badge variant="outline" className="text-sm">#{index + 1}</Badge>
                          <span className="font-medium text-foreground">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Curved line connecting to Improvement Plan */}
              <div className="relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-cyan-400/30 to-transparent"></div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleImprovementPlan}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Improvement Plan
                </Button>
                <Button 
                  onClick={handlePracticeInterview}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Practice Interview
                </Button>
              </div>

              {/* Question Section */}
              <div className="text-center">
                <div className="relative">
                  {/* Curved connecting line from above */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-cyan-400/50 to-transparent"></div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                </div>
                <Card className="card glass shadow-xl backdrop-blur-md border border-white/10 mt-8 max-w-md mx-auto">
                  <CardContent className="p-6">
                    <Button 
                      onClick={() => console.log('Generate Question')}
                      className="btn-primary w-full text-lg py-4"
                    >
                      Question
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Improvement Plan Details */}
              <Card className="card glass shadow-xl backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-gradient-primary">Roadmaps & Improvement Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <h4 className="font-semibold text-cyan-400 mb-2">Data Structures & Algorithms</h4>
                      <p className="text-[#dee0e1]/80">Focus on mastering core DSA concepts, practice on platforms like LeetCode and HackerRank</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <h4 className="font-semibold text-cyan-400 mb-2">System Design</h4>
                      <p className="text-[#dee0e1]/80">Learn scalable architecture patterns, study real-world system designs</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <h4 className="font-semibold text-cyan-400 mb-2">Communication Skills</h4>
                      <p className="text-[#dee0e1]/80">Practice mock interviews, join public speaking clubs, work on clarity and confidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Predict;