import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersAPI, productsAPI, businessAPI, invoicesAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, Save, Percent, IndianRupee } from 'lucide-react';

const CreateInvoice = () => {
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
    due_date: '',
    discount_type: '',
    discount_value: '',
    notes: '',
    terms: '',
    status: 'issued'
  });

  const [items, setItems] = useState([
    { product_id: '', product_name: '', description: '', hsn_code: '', quantity: 1, unit: 'Nos', rate: 0, gst_rate: 18, discount_type: '', discount_value: 0 }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersData, productsData, businessData, invoiceNumData] = await Promise.all([
        customersAPI.getAll(),
        productsAPI.getAll(),
        businessAPI.get(),
        invoicesAPI.getNextNumber()
      ]);
      setCustomers(customersData || []);
      setProducts(productsData || []);
      setBusiness(businessData);
      setInvoiceNumber(invoiceNumData?.invoice_number || 'INV-00001');
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
    setItems([...items, { product_id: '', product_name: '', description: '', hsn_code: '', quantity: 1, unit: 'Nos', rate: 0, gst_rate: 18, discount_type: '', discount_value: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculate item-level amounts
  const calculateItemBaseAmount = (item) => parseFloat(item.quantity) * parseFloat(item.rate) || 0;
  
  const calculateItemDiscount = (item) => {
    const baseAmount = calculateItemBaseAmount(item);
    if (item.discount_type === 'percentage' && item.discount_value > 0) {
      return (baseAmount * parseFloat(item.discount_value)) / 100;
    } else if (item.discount_type === 'amount' && item.discount_value > 0) {
      return parseFloat(item.discount_value);
    }
    return 0;
  };

  const calculateItemAmount = (item) => calculateItemBaseAmount(item) - calculateItemDiscount(item);
  const calculateItemGst = (item) => (calculateItemAmount(item) * parseFloat(item.gst_rate)) / 100;
  const calculateItemTotal = (item) => calculateItemAmount(item) + calculateItemGst(item);

  // Totals
  const subtotal = items.reduce((sum, item) => sum + calculateItemBaseAmount(item), 0);
  const totalItemDiscount = items.reduce((sum, item) => sum + calculateItemDiscount(item), 0);
  const subtotalAfterItemDiscount = subtotal - totalItemDiscount;
  const totalItemGst = items.reduce((sum, item) => sum + calculateItemGst(item), 0);

  // Invoice-level discount
  const invoiceDiscountAmount = formData.discount_type === 'percentage'
    ? (subtotalAfterItemDiscount * parseFloat(formData.discount_value || 0)) / 100
    : parseFloat(formData.discount_value || 0);

  const taxableAmount = subtotalAfterItemDiscount - invoiceDiscountAmount;
  
  // Proportionally adjust GST after invoice discount
  const adjustedGst = subtotalAfterItemDiscount > 0 ? totalItemGst * (taxableAmount / subtotalAfterItemDiscount) : 0;

  // Determine GST type based on states
  const selectedCustomer = customers.find(c => c.id === formData.customer_id);
  const isInterState = selectedCustomer && business && selectedCustomer.state && business.state && selectedCustomer.state !== business.state;
  
  const cgst = isInterState ? 0 : adjustedGst / 2;
  const sgst = isInterState ? 0 : adjustedGst / 2;
  const igst = isInterState ? adjustedGst : 0;

  const totalAmount = taxableAmount + adjustedGst;

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
      const invoiceItems = items.map(item => ({
        product_id: item.product_id || null,
        product_name: item.product_name,
        description: item.description,
        hsn_code: item.hsn_code,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        rate: parseFloat(item.rate),
        gst_rate: parseFloat(item.gst_rate),
        discount_type: item.discount_type || null,
        discount_value: parseFloat(item.discount_value) || 0,
        discount_amount: calculateItemDiscount(item),
        amount: calculateItemAmount(item),
        gst_amount: calculateItemGst(item),
        total: calculateItemTotal(item)
      }));

      const invoiceData = {
        customer_id: formData.customer_id,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date || null,
        discount_type: formData.discount_type || null,
        discount_value: parseFloat(formData.discount_value) || 0,
        notes: formData.notes,
        terms: formData.terms,
        status: formData.status,
        items: invoiceItems
      };

      const data = await invoicesAPI.create(invoiceData);
      toast.success('Invoice created successfully');
      navigate(`/admin/invoices/${data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
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
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Date</label>
                <Input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="issued">Issued</option>
                </select>
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
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Product/Service</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 w-16">Qty</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 w-24">Rate</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 w-32">Item Discount</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 w-16">GST %</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 w-24">Amount</th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index} data-testid={`item-row-${index}`}>
                      <td className="px-3 py-3">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="w-full h-8 rounded border border-slate-200 px-2 text-sm mb-1"
                        >
                          <option value="">Select product...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <Input
                          value={item.product_name}
                          onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                          placeholder="Or type name"
                          className="h-7 text-sm"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="h-8 text-sm text-center"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="h-8 text-sm text-right"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <select
                            value={item.discount_type}
                            onChange={(e) => handleItemChange(index, 'discount_type', e.target.value)}
                            className="h-8 w-16 rounded border border-slate-200 px-1 text-xs"
                          >
                            <option value="">None</option>
                            <option value="percentage">%</option>
                            <option value="amount">₹</option>
                          </select>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.discount_value}
                            onChange={(e) => handleItemChange(index, 'discount_value', e.target.value)}
                            disabled={!item.discount_type}
                            placeholder="0"
                            className="h-8 w-16 text-sm text-center"
                          />
                        </div>
                        {calculateItemDiscount(item) > 0 && (
                          <p className="text-xs text-red-500 mt-1">-{formatCurrency(calculateItemDiscount(item))}</p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={item.gst_rate}
                          onChange={(e) => handleItemChange(index, 'gst_rate', e.target.value)}
                          className="w-full h-8 rounded border border-slate-200 px-2 text-sm"
                        >
                          {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <p className="font-medium text-slate-900">{formatCurrency(calculateItemAmount(item))}</p>
                        <p className="text-xs text-slate-500">+{formatCurrency(calculateItemGst(item))} GST</p>
                      </td>
                      <td className="px-3 py-3">
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

        {/* Discount, Notes & Totals */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Discount & Notes */}
          <div className="space-y-6">
            {/* Invoice Discount */}
            <Card className="border-slate-200">
              <CardHeader className="border-b border-slate-100 py-3">
                <CardTitle className="font-syne text-base">Invoice Discount</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
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
              </CardContent>
            </Card>

            {/* Notes & Terms */}
            <Card className="border-slate-200">
              <CardHeader className="border-b border-slate-100 py-3">
                <CardTitle className="font-syne text-base">Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes visible to customer..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Terms & Conditions</label>
                  <Textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    placeholder="Payment terms, etc..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
          <Card className="border-slate-200 h-fit">
            <CardHeader className="border-b border-slate-100 py-3">
              <CardTitle className="font-syne text-base">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal (before discounts)</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {totalItemDiscount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Item Discounts</span>
                    <span>-{formatCurrency(totalItemDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal after item discounts</span>
                  <span className="font-medium">{formatCurrency(subtotalAfterItemDiscount)}</span>
                </div>
                {invoiceDiscountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Invoice Discount {formData.discount_type === 'percentage' ? `(${formData.discount_value}%)` : ''}</span>
                    <span>-{formatCurrency(invoiceDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span className="text-slate-600">Taxable Amount</span>
                  <span className="font-medium">{formatCurrency(taxableAmount)}</span>
                </div>
                
                <div className="border-t border-slate-100 pt-2 space-y-1">
                  {!isInterState ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST</span>
                        <span>{formatCurrency(cgst)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST</span>
                        <span>{formatCurrency(sgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST</span>
                      <span>{formatCurrency(igst)}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t-2 border-slate-200 pt-3 flex justify-between">
                  <span className="font-syne font-bold text-lg">Grand Total</span>
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
