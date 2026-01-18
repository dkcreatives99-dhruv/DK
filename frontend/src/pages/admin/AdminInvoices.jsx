import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoicesAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Plus, Eye, Search, Trash2, RotateCcw, AlertCircle, IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminInvoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [showDeleted]);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  const fetchInvoices = async () => {
    try {
      const data = await invoicesAPI.getAll(showDeleted);
      setInvoices(data || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.invoice_number.toLowerCase().includes(term) ||
        inv.customer?.name?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.payment_status === statusFilter);
    }
    
    setFilteredInvoices(filtered);
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    
    try {
      await invoicesAPI.delete(invoiceToDelete.id);
      toast.success(`Invoice ${invoiceToDelete.invoice_number} deleted`);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete invoice');
    }
  };

  const handleRestore = async (invoice) => {
    try {
      await invoicesAPI.restore(invoice.id);
      toast.success(`Invoice ${invoice.invoice_number} restored`);
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to restore invoice');
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

  const getInvoiceStatusBadge = (status, isDeleted) => {
    if (isDeleted) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Deleted</span>;
    }
    const styles = {
      draft: 'bg-slate-100 text-slate-600',
      issued: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.issued}`}>
        {status}
      </span>
    );
  };

  // Calculate summary stats
  const activeInvoices = invoices.filter(inv => !inv.is_deleted);
  const totalInvoiced = activeInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = activeInvoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-invoices">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">
            {activeInvoices.length} active invoices
          </p>
        </div>
        <Button onClick={() => navigate('/admin/invoices/new')} className="bg-primary hover:bg-primary-hover text-white rounded-lg" data-testid="create-invoice-button">
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Invoiced</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalInvoiced)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Received</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Outstanding</p>
                <p className="text-2xl font-bold text-orange-700">{formatCurrency(totalOutstanding)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice # or customer..."
            className="pl-10"
            data-testid="invoice-search"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm min-w-[150px]"
          data-testid="status-filter"
        >
          <option value="all">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded border-slate-300"
          />
          Show deleted
        </label>
      </div>

      {/* Invoices Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-manrope">
                {invoices.length === 0 ? 'No invoices yet' : 'No invoices match your search'}
              </p>
              {invoices.length === 0 && (
                <Button onClick={() => navigate('/admin/invoices/new')} className="mt-4 bg-primary text-white">
                  Create Your First Invoice
                </Button>
              )}
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
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Balance</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Payment</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((invoice) => (
                    <tr 
                      key={invoice.id} 
                      className={`hover:bg-slate-50 transition-colors ${invoice.is_deleted ? 'opacity-60 bg-slate-50' : ''}`}
                      data-testid={`invoice-row-${invoice.id}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                          className="font-medium text-primary hover:underline"
                          disabled={invoice.is_deleted}
                        >
                          {invoice.invoice_number}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="px-4 py-3 text-slate-900">
                        {invoice.customer?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-right">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-green-600 text-right">
                        {formatCurrency(invoice.amount_paid || 0)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-orange-600 text-right">
                        {formatCurrency(invoice.balance_due || invoice.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(invoice.payment_status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getInvoiceStatusBadge(invoice.status, invoice.is_deleted)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {invoice.is_deleted ? (
                            <Button
                              onClick={() => handleRestore(invoice)}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                              title="Restore Invoice"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary-hover h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteClick(invoice)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Delete Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              Are you sure you want to delete invoice <strong>{invoiceToDelete?.invoice_number}</strong>?
            </p>
            <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
              <p className="font-medium">Note:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Deleted invoices won't appear in reports or ledger</li>
                <li>You can restore deleted invoices from the trash</li>
                <li>Invoices with linked payments cannot be deleted</li>
              </ul>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Delete Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvoices;
