import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, FileText, Users, Package, 
  Receipt, BookOpen, Settings, LogOut, Plus, ArrowLeft
} from 'lucide-react';

const AdminLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/invoices', icon: FileText, label: 'Invoices' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/admin/ledger', icon: BookOpen, label: 'Ledger' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-layout">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-manrope"
              >
                <ArrowLeft className="w-4 h-4" />
                Website
              </a>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-syne font-bold text-sm">DK</span>
                </div>
                <span className="font-syne font-bold text-slate-900 hidden sm:block">Invoice Manager</span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/admin/invoices/new')}
                className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 font-manrope font-medium text-sm hidden sm:flex items-center gap-2"
                data-testid="new-invoice-button"
              >
                <Plus className="w-4 h-4" />
                New Invoice
              </Button>
              
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-manrope text-sm hidden md:block">
                  {user?.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-slate-500 hover:text-red-600 hover:bg-red-50 p-2"
                  data-testid="sign-out-button"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto pb-px -mb-px scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 font-manrope text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                  }`
                }
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Mobile New Invoice Button */}
      <Button
        onClick={() => navigate('/admin/invoices/new')}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg z-50"
        data-testid="mobile-new-invoice-button"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default AdminLayout;
