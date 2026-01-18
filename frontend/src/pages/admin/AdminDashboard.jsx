import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI, invoicesAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Users, Package, TrendingUp, Eye, Plus,
  IndianRupee, Clock, Wallet, AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, invoicesData] = await Promise.all([
        dashboardAPI.getStats(),
        invoicesAPI.getAll()
      ]);
      
      setStats(statsData);
      setRecentInvoices((invoicesData || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-700',
      partial: 'bg-yellow-100 text-yellow-700',
      unpaid: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.unpaid}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 font-manrope">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">
            Welcome back, {user?.name || 'User'}! Here&apos;s your business overview.
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/invoices/new')}
          className="bg-primary hover:bg-primary-hover text-white rounded-lg font-manrope font-medium"
          data-testid="dashboard-new-invoice"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Primary Stats - Financial Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 hover:shadow-md transition-shadow" data-testid="stat-opening-balance">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-manrope text-xs">Opening Balance</p>
                <p className="text-xl font-syne font-bold text-slate-900 mt-1">{formatCurrency(stats?.openingBalance)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50/50 hover:shadow-md transition-shadow" data-testid="stat-total-income">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-manrope text-xs">Income Received</p>
                <p className="text-xl font-syne font-bold text-green-700 mt-1">{formatCurrency(stats?.totalIncome)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50/50 hover:shadow-md transition-shadow" data-testid="stat-total-expenses">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 font-manrope text-xs">Total Expenses</p>
                <p className="text-xl font-syne font-bold text-red-700 mt-1">{formatCurrency(stats?.totalExpenses)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white rotate-180" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50/50 hover:shadow-md transition-shadow" data-testid="stat-net-balance">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-manrope text-xs">Net Balance</p>
                <p className={`text-xl font-syne font-bold mt-1 ${(stats?.netProfit || 0) >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {formatCurrency(stats?.netProfit)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Invoices</p>
                <p className="text-lg font-bold text-slate-900">{stats?.totalInvoices || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Customers</p>
                <p className="text-lg font-bold text-slate-900">{stats?.totalCustomers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Products</p>
                <p className="text-lg font-bold text-slate-900">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="text-lg font-bold text-slate-900">{stats?.pendingPayments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Alert */}
      {(stats?.totalOutstanding || 0) > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Outstanding Amount</p>
                  <p className="text-sm text-orange-600">Total unpaid invoices balance</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-700">{formatCurrency(stats?.totalOutstanding)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          onClick={() => navigate('/admin/invoices/new')}
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:bg-slate-50"
        >
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="text-sm">New Invoice</span>
        </Button>
        <Button
          onClick={() => navigate('/admin/income')}
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:bg-slate-50"
        >
          <IndianRupee className="w-5 h-5 text-green-600" />
          <span className="text-sm">Record Payment</span>
        </Button>
        <Button
          onClick={() => navigate('/admin/expenses')}
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:bg-slate-50"
        >
          <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
          <span className="text-sm">Add Expense</span>
        </Button>
        <Button
          onClick={() => navigate('/admin/ledger')}
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:bg-slate-50"
        >
          <Wallet className="w-5 h-5 text-purple-600" />
          <span className="text-sm">View Ledger</span>
        </Button>
      </div>

      {/* Recent Invoices */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="font-syne font-bold text-slate-900">Recent Invoices</CardTitle>
            <Button
              onClick={() => navigate('/admin/invoices')}
              variant="ghost"
              className="text-primary hover:text-primary-hover font-manrope text-sm"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentInvoices.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-manrope">No invoices yet</p>
              <Button
                onClick={() => navigate('/admin/invoices/new')}
                className="mt-4 bg-primary hover:bg-primary-hover text-white rounded-lg"
              >
                Create Your First Invoice
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Invoice #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Paid</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {invoice.customer?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 text-right">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-green-600 text-right">
                        {formatCurrency(invoice.amount_paid || 0)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(invoice.payment_status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary-hover"
                          data-testid={`view-invoice-${invoice.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
