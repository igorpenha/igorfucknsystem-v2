
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrintSource from "./pages/PrintSource";
import PrintMonitoring from "./pages/PrintMonitoring";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("ifs-auth") === "1");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authed && location.pathname === "/login") {
      navigate("/", { replace: true });
    } else if (!authed && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [authed, navigate, location.pathname]);

  const handleLogin = () => {
    sessionStorage.setItem("ifs-auth", "1");
    setAuthed(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ifs-auth");
    setAuthed(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/" element={<Index onLogout={handleLogout} />} />
          <Route path="/print-source" element={<PrintSource />} />
          <Route path="/print-monitoring" element={<PrintMonitoring />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppRoutes;
