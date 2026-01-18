import React, { useEffect, useState } from 'react';
import { incomeAPI, invoicesAPI, bankAccountsAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, IndianRupee, Calendar, CreditCard, FileText, Search } from 'lucide-react';

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];

const AdminIncome = () => {
  const [income, setIncome] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    invoice_id: '',
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
      // Filter to show only unpaid/partial invoices for selection
      setInvoices(invoicesData.filter(inv => inv.payment_status !== 'paid' && inv.status !== 'cancelled'));
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
        invoice_id: entry.invoice_id,
        amount: entry.amount.toString(),
        payment_date: entry.payment_date,
        payment_mode: entry.payment_mode,
        bank_account_id: entry.bank_account_id || '',
        reference_number: entry.reference_number || '',
        remarks: entry.remarks || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        invoice_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_mode: 'Bank Transfer',
        bank_account_id: '',
        reference_number: '',
        remarks: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.invoice_id) {
      toast.error('Please select an invoice');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        bank_account_id: formData.bank_account_id || null
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

  const filteredIncome = income.filter(entry => 
    entry.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.payment_mode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = income.reduce((sum, entry) => sum + entry.amount, 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-income">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Income</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">Track payments received against invoices</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700 text-white rounded-lg" data-testid="add-income-button">
          <Plus className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Income Received</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
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
                <p className="text-sm text-blue-600 font-medium">Payment Entries</p>
                <p className="text-2xl font-bold text-blue-700">{income.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Invoices</p>
                <p className="text-2xl font-bold text-orange-700">{invoices.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by invoice, customer, or payment mode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Income Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
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
                        <span className="font-medium text-slate-900">{entry.invoice_number || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{entry.customer_name || '-'}</td>
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
            <DialogTitle className="font-syne">{editingId ? 'Edit Payment' : 'Record Payment'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                required
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Bank Account</label>
                <select
                  value={formData.bank_account_id}
                  onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Select Bank (Optional)</option>
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.bank_name} - {acc.account_number}</option>
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
                {editingId ? 'Update' : 'Record'} Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminIncome;
