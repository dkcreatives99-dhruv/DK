import React, { useEffect, useState } from 'react';
import { incomeAPI, invoicesAPI, bankAccountsAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, IndianRupee, Calendar, FileText, Search, Briefcase, User, Filter } from 'lucide-react';

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];
const PERSONAL_INCOME_SOURCES = ['Family Support', 'Personal Transfer', 'Capital Infusion', 'Other'];

const AdminIncome = () => {
  const [income, setIncome] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const [formData, setFormData] = useState({
    income_type: 'invoice',
    invoice_id: '',
    income_source: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'Bank Transfer',
    bank_account_id: '',
    reference_number: '',
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incomeData, invoicesData, bankData] = await Promise.all([
        incomeAPI.getAll(),
        invoicesAPI.getAll(),
        bankAccountsAPI.getAll()
      ]);
      setIncome(incomeData);
      setInvoices(invoicesData.filter(inv => inv.payment_status !== 'paid' && inv.status !== 'cancelled' && !inv.is_deleted));
      setBankAccounts(bankData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (entry = null) => {
    if (entry) {
      setEditingId(entry.id);
      setFormData({
        income_type: entry.income_type || 'invoice',
        invoice_id: entry.invoice_id || '',
        income_source: entry.income_source || '',
        amount: entry.amount.toString(),
        payment_date: entry.payment_date,
        payment_mode: entry.payment_mode,
        bank_account_id: entry.bank_account_id || '',
        reference_number: entry.reference_number || '',
        remarks: entry.remarks || ''
      });
    } else {
      setEditingId(null);
      const primaryBank = bankAccounts.find(b => b.is_primary) || bankAccounts[0];
      setFormData({
        income_type: 'invoice',
        invoice_id: '',
        income_source: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_mode: 'Bank Transfer',
        bank_account_id: primaryBank?.id || '',
        reference_number: '',
        remarks: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bank_account_id) {
      toast.error('Please select a bank account');
      return;
    }
    
    if (formData.income_type === 'invoice' && !formData.invoice_id) {
      toast.error('Please select an invoice');
      return;
    }
    
    if (formData.income_type === 'personal' && !formData.income_source) {
      toast.error('Please select an income source');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const data = {
        income_type: formData.income_type,
        invoice_id: formData.income_type === 'invoice' ? formData.invoice_id : null,
        income_source: formData.income_type === 'personal' ? formData.income_source : null,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_mode: formData.payment_mode,
        bank_account_id: formData.bank_account_id,
        reference_number: formData.reference_number || null,
        remarks: formData.remarks || null
      };

      if (editingId) {
        await incomeAPI.update(editingId, data);
        toast.success('Income entry updated');
      } else {
        await incomeAPI.create(data);
        toast.success('Income entry created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save income entry');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) return;
    
    try {
      await incomeAPI.delete(id);
      toast.success('Income entry deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete income entry');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getSelectedInvoice = () => {
    return invoices.find(inv => inv.id === formData.invoice_id);
  };

  const filteredIncome = income.filter(entry => {
    const matchesSearch = 
      entry.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.income_source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.payment_mode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || entry.income_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const businessIncome = income.filter(e => (e.income_type || 'invoice') === 'invoice');
  const personalIncome = income.filter(e => e.income_type === 'personal');
  const totalBusinessIncome = businessIncome.reduce((sum, e) => sum + e.amount, 0);
  const totalPersonalIncome = personalIncome.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = totalBusinessIncome + totalPersonalIncome;

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-income">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Income</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">Track payments received - Business & Personal</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700 text-white rounded-lg" data-testid="add-income-button">
          <Plus className="w-4 h-4 mr-2" /> Record Income
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Income</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
                <p className="text-xs text-green-500 mt-1">{income.length} entries</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Business Income</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalBusinessIncome)}</p>
                <p className="text-xs text-blue-500 mt-1">{businessIncome.length} invoices</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Personal Income</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(totalPersonalIncome)}</p>
                <p className="text-xs text-purple-500 mt-1">{personalIncome.length} entries</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by invoice, customer, source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm min-w-[150px]"
        >
          <option value="all">All Income Types</option>
          <option value="invoice">Business (Invoice)</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {/* Income Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Source / Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Bank</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncome.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No income entries found. Record your first payment!
                    </td>
                  </tr>
                ) : (
                  filteredIncome.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(entry.payment_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          (entry.income_type || 'invoice') === 'invoice' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {(entry.income_type || 'invoice') === 'invoice' ? 'Business' : 'Personal'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(entry.income_type || 'invoice') === 'invoice' ? (
                          <div>
                            <span className="font-medium text-slate-900">{entry.invoice_number || '-'}</span>
                            {entry.customer_name && <p className="text-xs text-slate-500">{entry.customer_name}</p>}
                          </div>
                        ) : (
                          <span className="font-medium text-slate-900">{entry.income_source || 'Other'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                          {entry.payment_mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{entry.bank_name || '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(entry.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(entry)} className="h-8 w-8 p-0">
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} className="h-8 w-8 p-0">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-syne">{editingId ? 'Edit Income' : 'Record Income'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Income Type Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Income Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, income_type: 'invoice', income_source: '' })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.income_type === 'invoice' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Briefcase className={`w-5 h-5 mb-1 ${formData.income_type === 'invoice' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <p className={`font-medium ${formData.income_type === 'invoice' ? 'text-blue-700' : 'text-slate-700'}`}>Business</p>
                  <p className="text-xs text-slate-500">Invoice Payment</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, income_type: 'personal', invoice_id: '' })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.income_type === 'personal' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <User className={`w-5 h-5 mb-1 ${formData.income_type === 'personal' ? 'text-purple-600' : 'text-slate-400'}`} />
                  <p className={`font-medium ${formData.income_type === 'personal' ? 'text-purple-700' : 'text-slate-700'}`}>Personal</p>
                  <p className="text-xs text-slate-500">Non-Invoice</p>
                </button>
              </div>
            </div>

            {/* Invoice Selection (for business income) */}
            {formData.income_type === 'invoice' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice *</label>
                <select
                  value={formData.invoice_id}
                  onChange={(e) => {
                    const inv = invoices.find(i => i.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      invoice_id: e.target.value,
                      amount: inv ? inv.balance_due.toString() : ''
                    });
                  }}
                  required={formData.income_type === 'invoice'}
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                  data-testid="income-invoice-select"
                >
                  <option value="">Select Invoice</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} - {inv.customer?.name} - Due: {formatCurrency(inv.balance_due)}
                    </option>
                  ))}
                </select>
                {getSelectedInvoice() && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    <p>Invoice Total: {formatCurrency(getSelectedInvoice().total_amount)}</p>
                    <p>Already Paid: {formatCurrency(getSelectedInvoice().amount_paid)}</p>
                    <p className="font-semibold">Balance Due: {formatCurrency(getSelectedInvoice().balance_due)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Income Source (for personal income) */}
            {formData.income_type === 'personal' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Income Source *</label>
                <select
                  value={formData.income_source}
                  onChange={(e) => setFormData({ ...formData, income_source: e.target.value })}
                  required={formData.income_type === 'personal'}
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Select Source</option>
                  {PERSONAL_INCOME_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                  data-testid="income-amount-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date *</label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode *</label>
                <select
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                  required
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {PAYMENT_MODES.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Credited To (Bank) *</label>
                <select
                  value={formData.bank_account_id}
                  onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
                  required
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bank_name} - {acc.account_number.slice(-4)}
                      {acc.is_primary && ' (Primary)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference Number</label>
              <Input
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="Transaction ID, Cheque No., etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
              <Input
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Any additional notes"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                {editingId ? 'Update' : 'Record'} Income
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminIncome;
