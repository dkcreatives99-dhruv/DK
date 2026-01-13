import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

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
import AdminExpenses from "@/pages/admin/AdminExpenses";
import AdminLedger from "@/pages/admin/AdminLedger";
import AdminSettings from "@/pages/admin/AdminSettings";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public Website Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<HomePage />} />
            <Route path="/services" element={<HomePage />} />
            <Route path="/contact" element={<HomePage />} />

            {/* Admin Auth Route */}
            <Route path="/admin" element={<AdminAuth />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="invoices/new" element={<CreateInvoice />} />
              <Route path="invoices/:id" element={<ViewInvoice />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="expenses" element={<AdminExpenses />} />
              <Route path="ledger" element={<AdminLedger />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </div>
    </AuthProvider>
  );
}

export default App;
