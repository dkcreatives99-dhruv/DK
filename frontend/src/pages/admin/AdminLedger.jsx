import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLedgerData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, IndianRupee, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AdminLedger = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedgerData();
  }, [user]);

  const fetchLedgerData = async () => {
    if (!user) return;
    try {
      const ledgerData = await getLedgerData(user.id);
      setData(ledgerData);
    } catch (error) {
      console.error('Failed to load ledger data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading ledger...</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">Failed to load data</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-ledger">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-syne font-bold text-slate-900">Financial Ledger</h1>
        <p className="text-slate-500 font-manrope text-sm mt-1">Overview of your income, expenses, and profit</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-manrope text-sm">Total Income</p>
                <p className="text-2xl font-syne font-bold text-green-600 mt-1">{formatCurrency(data.totalIncome)}</p>
                <p className="text-xs text-slate-500 mt-1">From paid invoices</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-manrope text-sm">Total Expenses</p>
                <p className="text-2xl font-syne font-bold text-red-600 mt-1">{formatCurrency(data.totalExpenses)}</p>
                <p className="text-xs text-slate-500 mt-1">All recorded expenses</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-slate-200 bg-gradient-to-br ${data.netProfit >= 0 ? 'from-blue-50' : 'from-orange-50'} to-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-manrope text-sm">Net {data.netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                <p className={`text-2xl font-syne font-bold mt-1 ${data.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrency(Math.abs(data.netProfit))}
                </p>
                <p className="text-xs text-slate-500 mt-1">Income - Expenses</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${data.netProfit >= 0 ? 'bg-blue-500' : 'bg-orange-500'} flex items-center justify-center`}>
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-manrope text-sm">Pending Amount</p>
                <p className="text-2xl font-syne font-bold text-orange-600 mt-1">{formatCurrency(data.pendingAmount)}</p>
                <p className="text-xs text-slate-500 mt-1">Unpaid invoices</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Income */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
              Recent Income
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentIncome.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No paid invoices yet</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentIncome.map((inv) => (
                  <div key={inv.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-manrope font-medium text-slate-900">{inv.customers?.name || 'Customer'}</p>
                      <p className="text-xs text-slate-500">{inv.invoice_number} • {formatDate(inv.payment_date || inv.created_at)}</p>
                    </div>
                    <span className="font-manrope font-semibold text-green-600">+{formatCurrency(inv.total_amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-red-600" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentExpenses.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No expenses recorded yet</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentExpenses.map((exp) => (
                  <div key={exp.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-manrope font-medium text-slate-900">{exp.category}</p>
                      <p className="text-xs text-slate-500">{exp.vendor || 'No vendor'} • {formatDate(exp.date)}</p>
                    </div>
                    <span className="font-manrope font-semibold text-red-600">-{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Invoices Status */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="font-syne font-bold text-slate-900">Invoice Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.allInvoices.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No invoices yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-manrope font-semibold text-slate-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-manrope font-semibold text-slate-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.allInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-manrope font-medium text-slate-900">{inv.invoice_number}</td>
                      <td className="px-6 py-4 font-manrope text-slate-600">{inv.customers?.name || 'N/A'}</td>
                      <td className="px-6 py-4 font-manrope text-slate-500 text-sm">{formatDate(inv.invoice_date)}</td>
                      <td className="px-6 py-4 font-manrope font-semibold text-slate-900 text-right">{formatCurrency(inv.total_amount)}</td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(inv.payment_status)}</td>
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

export default AdminLedger;
