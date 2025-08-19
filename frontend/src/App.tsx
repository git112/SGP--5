import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import CompanyDirectory from "./pages/CompanyDirectory";
import InterviewPage from "./pages/InterviewPage";
import Predict from "./pages/Predict";
import About from "./pages/AboutPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute><CompanyDirectory /></ProtectedRoute>} />

            <Route path='/interview' element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
            <Route path='/predict' element={<ProtectedRoute><Predict /></ProtectedRoute>} />
            <Route path='/about' element={<ProtectedRoute><About /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
