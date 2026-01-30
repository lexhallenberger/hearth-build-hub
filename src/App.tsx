import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import CommandCenter from "./pages/CommandCenter";
import Deals from "./pages/Deals";
import DealNew from "./pages/DealNew";
import DealDetail from "./pages/DealDetail";
import Journeys from "./pages/Journeys";
import JourneyDetail from "./pages/JourneyDetail";
import Pipeline from "./pages/Pipeline";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Strategy from "./pages/Strategy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <AppLayout>
                  <CommandCenter />
                </AppLayout>
              }
            />
            <Route
              path="/deals"
              element={
                <AppLayout>
                  <Deals />
                </AppLayout>
              }
            />
            <Route
              path="/deals/new"
              element={
                <AppLayout>
                  <DealNew />
                </AppLayout>
              }
            />
            <Route
              path="/deals/:id"
              element={
                <AppLayout>
                  <DealDetail />
                </AppLayout>
              }
            />
            <Route
              path="/journeys"
              element={
                <AppLayout>
                  <Journeys />
                </AppLayout>
              }
            />
            <Route
              path="/journeys/:id"
              element={
                <AppLayout>
                  <JourneyDetail />
                </AppLayout>
              }
            />
            <Route
              path="/pipeline"
              element={
                <AppLayout>
                  <Pipeline />
                </AppLayout>
              }
            />
            <Route
              path="/customers"
              element={
                <AppLayout>
                  <Customers />
                </AppLayout>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <AppLayout>
                  <CustomerDetail />
                </AppLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <AppLayout>
                  <Analytics />
                </AppLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AppLayout>
                  <Settings />
                </AppLayout>
              }
            />
            <Route
              path="/strategy"
              element={
                <AppLayout>
                  <Strategy />
                </AppLayout>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
