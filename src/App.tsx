import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SelectCamp from "./pages/SelectCamp";
import Dashboard from "./pages/Dashboard";
import Camps from "./pages/Camps";
import Patients from "./pages/Patients";
import NewPatient from "./pages/NewPatient";
import Doctors from "./pages/Doctors";
import Pharmacy from "./pages/Pharmacy";
import Consultations from "./pages/Consultations";
import Stock from "./pages/Stock";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/select-camp" element={<SelectCamp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/camps" element={<Camps />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={<NewPatient />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/consultations" element={<Consultations />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/reports" element={<Reports />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
