
import * as React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Battles from "./pages/Battles";
import MiniGames from "./pages/MiniGames";
import Leaderboard from "./pages/Leaderboard";
import Tournaments from "./pages/Tournaments";
import UsernameSetup from "./pages/UsernameSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<UsernameSetup />} />
              <Route path="/username-setup" element={<UsernameSetup />} />
              <Route path="/" element={<Index />} />
              <Route path="/battles" element={<Battles />} />
              <Route path="/minigames" element={<MiniGames />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
