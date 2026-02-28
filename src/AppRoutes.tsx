import { useEffect } from "react";
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
import Monitoring from "./pages/Monitoring";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !currentUser && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [currentUser, loading, navigate, location.pathname]);

  if (loading) {
    return null; // Or a loading spinner
  }

  return currentUser ? <>{children}</> : null;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && currentUser && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [currentUser, loading, navigate, location.pathname]);

  if (loading) {
    return null; // Or a loading spinner
  }

  return !currentUser ? <>{children}</> : null;
};

const AppRoutes = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RoutesWithAuth />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

const RoutesWithAuth = () => {
  const { loginBypass, logout } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login onLogin={loginBypass} />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/print-source"
        element={
          <ProtectedRoute>
            <PrintSource />
          </ProtectedRoute>
        }
      />
      <Route
        path="/print-monitoring"
        element={
          <ProtectedRoute>
            <PrintMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <Monitoring />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
