import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI, invoicesAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Users, Package, TrendingUp, Eye, Plus,
  IndianRupee, Clock
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

  const statCards = [
    { label: 'Total Invoices', value: stats?.totalInvoices || 0, icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue), icon: IndianRupee, color: 'bg-green-500' },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-orange-500' },
  ];

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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-slate-200 hover:shadow-md transition-shadow" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-manrope text-sm">{stat.label}</p>
                  <p className="text-2xl font-syne font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 font-manrope text-sm">Net Profit</p>
                <p className="text-xl font-syne font-bold text-green-600">
                  {formatCurrency(stats?.netProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 font-manrope text-sm">Total Expenses</p>
                <p className="text-xl font-syne font-bold text-red-600">
                  {formatCurrency(stats?.totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 font-manrope text-sm">Pending Payments</p>
                <p className="text-xl font-syne font-bold text-orange-600">
                  {stats?.pendingPayments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-right text-xs font-manrope font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-manrope font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-manrope font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-manrope font-medium text-slate-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 font-manrope text-slate-600 text-sm">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="px-6 py-4 font-manrope text-slate-600 text-sm">
                        {invoice.customer?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-manrope font-semibold text-slate-900 text-right">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(invoice.payment_status)}
                      </td>
                      <td className="px-6 py-4 text-center">
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
