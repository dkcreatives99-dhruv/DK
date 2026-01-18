import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Public Pages
import HomePage from "@/pages/HomePage";

// Admin Pages
import AdminAuth from "@/pages/admin/AdminAuth";
import AdminLayout from "@/components/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminInvoices from "@/pages/admin/AdminInvoices";
import CreateInvoice from "@/pages/admin/CreateInvoice";
import ViewInvoice from "@/pages/admin/ViewInvoice";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminIncome from "@/pages/admin/AdminIncome";
import AdminExpenses from "@/pages/admin/AdminExpenses";
import AdminLedger from "@/pages/admin/AdminLedger";
import AdminSettings from "@/pages/admin/AdminSettings";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-manrope">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Auth Route - redirects to dashboard if already logged in
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 font-manrope">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<HomePage />} />
        <Route path="/services" element={<HomePage />} />
        <Route path="/contact" element={<HomePage />} />

        {/* Admin Auth Route */}
        <Route path="/admin" element={<AuthRoute><AdminAuth /></AuthRoute>} />

        {/* Protected Admin Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/invoices" element={<AdminInvoices />} />
          <Route path="/admin/invoices/new" element={<CreateInvoice />} />
          <Route path="/admin/invoices/:id" element={<ViewInvoice />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/expenses" element={<AdminExpenses />} />
          <Route path="/admin/ledger" element={<AdminLedger />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </div>
    </AuthProvider>
  );
}

export default App;
