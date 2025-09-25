import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";
import { LoginModal } from "./components/LoginModal";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import CompanyDirectory from "./pages/CompanyDirectory";
import InterviewPage from "./pages/InterviewPage";
import CompetencyTest from "./pages/CompetencyTest";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import AdminPage from "./pages/AdminPage";
import About from "./pages/AboutPage";
import FloatingChatbot from "@/components/FloatingChatbot";

const queryClient = new QueryClient();

console.log("API URL:", import.meta.env.VITE_API_URL);

const LoginRoute = () => {
  const navigate = useNavigate();
  return <LoginModal open={true} onClose={() => navigate(-1)} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginRoute />} />
            
            {/* Protected routes */}
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute><CompanyDirectory /></ProtectedRoute>} />

            <Route path='/interview' element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
            <Route path='/competency-test' element={<ProtectedRoute><CompetencyTest /></ProtectedRoute>} />
            <Route path='/resume-builder' element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
            <Route path='/resume-analyzer' element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
            <Route path='/admin' element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingChatbot />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
