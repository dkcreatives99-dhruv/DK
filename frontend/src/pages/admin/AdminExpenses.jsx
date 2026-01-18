import React, { useEffect, useState } from 'react';
import { expensesAPI, bankAccountsAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Receipt, Search, CreditCard } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Office Supplies', 'Rent', 'Utilities', 'Travel', 'Marketing', 
  'Software', 'Hardware', 'Salary', 'Professional Fees', 'Miscellaneous', 'Other'
];

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Debit Card', 'Other'];

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    category: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0],
    vendor: '', 
    description: '', 
    payment_mode: 'Bank Transfer',
    bank_account_id: '',
    reference_number: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesData, bankData] = await Promise.all([
        expensesAPI.getAll(),
        bankAccountsAPI.getAll()
      ]);
      setExpenses(expensesData || []);
      setBankAccounts(bankData || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category || '',
        amount: expense.amount?.toString() || '',
        date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        vendor: expense.vendor || '',
        description: expense.description || '',
        payment_mode: expense.payment_mode || expense.payment_method || 'Bank Transfer',
        bank_account_id: expense.bank_account_id || '',
        reference_number: expense.reference_number || ''
      });
    } else {
      setEditingExpense(null);
      const primaryBank = bankAccounts.find(b => b.is_primary) || bankAccounts[0];
      setFormData({
        category: '', 
        amount: '', 
        date: new Date().toISOString().split('T')[0],
        vendor: '', 
        description: '', 
        payment_mode: 'Bank Transfer',
        bank_account_id: primaryBank?.id || '',
        reference_number: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bank_account_id) {
      toast.error('Please select a bank account - specify which account was debited');
      return;
    }
    
    try {
      const data = { 
        ...formData, 
        amount: parseFloat(formData.amount),
        reference_number: formData.reference_number || null
      };
      
      if (editingExpense) {
        await expensesAPI.update(editingExpense.id, data);
        toast.success('Expense updated successfully');
      } else {
        await expensesAPI.create(data);
        toast.success('Expense added successfully');
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expensesAPI.delete(id);
      toast.success('Expense deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredExpenses = expenses.filter(exp =>
    exp.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  // Group by category
  const expensesByCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (parseFloat(exp.amount) || 0);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading expenses...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-expenses">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">Track your business expenses with bank account details</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-red-600 hover:bg-red-700 text-white rounded-lg" data-testid="add-expense-button">
          <Plus className="w-4 h-4 mr-2" /> Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-red-500 mt-1">{expenses.length} entries</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(expensesByCategory).slice(0, 3).map(([cat, amount]) => (
          <Card key={cat} className="border-slate-200">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500 font-medium truncate">{cat}</p>
              <p className="text-xl font-bold text-slate-700">{formatCurrency(amount)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by category, vendor, bank..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Expenses Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-manrope">No expenses recorded yet</p>
              <Button onClick={() => handleOpenDialog()} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Paid From</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mode</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50" data-testid={`expense-row-${expense.id}`}>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(expense.date)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{expense.vendor || '-'}</td>
                      <td className="px-4 py-3">
                        {expense.bank_name ? (
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-slate-400" />
                            <span className="text-sm text-slate-600">{expense.bank_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">{expense.payment_mode || expense.payment_method || '-'}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-red-600 text-right">{formatCurrency(expense.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button onClick={() => handleOpenDialog(expense)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button onClick={() => handleDelete(expense.id)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-syne">{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                  required 
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" 
                  data-testid="expense-category-select"
                >
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                  required 
                  placeholder="5000" 
                  data-testid="expense-amount-input" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode *</label>
                <select 
                  value={formData.payment_mode} 
                  onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })} 
                  required
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Paid From (Bank Account) *</label>
              <select 
                value={formData.bank_account_id} 
                onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })} 
                required
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Select Account</option>
                {bankAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank_name} - {acc.account_number.slice(-4)}
                    {acc.is_primary && ' (Primary)'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Which account was used to pay this expense?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
              <Input 
                value={formData.vendor} 
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} 
                placeholder="Vendor name" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Brief description" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference Number</label>
              <Input 
                value={formData.reference_number} 
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })} 
                placeholder="Transaction ID, Bill No., etc." 
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" data-testid="save-expense-button">
                {editingExpense ? 'Update' : 'Add'} Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExpenses;
