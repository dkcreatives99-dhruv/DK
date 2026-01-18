import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ledgerAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, IndianRupee, Clock, ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, Plus } from 'lucide-react';

const AdminLedger = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    try {
      const ledgerData = await ledgerAPI.getData();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Financial Ledger</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">
            Track your opening balance, income, expenses, and closing balance
          </p>
        </div>
        <Button 
          onClick={() => navigate('/admin/settings')} 
          variant="outline"
          className="text-slate-600"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Set Opening Balance
        </Button>
      </div>

      {/* Ledger Summary Flow */}
      <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
            <div className="text-center p-4 bg-slate-100 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Opening Balance</p>
              <p className="text-xl font-bold text-slate-700">{formatCurrency(data.openingBalance)}</p>
              {data.openingDate && <p className="text-xs text-slate-400 mt-1">as of {formatDate(data.openingDate)}</p>}
            </div>
            <div className="text-center text-2xl text-slate-300 hidden md:block">+</div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs text-green-600 mb-1">Income Received</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(data.totalIncome)}</p>
              <p className="text-xs text-green-500 mt-1">{(data.allIncome || []).length} payments</p>
            </div>
            <div className="text-center text-2xl text-slate-300 hidden md:block">−</div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs text-red-600 mb-1">Total Expenses</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(data.totalExpenses)}</p>
              <p className="text-xs text-red-500 mt-1">{(data.allExpenses || []).length} entries</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-slate-500">Closing Balance</p>
                  <p className={`text-3xl font-bold ${data.closingBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(data.closingBalance)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-orange-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-700">{formatCurrency(data.totalOutstanding)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['overview', 'income', 'expenses', 'outstanding'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Income */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                Recent Payments Received
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => navigate('/admin/income')}>
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {(data.recentIncome || []).length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No payments recorded yet
                  <Button onClick={() => navigate('/admin/income')} variant="link" className="text-primary ml-1">
                    Record one
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {(data.recentIncome || []).map((entry) => (
                    <div key={entry.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{entry.customer_name || 'Customer'}</p>
                        <p className="text-xs text-slate-500">{entry.invoice_number} • {formatDate(entry.payment_date)}</p>
                      </div>
                      <span className="font-semibold text-green-600">+{formatCurrency(entry.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
                Recent Expenses
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => navigate('/admin/expenses')}>
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {(data.recentExpenses || []).length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No expenses recorded yet
                  <Button onClick={() => navigate('/admin/expenses')} variant="link" className="text-primary ml-1">
                    Add one
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {(data.recentExpenses || []).map((exp) => (
                    <div key={exp.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{exp.category}</p>
                        <p className="text-xs text-slate-500">{exp.vendor || 'No vendor'} • {formatDate(exp.date)}</p>
                      </div>
                      <span className="font-semibold text-red-600">−{formatCurrency(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'income' && (
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="font-syne font-bold text-slate-900">All Income Entries</CardTitle>
            <Button onClick={() => navigate('/admin/income')} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Record Payment
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {(data.allIncome || []).length === 0 ? (
              <div className="p-8 text-center text-slate-500">No income entries yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Invoice</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mode</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.allIncome || []).map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(entry.payment_date)}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{entry.invoice_number || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{entry.customer_name || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs rounded-full bg-slate-100">{entry.payment_mode}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(entry.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-green-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 font-semibold text-green-800">Total Income</td>
                      <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(data.totalIncome)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'expenses' && (
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="font-syne font-bold text-slate-900">All Expenses</CardTitle>
            <Button onClick={() => navigate('/admin/expenses')} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {(data.allExpenses || []).length === 0 ? (
              <div className="p-8 text-center text-slate-500">No expenses recorded yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Vendor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.allExpenses || []).map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(exp.date)}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{exp.category}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{exp.vendor || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-500 truncate max-w-xs">{exp.description || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(exp.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-red-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 font-semibold text-red-800">Total Expenses</td>
                      <td className="px-4 py-3 text-right font-bold text-red-700">{formatCurrency(data.totalExpenses)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'outstanding' && (
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(data.outstandingInvoices || []).length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>All invoices are paid! 🎉</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Invoice #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Paid</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Balance</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.outstandingInvoices || []).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                            className="font-medium text-primary hover:underline"
                          >
                            {inv.invoice_number}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{inv.customer_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatDate(inv.invoice_date)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(inv.total_amount)}</td>
                        <td className="px-4 py-3 text-right text-green-600">{formatCurrency(inv.amount_paid || 0)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-orange-600">
                          {formatCurrency(inv.balance_due || inv.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-center">{getStatusBadge(inv.payment_status)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-orange-50">
                    <tr>
                      <td colSpan={5} className="px-4 py-3 font-semibold text-orange-800">Total Outstanding</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-700">{formatCurrency(data.totalOutstanding)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminLedger;
