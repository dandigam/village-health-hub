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
import NewDoctor from "./pages/doctors/NewDoctor";
import NewCamp from "./pages/camps/NewCamp";
import NotFound from "./pages/NotFound";

// SOAP Notes
import SOAPNotesList from "./pages/soap/SOAPNotesList";
import NewSOAPNote from "./pages/soap/NewSOAPNote";
import ViewSOAPNote from "./pages/soap/ViewSOAPNote";

// Consultations
import ConsultationsList from "./pages/consultations/ConsultationsList";
import NewConsultation from "./pages/consultations/NewConsultation";

// Pharmacy
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import DispenseMedicine from "./pages/pharmacy/DispenseMedicine";

// Stock
import StockManagement from "./pages/stock/StockManagement";

// Patient History
import PatientHistory from "./pages/patients/PatientHistory";

// Reports
import ReportsHub from "./pages/reports/ReportsHub";
import CampReports from "./pages/reports/CampReports";
import PatientReports from "./pages/reports/PatientReports";
import MedicineReports from "./pages/reports/MedicineReports";
import DiscountReports from "./pages/reports/DiscountReports";
import DoctorReports from "./pages/reports/DoctorReports";

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
          
          {/* Camps */}
          <Route path="/camps" element={<Camps />} />
          <Route path="/camps/new" element={<NewCamp />} />
          
          {/* Patients */}
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={<NewPatient />} />
          <Route path="/patients/:id" element={<PatientHistory />} />
          
          {/* SOAP Notes */}
          <Route path="/soap" element={<SOAPNotesList />} />
          <Route path="/soap/new" element={<NewSOAPNote />} />
          <Route path="/soap/:id" element={<ViewSOAPNote />} />
          <Route path="/soap/:id/edit" element={<NewSOAPNote />} />
          
          {/* Consultations */}
          <Route path="/consultations" element={<ConsultationsList />} />
          <Route path="/consultations/new" element={<NewConsultation />} />
          
          {/* Pharmacy */}
          <Route path="/pharmacy" element={<PharmacyDashboard />} />
          <Route path="/pharmacy/prescription/:id" element={<DispenseMedicine />} />
          <Route path="/pharmacy/dispense/:id" element={<DispenseMedicine />} />
          
          {/* Stock */}
          <Route path="/stock" element={<StockManagement />} />
          
          {/* Doctors */}
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/new" element={<NewDoctor />} />
          
          {/* Reports */}
          <Route path="/reports" element={<ReportsHub />} />
          <Route path="/reports/camps" element={<CampReports />} />
          <Route path="/reports/patients" element={<PatientReports />} />
          <Route path="/reports/medicines" element={<MedicineReports />} />
          <Route path="/reports/discounts" element={<DiscountReports />} />
          <Route path="/reports/doctors" element={<DoctorReports />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
