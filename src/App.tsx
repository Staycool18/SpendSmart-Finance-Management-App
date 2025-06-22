import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ConnectBank from "./pages/connectBank";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/Authcontext";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/login" 
                element={
                  <ErrorBoundary>
                    <Login />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <ErrorBoundary>
                    <Register />
                  </ErrorBoundary>
                } 
              />
              
              <Route element={<ProtectedRoute />}>
                <Route 
                  path="/connect-bank" 
                  element={
                    <ErrorBoundary>
                      <ConnectBank />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/transactions" 
                  element={
                    <ErrorBoundary>
                      <Transactions />
                    </ErrorBoundary>
                  } 
                />
              </Route>
              
              <Route 
                path="*" 
                element={
                  <ErrorBoundary>
                    <NotFound />
                  </ErrorBoundary>
                } 
              />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;