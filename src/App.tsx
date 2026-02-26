import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrintSource from "./pages/PrintSource";
import PrintMonitoring from "./pages/PrintMonitoring";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("ifs-auth") === "1");

  const handleLogin = () => {
    sessionStorage.setItem("ifs-auth", "1");
    setAuthed(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ifs-auth");
    setAuthed(false);
  };

  if (!authed) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Login onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index onLogout={handleLogout} />} />
            <Route path="/print-source" element={<PrintSource />} />
            <Route path="/print-monitoring" element={<PrintMonitoring />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
