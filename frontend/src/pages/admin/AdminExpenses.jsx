import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Receipt, IndianRupee } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Office Supplies', 'Rent', 'Utilities', 'Salaries', 'Marketing',
  'Travel', 'Equipment', 'Software', 'Professional Services', 'Taxes', 'Other'
];

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Cheque', 'Other'];

const AdminExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: '', amount: '', date: new Date().toISOString().split('T')[0],
    vendor: '', description: '', payment_method: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const { data, error } = await getExpenses(user.id);
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category || '',
        amount: expense.amount || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        vendor: expense.vendor || '',
        description: expense.description || '',
        payment_method: expense.payment_method || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        category: '', amount: '', date: new Date().toISOString().split('T')[0],
        vendor: '', description: '', payment_method: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, amount: parseFloat(formData.amount) };
      if (editingExpense) {
        const { error } = await updateExpense(editingExpense.id, data);
        if (error) throw error;
        toast.success('Expense updated successfully');
      } else {
        const { error } = await createExpense({ ...data, user_id: user.id });
        if (error) throw error;
        toast.success('Expense added successfully');
      }
      setIsDialogOpen(false);
      fetchExpenses();
    } catch (error) {
      toast.error(error.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const { error } = await deleteExpense(id);
      if (error) throw error;
      toast.success('Expense deleted');
      fetchExpenses();
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

  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading expenses...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-expenses">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">Track your business expenses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 font-manrope">Total Expenses</p>
            <p className="text-lg font-syne font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary-hover text-white rounded-lg" data-testid="add-expense-button">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Expenses Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-manrope">No expenses recorded yet</p>
              <Button onClick={() => handleOpenDialog()} className="mt-4 bg-primary text-white">Add Your First Expense</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-manrope font-semibold text-slate-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-manrope font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50" data-testid={`expense-row-${expense.id}`}>
                      <td className="px-6 py-4 font-manrope text-slate-600 text-sm">{formatDate(expense.date)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-manrope text-slate-600 text-sm">{expense.vendor || '-'}</td>
                      <td className="px-6 py-4 font-manrope text-slate-600 text-sm max-w-xs truncate">{expense.description || '-'}</td>
                      <td className="px-6 py-4 font-manrope font-semibold text-red-600 text-right">{formatCurrency(expense.amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button onClick={() => handleOpenDialog(expense)} variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleDelete(expense.id)} variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
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
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" data-testid="expense-category-select">
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Amount (₹) *</label>
                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required placeholder="5000" data-testid="expense-amount-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Date *</label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Payment Method</label>
                <select value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select method</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Vendor</label>
              <Input value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} placeholder="Vendor name" />
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Description</label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary-hover text-white" data-testid="save-expense-button">
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
