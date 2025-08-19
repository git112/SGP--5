import React from 'react';
import { motion } from 'framer-motion';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const AboutDepartment = () => {
    return (
        <motion.div
            className="max-w-5xl mx-auto mb-12 p-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e2a4a]/80 via-[#2d3561]/70 to-[#1a1f3a]/90 backdrop-blur-xl border border-white/20 shadow-xl"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.01, boxShadow: '0 15px 30px 0 rgba(54,181,211,0.15)' }}
        >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400"></div>
            
            <motion.h2
                className="text-2xl md:text-3xl font-black mb-6 bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg text-center leading-tight"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                About KDPIT Department, CHARUSAT
            </motion.h2>
            
            <div className="space-y-4">
                {[
                    "The Department of Information Technology (KDPIT) at CHARUSAT is committed to cultivating future-ready professionals equipped with industry-relevant skills and strong academic foundations. Established with a vision to empower students through cutting-edge technologies and research-focused education, KDPIT stands out as one of the most dynamic departments at CHARUSAT.",
                    "With a vibrant curriculum that blends theoretical depth with practical exposure, the department offers undergraduate and postgraduate programs aligned with emerging tech trends such as Artificial Intelligence, Cloud Computing, DevOps, Cybersecurity, and Full Stack Development. Students are encouraged to explore innovation through hands-on projects, hackathons, internships, and interdisciplinary collaborations.",
                    "Under the guidance of highly qualified faculty and mentorship from experienced industry advisors, students of KDPIT have consistently demonstrated excellence in academics, placements, and startup initiatives. The department also fosters a strong culture of research and encourages students to contribute to real-world problem-solving.",
                    "KDPIT is not just a department — it is a nurturing ecosystem where learning meets leadership, and ideas turn into impact."
                ].map((text, index) => (
                    <motion.p
                        key={index}
                        className="text-base md:text-lg text-[#dee0e1]/90 leading-relaxed font-light"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
                    >
                        {text}
                    </motion.p>
                ))}
            </div>
        </motion.div>
    );
};

const team = [
    
    {
        name: 'Krisha Thakor',
        image: '/team/teammate2.jpg',
        gradient: 'from-indigo-400 to-purple-500'
    },
    {
        name: 'Naseta Delawala',
        image: '/team/teammate1.jpg',
        gradient: 'from-blue-400 to-indigo-500'
    },
    {
        name: 'Sakshi Shah',
        image: '/team/sakshi.jpg',
        gradient: 'from-cyan-400 to-blue-500'
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, duration: 0.8 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

const About = () => {
    return (
        <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#1a1f3a] via-[#2d3561] to-[#0f172a] text-foreground overflow-x-hidden">
            <Header />
            
            <main className="flex-grow flex flex-col justify-center items-center">
                {/* Enhanced animated background (unchanged) */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/70 via-transparent to-[#1a1f3a]/80 opacity-90"></div>
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(54,181,211,0.1),transparent_50%)]"></div>
                    </div>
                    
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gradient-to-r from-cyan-400/15 to-blue-400/10 blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-gradient-to-r from-indigo-400/15 to-purple-400/10 blur-2xl"
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.2, 0.5, 0.2],
                            rotate: [360, 180, 0]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400/60 to-blue-400/40 rounded-full shadow-lg shadow-cyan-400/30"
                            style={{
                                top: `${20 + i * 15}%`,
                                left: `${10 + i * 12}%`,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0.4, 1, 0.4],
                                scale: [1, 1.3, 1]
                            }}
                            transition={{
                                duration: 3 + i,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    className="relative z-10 w-full max-w-6xl mx-auto py-24 px-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Hero Section */}
                    <motion.div className="text-center mb-16" variants={cardVariants}>
                        <motion.h1
                            className="text-3xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg leading-tight"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            About PlaceMentor-AI
                        </motion.h1>
                        <motion.div
                            className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-indigo-400 mx-auto mb-6 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: 96 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        />
                        <motion.p
                            className="text-base md:text-lg text-[#dee0e1]/90 max-w-3xl mx-auto font-light leading-relaxed"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.7 }}
                        >
                            Empowering students with AI-driven placement guidance, real-time insights, and a supportive community for career success.
                        </motion.p>
                    </motion.div>

                    <AboutDepartment />

                    {/* Story Sections with Enhanced Design */}
                    {[
                        {
                            title: "Our Story",
                            content: (
                                <div className="space-y-4">
                                    <p className="text-base md:text-lg text-[#dee0e1]/90 leading-relaxed">
                                        As students in our pre-final year, we were anxious and confused. The placement season was approaching quickly, but we found ourselves stuck in a loop of questions:
                                    </p>
                                    <motion.ul
                                        className="space-y-2 pl-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4, staggerChildren: 0.1 }}
                                    >
                                        {[
                                            "Which companies visit our campus?",
                                            "What skills do they expect?",
                                            "What should we prepare for?",
                                            "Where can we find past placement stats?"
                                        ].map((item, i) => (
                                            <motion.li
                                                key={i}
                                                className="flex items-center text-sm md:text-base text-[#dee0e1]/80"
                                                initial={{ opacity: 0, x: -15 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + i * 0.1 }}
                                            >
                                                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-3 shadow-lg shadow-cyan-400/50"></div>
                                                {item}
                                            </motion.li>
                                        ))}
                                    </motion.ul>
                                    <p className="text-base md:text-lg text-[#dee0e1]/90 leading-relaxed">
                                        We realized we weren't alone. Many of our peers were equally lost — despite being skilled and hardworking, the lack of clear direction and data became a bottleneck. We saw a <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 px-1 py-0.5 rounded-md bg-cyan-400/10">gap</span> between students and placement preparation resources.
                                    </p>
                                </div>
                            )
                        },
                        {
                            title: "The Birth of an Idea",
                            content: (
                                <div className="space-y-4">
                                    <p className="text-base md:text-lg text-[#dee0e1]/90 leading-relaxed">
                                        That's when the idea for <strong className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">PlaceMentor AI</strong> was born. We decided to build a smart, AI-powered platform to help students:
                                    </p>
                                    <motion.ul
                                        className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4, staggerChildren: 0.1 }}
                                    >
                                        {[
                                            "Understand which companies are hiring for their branch",
                                            "Analyze past placement data and trends",
                                            "Get personalized preparation strategies",
                                            "Bridge the gap between skills and industry demand"
                                        ].map((item, i) => (
                                            <motion.li
                                                key={i}
                                                className="flex items-start text-sm md:text-base text-[#dee0e1]/80 p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur border border-white/10"
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 + i * 0.1 }}
                                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(54,181,211,0.1)' }}
                                            >
                                                <div className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-3 mt-1.5 shadow-lg shadow-cyan-400/50"></div>
                                                {item}
                                            </motion.li>
                                        ))}
                                    </motion.ul>
                                </div>
                            )
                        },
                        {
                            title: "About the Project",
                            content: (
                                <div className="space-y-4">
                                    <p className="text-base md:text-lg text-[#dee0e1]/90 leading-relaxed">
                                        <strong className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">PlaceMentor AI</strong> is an intelligent placement guidance system built using AI/NLP and cloud technologies. It offers real-time insights on company profiles, role expectations, required skill sets, and personalized paths based on student profiles.
                                    </p>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-400/10 via-blue-400/5 to-indigo-400/10 border border-cyan-400/20 backdrop-blur">
                                        <p className="text-base text-[#dee0e1]/90 leading-relaxed text-center">
                                            This platform is developed by passionate students from the KDPIT Department under the valuable guidance of <strong className="text-cyan-300">Dr. Purvi Prajapati</strong>, <strong className="text-blue-300">Dr. Sanket Suthar</strong>, and <strong className="text-indigo-300">Prof. Pavitra Modi</strong>.
                                        </p>
                                    </div>
                                    <p className="text-base md:text-lg text-[#dee0e1]/90 leading-relaxed font-medium text-center">
                                        From confusion to clarity — that was our journey. We hope PlaceMentor AI will make the placement experience smoother, smarter, and more strategic for every student who comes after us.
                                    </p>
                                </div>
                            )
                        }
                    ].map((section, index) => (
                        <motion.div
                            key={section.title}
                            className="max-w-5xl mx-auto mb-12 p-8 rounded-2xl bg-gradient-to-br from-[#1e2a4a]/60 via-[#2d3561]/50 to-[#1a1f3a]/70 backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden"
                            variants={cardVariants}
                            whileHover={{
                                scale: 1.01,
                                boxShadow: '0 15px 30px 0 rgba(54,181,211,0.15)',
                                borderColor: 'rgba(54,181,211,0.3)'
                            }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400"></div>
                            <motion.h2
                                className="text-2xl md:text-3xl font-black mb-6 bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg text-center"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {section.title}
                            </motion.h2>
                            {section.content}
                        </motion.div>
                    ))}

                    {/* Enhanced Team Section */}
                    <motion.div className="max-w-5xl mx-auto mb-12" variants={cardVariants}>
                        <motion.h2
                            className="text-3xl md:text-4xl font-black mb-10 bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7 }}
                        >
                            Meet Our Team
                        </motion.h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {team.map((member, idx) => (
                                <motion.div
                                    key={member.name}
                                    className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#1e2a4a]/80 via-[#2d3561]/70 to-[#1a1f3a]/90 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden"
                                    variants={cardVariants}
                                    whileHover={{
                                        scale: 1.05,
                                        rotateY: 5,
                                        boxShadow: '0 15px 30px 0 rgba(54,181,211,0.25)',
                                        borderColor: 'rgba(54,181,211,0.4)'
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Decorative elements */}
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${member.gradient}`}></div>
                                    <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${member.gradient} opacity-20 rounded-full blur-xl group-hover:opacity-30 transition-opacity`}></div>
                                    
                                    <div className="text-center relative z-10">
                                        <motion.div
                                            className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center mb-4 overflow-hidden shadow-xl relative`}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover rounded-full opacity-0"
                                                onError={e => { e.currentTarget.style.display = 'none'; }}
                                                onLoad={e => { e.currentTarget.style.opacity = '1'; }}
                                            />
                                            <span className="text-3xl font-black text-white absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </motion.div>
                                        <h3 className="text-lg md:text-xl font-bold text-[#dee0e1] mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">
                                            {member.name}
                                        </h3>
                                        <p className="text-sm text-[#dee0e1]/70 font-medium">{member.role}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </main>
            
            <Footer />
        </div>
    );
};

export default About;