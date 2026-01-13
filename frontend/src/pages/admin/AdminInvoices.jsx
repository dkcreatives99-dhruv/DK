import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getInvoices } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminInvoices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  const fetchInvoices = async () => {
    if (!user) return;
    try {
      const { data, error } = await getInvoices(user.id);
      if (error) throw error;
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
        inv.customers?.name?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.payment_status === statusFilter);
    }
    
    setFilteredInvoices(filtered);
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
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-invoices">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">
            {invoices.length} total invoices
          </p>
        </div>
        <Button onClick={() => navigate('/admin/invoices/new')} className="bg-primary hover:bg-primary-hover text-white rounded-lg" data-testid="create-invoice-button">
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
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
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
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
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-manrope font-semibold text-slate-600 uppercase">Customer</th>
                    <th className="px-6 py-3 text-right text-xs font-manrope font-semibold text-slate-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-manrope font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-manrope font-semibold text-slate-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors" data-testid={`invoice-row-${invoice.id}`}>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                          className="font-manrope font-medium text-primary hover:underline"
                        >
                          {invoice.invoice_number}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-manrope text-slate-600 text-sm">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="px-6 py-4 font-manrope text-slate-900">
                        {invoice.customers?.name || 'N/A'}
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

export default AdminInvoices;
