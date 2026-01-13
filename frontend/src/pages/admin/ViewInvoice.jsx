import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getInvoice, getBusiness, updateInvoicePayment } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Download, Printer, CreditCard, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Cheque', 'Other'];

// Number to words (Indian format)
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  if (num === 0) return 'Zero Rupees Only';
  
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = Math.floor(num % 1000);
  
  let result = '';
  if (crore) result += convertLessThanThousand(crore) + ' Crore ';
  if (lakh) result += convertLessThanThousand(lakh) + ' Lakh ';
  if (thousand) result += convertLessThanThousand(thousand) + ' Thousand ';
  if (remainder) result += convertLessThanThousand(remainder);
  
  return result.trim() + ' Rupees Only';
};

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const invoiceRef = useRef(null);
  
  const [invoice, setInvoice] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_status: 'paid',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: ''
  });

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    try {
      const [invoiceRes, businessRes] = await Promise.all([
        getInvoice(id),
        getBusiness(user.id)
      ]);
      
      if (invoiceRes.error) throw invoiceRes.error;
      setInvoice(invoiceRes.data);
      setBusiness(businessRes.data);
    } catch (error) {
      toast.error('Failed to load invoice');
      navigate('/admin/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      const { error } = await updateInvoicePayment(id, paymentData);
      if (error) throw error;
      toast.success('Payment status updated');
      setPaymentDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update payment');
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      toast.info('Generating PDF...');
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${invoice.invoice_number}.pdf`);
      toast.success('PDF downloaded');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      unpaid: 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${styles[status] || styles.unpaid}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="text-center py-12 text-slate-500">Invoice not found</div>;
  }

  const isInterState = invoice.igst > 0;

  return (
    <div className="space-y-6" data-testid="view-invoice">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/invoices')} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-syne font-bold text-slate-900">
              Invoice {invoice.invoice_number}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {getStatusBadge(invoice.payment_status)}
              <span className="text-slate-500 text-sm">{formatDate(invoice.invoice_date)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.payment_status !== 'paid' && (
            <Button onClick={() => setPaymentDialogOpen(true)} variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" data-testid="mark-paid-button">
              <CreditCard className="w-4 h-4 mr-2" /> Update Payment
            </Button>
          )}
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={handleDownloadPDF} className="bg-primary hover:bg-primary-hover text-white" data-testid="download-pdf-button">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <Card className="border-slate-200 print:border-0 print:shadow-none">
        <CardContent className="p-8" ref={invoiceRef}>
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-syne font-bold text-slate-900">{business?.name || 'Your Business'}</h2>
              <div className="text-sm text-slate-600 mt-2 space-y-0.5">
                {business?.address && <p>{business.address}</p>}
                <p>{business?.city}, {business?.state} {business?.pincode}</p>
                {business?.gstin && <p className="font-medium">GSTIN: {business.gstin}</p>}
                {business?.phone && <p>Phone: {business.phone}</p>}
                {business?.email && <p>Email: {business.email}</p>}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-3xl font-syne font-bold text-primary">INVOICE</h3>
              <p className="text-lg font-medium text-slate-700 mt-1">{invoice.invoice_number}</p>
              <p className="text-sm text-slate-500">Date: {formatDate(invoice.invoice_date)}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8 p-4 bg-slate-50 rounded-lg">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Bill To</h4>
            <p className="font-semibold text-slate-900">{invoice.customers?.name}</p>
            <div className="text-sm text-slate-600 mt-1 space-y-0.5">
              {invoice.customers?.address && <p>{invoice.customers.address}</p>}
              <p>{invoice.customers?.city}, {invoice.customers?.state} {invoice.customers?.pincode}</p>
              {invoice.customers?.gstin && <p className="font-medium">GSTIN: {invoice.customers.gstin}</p>}
              {invoice.customers?.phone && <p>Phone: {invoice.customers.phone}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border border-slate-200">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">HSN</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold">Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold">GST</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.invoice_items || []).map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item.product_name}</p>
                      {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.hsn_code || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.rate)}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.gst_rate}%</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount {invoice.discount_type === 'percentage' ? `(${invoice.discount_value}%)` : ''}</span>
                    <span>-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                {!isInterState ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">CGST</span>
                      <span>{formatCurrency(invoice.cgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">SGST</span>
                      <span>{formatCurrency(invoice.sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-slate-600">IGST</span>
                    <span>{formatCurrency(invoice.igst)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-slate-200">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(invoice.total_amount)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-600">
                <span className="font-medium">Amount in Words: </span>
                {numberToWords(Math.round(invoice.total_amount))}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {invoice.payment_status === 'paid' && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Payment Received</p>
                <p className="text-sm text-green-600">
                  {invoice.payment_date && `Paid on ${formatDate(invoice.payment_date)}`}
                  {invoice.payment_method && ` via ${invoice.payment_method}`}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-2">Notes</h4>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
            <p>Thank you for your business!</p>
            <p className="mt-1">{business?.name}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne">Update Payment Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Status</label>
              <select
                value={paymentData.payment_status}
                onChange={(e) => setPaymentData({ ...paymentData, payment_status: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Payment Date</label>
              <Input
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Select method</option>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdatePayment} className="bg-green-600 hover:bg-green-700 text-white">
                Update Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #root { visibility: visible; }
          [data-testid="view-invoice"] { visibility: visible; }
          [data-testid="view-invoice"] * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .print\\:border-0 { border: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ViewInvoice;
