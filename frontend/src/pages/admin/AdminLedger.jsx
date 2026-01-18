import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ledgerAPI, bankAccountsAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, IndianRupee, ArrowUpRight, ArrowDownRight, 
  Wallet, AlertCircle, Plus, Building, CreditCard, ArrowRightLeft, Briefcase, User
} from 'lucide-react';

const AdminLedger = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [bankLedgerData, setBankLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('consolidated'); // 'consolidated' or 'bank-wise'

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBankId && viewMode === 'bank-wise') {
      fetchBankLedger(selectedBankId);
    }
  }, [selectedBankId, viewMode]);

  const fetchData = async () => {
    try {
      const [ledgerData, bankData] = await Promise.all([
        ledgerAPI.getData(),
        bankAccountsAPI.getAll()
      ]);
      setData(ledgerData);
      setBankAccounts(bankData || []);
      if (bankData && bankData.length > 0) {
        setSelectedBankId(bankData[0].id);
      }
    } catch (error) {
      console.error('Failed to load ledger data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankLedger = async (bankId) => {
    try {
      const ledger = await ledgerAPI.getBankLedger(bankId);
      setBankLedgerData(ledger);
    } catch (error) {
      console.error('Failed to load bank ledger:', error);
      setBankLedgerData(null);
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

  const getTransactionTypeStyle = (type) => {
    const styles = {
      income: { bg: 'bg-green-50', text: 'text-green-700', icon: ArrowUpRight },
      expense: { bg: 'bg-red-50', text: 'text-red-700', icon: ArrowDownRight },
      transfer_in: { bg: 'bg-blue-50', text: 'text-blue-700', icon: ArrowUpRight },
      transfer_out: { bg: 'bg-orange-50', text: 'text-orange-700', icon: ArrowDownRight }
    };
    return styles[type] || styles.income;
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
        <div className="flex gap-2">
          <Button 
            onClick={() => setViewMode('consolidated')} 
            variant={viewMode === 'consolidated' ? 'default' : 'outline'}
            className={viewMode === 'consolidated' ? 'bg-primary text-white' : 'text-slate-600'}
            size="sm"
          >
            <Building className="w-4 h-4 mr-2" />
            Consolidated
          </Button>
          <Button 
            onClick={() => setViewMode('bank-wise')} 
            variant={viewMode === 'bank-wise' ? 'default' : 'outline'}
            className={viewMode === 'bank-wise' ? 'bg-primary text-white' : 'text-slate-600'}
            size="sm"
            disabled={bankAccounts.length === 0}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Bank-wise
          </Button>
        </div>
      </div>

      {viewMode === 'consolidated' ? (
        /* CONSOLIDATED VIEW */
        <>
          {/* Ledger Summary Flow */}
          <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                <div className="text-center p-4 bg-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Opening Balance</p>
                  <p className="text-xl font-bold text-slate-700">{formatCurrency(data.openingBalance)}</p>
                  <p className="text-xs text-slate-400 mt-1">{bankAccounts.length} accounts</p>
                </div>
                <div className="text-center text-2xl text-slate-300 hidden md:block">+</div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-green-600 mb-1">Income Received</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(data.totalIncome)}</p>
                  <div className="flex justify-center gap-2 mt-1 text-xs">
                    <span className="text-blue-600">₹{((data.businessIncome || 0) / 1000).toFixed(1)}k Biz</span>
                    <span className="text-purple-600">₹{((data.personalIncome || 0) / 1000).toFixed(1)}k Per</span>
                  </div>
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

          {/* Income Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> Business Income
                    </p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(data.businessIncome)}</p>
                    <p className="text-xs text-blue-500 mt-1">From invoices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium flex items-center gap-1">
                      <User className="w-4 h-4" /> Personal Income
                    </p>
                    <p className="text-2xl font-bold text-purple-700">{formatCurrency(data.personalIncome)}</p>
                    <p className="text-xs text-purple-500 mt-1">Non-invoice</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  {(data.allIncome || []).slice(0, 5).length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      No payments recorded yet
                      <Button onClick={() => navigate('/admin/income')} variant="link" className="text-primary ml-1">
                        Record one
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {(data.allIncome || []).slice(0, 5).map((entry) => (
                        <div key={entry.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {(entry.income_type || 'invoice') === 'invoice' 
                                ? (entry.customer_name || entry.invoice_number || 'Invoice Payment')
                                : (entry.income_source || 'Personal')}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(entry.income_type || 'invoice') === 'invoice' ? '📄' : '👤'} {formatDate(entry.payment_date)}
                            </p>
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
                  {(data.allExpenses || []).slice(0, 5).length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      No expenses recorded yet
                      <Button onClick={() => navigate('/admin/expenses')} variant="link" className="text-primary ml-1">
                        Add one
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {(data.allExpenses || []).slice(0, 5).map((exp) => (
                        <div key={exp.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{exp.category}</p>
                            <p className="text-xs text-slate-500">{exp.bank_name || 'No bank'} • {formatDate(exp.date)}</p>
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
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Source</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Bank</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(data.allIncome || []).map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-600">{formatDate(entry.payment_date)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                (entry.income_type || 'invoice') === 'invoice' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {(entry.income_type || 'invoice') === 'invoice' ? 'Business' : 'Personal'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {(entry.income_type || 'invoice') === 'invoice' 
                                ? (entry.invoice_number || '-')
                                : (entry.income_source || 'Other')}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">{entry.bank_name || '-'}</td>
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
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Paid From</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(data.allExpenses || []).map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-600">{formatDate(exp.date)}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">{exp.category}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{exp.vendor || '-'}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{exp.bank_name || '-'}</td>
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
        </>
      ) : (
        /* BANK-WISE VIEW */
        <>
          {/* Bank Account Selector */}
          <div className="flex flex-wrap gap-2">
            {bankAccounts.map(account => (
              <Button
                key={account.id}
                onClick={() => setSelectedBankId(account.id)}
                variant={selectedBankId === account.id ? 'default' : 'outline'}
                className={`${
                  selectedBankId === account.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {account.bank_name}
                <span className="ml-2 text-xs opacity-75">
                  ({formatCurrency(account.current_balance)})
                </span>
              </Button>
            ))}
          </div>

          {bankLedgerData ? (
            <>
              {/* Bank Summary */}
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{bankLedgerData.bankAccount.bank_name}</h3>
                      <p className="text-sm text-slate-500">
                        A/C: ****{bankLedgerData.bankAccount.account_number.slice(-4)} • {bankLedgerData.bankAccount.account_type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                    <div className="text-center p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500">Opening</p>
                      <p className="text-lg font-bold text-slate-700">{formatCurrency(bankLedgerData.openingBalance)}</p>
                      <p className="text-xs text-slate-400">{bankLedgerData.openingDate}</p>
                    </div>
                    <div className="text-center text-xl text-slate-300 hidden md:block">+</div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600">Credits</p>
                      <p className="text-lg font-bold text-green-700">{formatCurrency(bankLedgerData.totalCredit)}</p>
                    </div>
                    <div className="text-center text-xl text-slate-300 hidden md:block">−</div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600">Debits</p>
                      <p className="text-lg font-bold text-red-700">{formatCurrency(bankLedgerData.totalDebit)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                    <p className="text-sm text-slate-500">Current Balance</p>
                    <p className={`text-3xl font-bold ${bankLedgerData.currentBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(bankLedgerData.currentBalance)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Transactions */}
              <Card className="border-slate-200">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="font-syne font-bold text-slate-900">
                    Transactions - {bankLedgerData.bankAccount.bank_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {(bankLedgerData.transactions || []).length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      No transactions found for this account
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ref</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Credit</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Debit</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {/* Opening Balance Row */}
                          <tr className="bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-600">{bankLedgerData.openingDate}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-700">Opening</span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">Opening Balance</td>
                            <td className="px-4 py-3 text-sm text-slate-500">-</td>
                            <td className="px-4 py-3 text-right text-green-600">
                              {bankLedgerData.openingBalance >= 0 ? formatCurrency(bankLedgerData.openingBalance) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right text-red-600">
                              {bankLedgerData.openingBalance < 0 ? formatCurrency(Math.abs(bankLedgerData.openingBalance)) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900">
                              {formatCurrency(bankLedgerData.openingBalance)}
                            </td>
                          </tr>
                          {(bankLedgerData.transactions || []).map((t) => {
                            const style = getTransactionTypeStyle(t.type);
                            const Icon = style.icon;
                            return (
                              <tr key={t.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm text-slate-600">{formatDate(t.date)}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${style.bg} ${style.text}`}>
                                    <Icon className="w-3 h-3" />
                                    {t.type.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">{t.description}</td>
                                <td className="px-4 py-3 text-sm text-slate-500">{t.reference || '-'}</td>
                                <td className="px-4 py-3 text-right font-medium text-green-600">
                                  {t.credit > 0 ? formatCurrency(t.credit) : '-'}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-red-600">
                                  {t.debit > 0 ? formatCurrency(t.debit) : '-'}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                  {formatCurrency(t.balance)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-blue-50">
                          <tr>
                            <td colSpan={4} className="px-4 py-3 font-semibold text-blue-800">Closing Balance</td>
                            <td className="px-4 py-3 text-right font-bold text-green-700">
                              {formatCurrency(bankLedgerData.totalCredit)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-red-700">
                              {formatCurrency(bankLedgerData.totalDebit)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-blue-700">
                              {formatCurrency(bankLedgerData.currentBalance)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center text-slate-500">
                Select a bank account to view its ledger
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AdminLedger;
