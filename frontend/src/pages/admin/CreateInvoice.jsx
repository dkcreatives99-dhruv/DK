import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCustomers, getProducts, getBusiness, getNextInvoiceNumber, createInvoice } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';

const CreateInvoice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [business, setBusiness] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    discount_type: '',
    discount_value: '',
    notes: ''
  });

  const [items, setItems] = useState([
    { product_id: '', product_name: '', description: '', hsn_code: '', quantity: 1, unit: 'Nos', rate: 0, gst_rate: 18 }
  ]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [customersRes, productsRes, businessRes, invoiceNumRes] = await Promise.all([
        getCustomers(user.id),
        getProducts(user.id),
        getBusiness(user.id),
        getNextInvoiceNumber(user.id)
      ]);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
      setBusiness(businessRes.data);
      setInvoiceNumber(invoiceNumRes.number);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        product_name: product.name,
        description: product.description || '',
        hsn_code: product.hsn_code || '',
        unit: product.unit || 'Nos',
        rate: parseFloat(product.price) || 0,
        gst_rate: parseFloat(product.gst_rate) || 18
      };
      setItems(newItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', product_name: '', description: '', hsn_code: '', quantity: 1, unit: 'Nos', rate: 0, gst_rate: 18 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculations
  const calculateItemAmount = (item) => parseFloat(item.quantity) * parseFloat(item.rate) || 0;
  const calculateItemGst = (item) => (calculateItemAmount(item) * parseFloat(item.gst_rate)) / 100;
  const calculateItemTotal = (item) => calculateItemAmount(item) + calculateItemGst(item);

  const subtotal = items.reduce((sum, item) => sum + calculateItemAmount(item), 0);
  const totalItemGst = items.reduce((sum, item) => sum + calculateItemGst(item), 0);

  const discountAmount = formData.discount_type === 'percentage'
    ? (subtotal * parseFloat(formData.discount_value || 0)) / 100
    : parseFloat(formData.discount_value || 0);

  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // Proportionally adjust GST after discount
  const adjustedGst = subtotal > 0 ? totalItemGst * (subtotalAfterDiscount / subtotal) : 0;

  // Determine GST type based on states
  const selectedCustomer = customers.find(c => c.id === formData.customer_id);
  const isInterState = selectedCustomer && business && selectedCustomer.state !== business.state;
  
  const cgst = isInterState ? 0 : adjustedGst / 2;
  const sgst = isInterState ? 0 : adjustedGst / 2;
  const igst = isInterState ? adjustedGst : 0;

  const totalAmount = subtotalAfterDiscount + adjustedGst;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    
    if (items.some(item => !item.product_name || item.rate <= 0)) {
      toast.error('Please fill all item details');
      return;
    }

    setSaving(true);
    try {
      const invoiceData = {
        user_id: user.id,
        invoice_number: invoiceNumber,
        invoice_date: formData.invoice_date,
        customer_id: formData.customer_id,
        subtotal: subtotal,
        discount_type: formData.discount_type || null,
        discount_value: parseFloat(formData.discount_value) || 0,
        discount_amount: discountAmount,
        subtotal_after_discount: subtotalAfterDiscount,
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        total_gst: adjustedGst,
        total_amount: totalAmount,
        payment_status: 'unpaid',
        notes: formData.notes
      };

      const invoiceItems = items.map(item => ({
        product_id: item.product_id || null,
        product_name: item.product_name,
        description: item.description,
        hsn_code: item.hsn_code,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        rate: parseFloat(item.rate),
        gst_rate: parseFloat(item.gst_rate),
        amount: calculateItemAmount(item),
        gst_amount: calculateItemGst(item),
        total: calculateItemTotal(item)
      }));

      const { data, error } = await createInvoice(invoiceData, invoiceItems);
      if (error) throw error;
      
      toast.success('Invoice created successfully');
      navigate(`/admin/invoices/${data.id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Please set up your business profile first</p>
        <Button onClick={() => navigate('/admin/settings')} className="bg-primary text-white">
          Go to Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="create-invoice">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/invoices')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Create Invoice</h1>
          <p className="text-slate-500 font-manrope text-sm">Invoice #{invoiceNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-syne text-lg">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Customer *</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  required
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  data-testid="customer-select"
                >
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Invoice Date</label>
                <Input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Invoice Number</label>
                <Input value={invoiceNumber} disabled className="bg-slate-50" />
              </div>
            </div>
            {selectedCustomer && business && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 text-sm">
                <span className="font-medium">GST Type: </span>
                {isInterState ? (
                  <span className="text-blue-700">Inter-State (IGST) - {selectedCustomer.state} → {business.state}</span>
                ) : (
                  <span className="text-green-700">Intra-State (CGST + SGST) - {business.state}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="font-syne text-lg">Line Items</CardTitle>
              <Button type="button" onClick={addItem} variant="outline" size="sm" data-testid="add-item-button">
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-manrope font-semibold text-slate-600">Product/Service</th>
                    <th className="px-4 py-3 text-left text-xs font-manrope font-semibold text-slate-600 w-20">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-manrope font-semibold text-slate-600 w-16">Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-manrope font-semibold text-slate-600 w-28">Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-manrope font-semibold text-slate-600 w-20">GST %</th>
                    <th className="px-4 py-3 text-right text-xs font-manrope font-semibold text-slate-600 w-28">Amount</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index} data-testid={`item-row-${index}`}>
                      <td className="px-4 py-3">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="w-full h-8 rounded border border-slate-200 px-2 text-sm"
                        >
                          <option value="">Select or type...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <Input
                          value={item.product_name}
                          onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                          placeholder="Product name"
                          className="mt-1 h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="h-8 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.gst_rate}
                          onChange={(e) => handleItemChange(index, 'gst_rate', e.target.value)}
                          className="w-full h-8 rounded border border-slate-200 px-2 text-sm"
                        >
                          {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(calculateItemAmount(item))}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:bg-red-50 p-1"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Discount & Totals */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Discount */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="font-syne text-lg">Discount</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Value</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    disabled={!formData.discount_type}
                    placeholder={formData.discount_type === 'percentage' ? '10' : '500'}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="font-syne text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount {formData.discount_type === 'percentage' ? `(${formData.discount_value}%)` : ''}</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal after discount</span>
                  <span className="font-medium">{formatCurrency(subtotalAfterDiscount)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  {!isInterState ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">CGST</span>
                        <span>{formatCurrency(cgst)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">SGST</span>
                        <span>{formatCurrency(sgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">IGST</span>
                      <span>{formatCurrency(igst)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-syne font-bold text-lg">Total</span>
                  <span className="font-syne font-bold text-lg text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/invoices')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-hover text-white" data-testid="save-invoice-button">
            {saving ? 'Creating...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
