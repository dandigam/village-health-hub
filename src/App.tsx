import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CampProvider } from "@/context/CampContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Camps from "./pages/Camps";
import Patients from "./pages/Patients";
import NewPatient from "./pages/NewPatient";
import Doctors from "./pages/Doctors";
import NewDoctor from "./pages/doctors/NewDoctor";
import EditDoctor from "./pages/doctors/EditDoctor";
import NewCamp from "./pages/camps/NewCamp";
import EditCamp from "./pages/camps/EditCamp";
import ViewCamp from "./pages/camps/ViewCamp";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Pharmacy
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import DispenseMedicine from "./pages/pharmacy/DispenseMedicine";

// Stock
import StockManagement from "./pages/stock/StockManagement";

// Suppliers
import Suppliers from "./pages/suppliers/Suppliers";
import NewSupplier from "./pages/suppliers/NewSupplier";

// Supplier Orders
import SupplierOrders from "./pages/supplier-orders/SupplierOrders";

// Distribution Orders
import DistributionOrders from "./pages/distribution/DistributionOrders";

// Encounters
import Encounters from "./pages/encounters/Encounters";

// Patient History
import PatientHistory from "./pages/patients/PatientHistory";

// Reports
import ReportsHub from "./pages/reports/ReportsHub";
import CampReports from "./pages/reports/CampReports";
import PatientReports from "./pages/reports/PatientReports";
import MedicineReports from "./pages/reports/MedicineReports";
import DiscountReports from "./pages/reports/DiscountReports";
import DoctorReports from "./pages/reports/DoctorReports";

// Settings & Profile
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import IDCardPrintouts from "./pages/settings/IDCardPrintouts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CampProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              <Route path="/dashboard" element={<ProtectedRoute routeKey="dashboard"><Dashboard /></ProtectedRoute>} />
              
              {/* Camps */}
              <Route path="/camps" element={<ProtectedRoute routeKey="camps"><Camps /></ProtectedRoute>} />
              <Route path="/camps/new" element={<ProtectedRoute routeKey="camps"><NewCamp /></ProtectedRoute>} />
              <Route path="/camps/:id" element={<ProtectedRoute routeKey="camps"><ViewCamp /></ProtectedRoute>} />
              <Route path="/camps/:id/edit" element={<ProtectedRoute routeKey="camps"><EditCamp /></ProtectedRoute>} />
              
              {/* Patients */}
              <Route path="/patients" element={<ProtectedRoute routeKey="patients"><Patients /></ProtectedRoute>} />
              <Route path="/patients/new" element={<ProtectedRoute routeKey="patients"><NewPatient /></ProtectedRoute>} />
              <Route path="/patients/:id" element={<ProtectedRoute routeKey="patients"><PatientHistory /></ProtectedRoute>} />
              <Route path="/patients/:id/edit" element={<ProtectedRoute routeKey="patients"><NewPatient /></ProtectedRoute>} />
              
              {/* Pharmacy */}
              <Route path="/pharmacy" element={<ProtectedRoute routeKey="pharmacy"><PharmacyDashboard /></ProtectedRoute>} />
              <Route path="/pharmacy/prescription/:id" element={<ProtectedRoute routeKey="pharmacy"><DispenseMedicine /></ProtectedRoute>} />
              <Route path="/pharmacy/dispense/:id" element={<ProtectedRoute routeKey="pharmacy"><DispenseMedicine /></ProtectedRoute>} />
              
              {/* Encounters */}
              <Route path="/encounters" element={<ProtectedRoute routeKey="encounters"><Encounters /></ProtectedRoute>} />
              
              {/* Stock */}
              <Route path="/stock" element={<ProtectedRoute routeKey="stock"><StockManagement /></ProtectedRoute>} />
              
              {/* Suppliers */}
              <Route path="/suppliers" element={<ProtectedRoute routeKey="suppliers"><Suppliers /></ProtectedRoute>} />
              <Route path="/suppliers/new" element={<ProtectedRoute routeKey="suppliers"><NewSupplier /></ProtectedRoute>} />
              <Route path="/suppliers/:id/edit" element={<ProtectedRoute routeKey="suppliers"><NewSupplier /></ProtectedRoute>} />
              
              {/* Supplier Orders */}
              <Route path="/supplier-orders" element={<ProtectedRoute routeKey="supplier-orders"><SupplierOrders /></ProtectedRoute>} />
              
              {/* Distribution Orders */}
              <Route path="/distribution-orders" element={<ProtectedRoute routeKey="distribution-orders"><DistributionOrders /></ProtectedRoute>} />
              
              {/* Doctors */}
              <Route path="/doctors" element={<ProtectedRoute routeKey="doctors"><Doctors /></ProtectedRoute>} />
              <Route path="/doctors/new" element={<ProtectedRoute routeKey="doctors"><NewDoctor /></ProtectedRoute>} />
              <Route path="/doctors/:id/edit" element={<ProtectedRoute routeKey="doctors"><EditDoctor /></ProtectedRoute>} />
              
              {/* Reports */}
              <Route path="/reports" element={<ProtectedRoute routeKey="reports"><ReportsHub /></ProtectedRoute>} />
              <Route path="/reports/camps" element={<ProtectedRoute routeKey="reports"><CampReports /></ProtectedRoute>} />
              <Route path="/reports/patients" element={<ProtectedRoute routeKey="reports"><PatientReports /></ProtectedRoute>} />
              <Route path="/reports/medicines" element={<ProtectedRoute routeKey="reports"><MedicineReports /></ProtectedRoute>} />
              <Route path="/reports/discounts" element={<ProtectedRoute routeKey="reports"><DiscountReports /></ProtectedRoute>} />
              <Route path="/reports/doctors" element={<ProtectedRoute routeKey="reports"><DoctorReports /></ProtectedRoute>} />
              
              {/* Settings & Profile */}
              <Route path="/settings" element={<ProtectedRoute routeKey="dashboard"><Settings /></ProtectedRoute>} />
              <Route path="/settings/id-cards" element={<ProtectedRoute routeKey="dashboard"><IDCardPrintouts /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute routeKey="dashboard"><Profile /></ProtectedRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </CampProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
