import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoicesAPI, businessAPI, bankAccountsAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Download, Printer, CreditCard, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';
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
  const paise = Math.round((num % 1) * 100);
  
  let result = '';
  if (crore) result += convertLessThanThousand(crore) + ' Crore ';
  if (lakh) result += convertLessThanThousand(lakh) + ' Lakh ';
  if (thousand) result += convertLessThanThousand(thousand) + ' Thousand ';
  if (remainder) result += convertLessThanThousand(remainder);
  
  result = result.trim() + ' Rupees';
  if (paise > 0) {
    result += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  
  return result + ' Only';
};

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  
  const [invoice, setInvoice] = useState(null);
  const [business, setBusiness] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_status: 'paid',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [invoiceData, businessData, bankData] = await Promise.all([
        invoicesAPI.getOne(id),
        businessAPI.get(),
        bankAccountsAPI.getAll()
      ]);
      
      setInvoice(invoiceData);
      setBusiness(businessData);
      setBankAccounts(bankData || []);
    } catch (error) {
      toast.error('Failed to load invoice');
      navigate('/admin/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      await invoicesAPI.updatePayment(id, paymentData);
      toast.success('Payment status updated');
      setPaymentDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update payment');
    }
  };

  const handleDelete = async () => {
    try {
      await invoicesAPI.delete(id);
      toast.success('Invoice deleted');
      navigate('/admin/invoices');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete invoice');
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      toast.info('Generating PDF...');
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
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
  const primaryBank = bankAccounts.find(b => b.is_primary) || bankAccounts[0];

  return (
    <div className="space-y-6" data-testid="view-invoice">
      {/* Header - Hidden during print */}
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
              {invoice.is_deleted && (
                <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">Deleted</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!invoice.is_deleted && invoice.payment_status !== 'paid' && (
            <Button 
              onClick={() => navigate('/admin/income')} 
              variant="outline" 
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <CreditCard className="w-4 h-4 mr-2" /> Record Payment
            </Button>
          )}
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={handleDownloadPDF} className="bg-primary hover:bg-primary-hover text-white" data-testid="download-pdf-button">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          {!invoice.is_deleted && (
            <Button onClick={() => setDeleteDialogOpen(true)} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Document - Professional Layout */}
      <Card className="border-slate-200 print:border-0 print:shadow-none">
        <CardContent className="p-0" ref={invoiceRef}>
          <div className="bg-white p-8 min-h-[297mm]">
            {/* Invoice Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h1 className="text-2xl font-bold text-slate-900">{business?.name || 'Your Business'}</h1>
              <p className="text-sm text-slate-600 mt-1">
                {business?.address && `${business.address}, `}
                {business?.city}, {business?.state} {business?.pincode}
              </p>
              {business?.gstin && <p className="text-sm font-medium text-slate-700 mt-1">GSTIN: {business.gstin}</p>}
              {business?.email && <p className="text-sm text-slate-600">{business.email} | {business?.phone}</p>}
            </div>

            {/* Tax Invoice Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold border-2 border-slate-800 inline-block px-8 py-2">TAX INVOICE</h2>
            </div>

            {/* Invoice Details Grid */}
            <div className="grid grid-cols-2 gap-0 border border-slate-300 mb-6">
              <div className="border-r border-b border-slate-300 p-3">
                <p className="text-xs text-slate-500">Invoice No.</p>
                <p className="font-semibold">{invoice.invoice_number}</p>
              </div>
              <div className="border-b border-slate-300 p-3">
                <p className="text-xs text-slate-500">Dated</p>
                <p className="font-semibold">{formatDate(invoice.invoice_date)}</p>
              </div>
              <div className="border-r border-slate-300 p-3">
                <p className="text-xs text-slate-500">Place of Supply</p>
                <p className="font-semibold">{invoice.customer?.state || business?.state}</p>
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-500">State Code</p>
                <p className="font-semibold">{invoice.customer?.state_code || business?.state_code || '-'}</p>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="border border-slate-300 mb-6">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-300">
                <p className="font-semibold text-sm">Buyer (Bill to)</p>
              </div>
              <div className="p-3">
                <p className="font-bold text-lg">{invoice.customer?.name}</p>
                {invoice.customer?.address && <p className="text-sm text-slate-600">{invoice.customer.address}</p>}
                <p className="text-sm text-slate-600">
                  {invoice.customer?.city}, {invoice.customer?.state} {invoice.customer?.pincode}
                </p>
                {invoice.customer?.gstin && (
                  <p className="text-sm mt-1"><span className="font-medium">GSTIN:</span> {invoice.customer.gstin}</p>
                )}
                {invoice.customer?.phone && (
                  <p className="text-sm"><span className="font-medium">Phone:</span> {invoice.customer.phone}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-center w-10">SI No.</th>
                    <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-left">Particulars</th>
                    <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-center w-20">HSN/SAC</th>
                    <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-center w-16">Qty</th>
                    <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-right w-24">Rate</th>
                    {(invoice.item_discount_total || 0) > 0 && (
                      <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-right w-20">Disc.</th>
                    )}
                    <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-right w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="border border-slate-300 px-2 py-2 text-sm text-center">{index + 1}</td>
                      <td className="border border-slate-300 px-2 py-2 text-sm">
                        <p className="font-medium">{item.product_name}</p>
                        {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-sm text-center">{item.hsn_code || '-'}</td>
                      <td className="border border-slate-300 px-2 py-2 text-sm text-center">{item.quantity} {item.unit}</td>
                      <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(item.rate)}</td>
                      {(invoice.item_discount_total || 0) > 0 && (
                        <td className="border border-slate-300 px-2 py-2 text-sm text-right text-red-600">
                          {item.discount_amount > 0 ? `-${formatCurrency(item.discount_amount)}` : '-'}
                        </td>
                      )}
                      <td className="border border-slate-300 px-2 py-2 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tax Breakup Table */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-center" rowSpan={2}>HSN/SAC</th>
                    <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-right" rowSpan={2}>Taxable Value</th>
                    {!isInterState ? (
                      <>
                        <th className="border border-slate-300 px-2 py-1 text-xs font-semibold text-center" colSpan={2}>Central Tax</th>
                        <th className="border border-slate-300 px-2 py-1 text-xs font-semibold text-center" colSpan={2}>State Tax</th>
                      </>
                    ) : (
                      <th className="border border-slate-300 px-2 py-1 text-xs font-semibold text-center" colSpan={2}>Integrated Tax</th>
                    )}
                    <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-right" rowSpan={2}>Total Tax</th>
                  </tr>
                  <tr className="bg-slate-50">
                    {!isInterState ? (
                      <>
                        <th className="border border-slate-300 px-2 py-1 text-xs font-semibold text-center">Rate</th>
                        <th className="border border-slate-300 px-2 py-1 text-xs font-semibold text-right">Amount</th>
                        <th className="border border-slate-300 px-2 py-1 text-xs font-semibold text-center">Rate</th>
                        <th className="border border-slate-300 px-2 py-1 text-xs font-semibold text-right">Amount</th>
                      </>
                    ) : (
                      <>
                        <th className="border border-slate-300 px-2 py-1 text-xs font-semibold text-center">Rate</th>
                        <th className="border border-slate-300 px-2 py-1 text-xs font-semibold text-right">Amount</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, index) => {
                    const gstRate = item.gst_rate || 0;
                    const halfRate = gstRate / 2;
                    const halfAmount = (item.gst_amount || 0) / 2;
                    return (
                      <tr key={index}>
                        <td className="border border-slate-300 px-2 py-2 text-sm text-center">{item.hsn_code || '-'}</td>
                        <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(item.amount)}</td>
                        {!isInterState ? (
                          <>
                            <td className="border border-slate-300 px-2 py-2 text-sm text-center">{halfRate}%</td>
                            <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(halfAmount)}</td>
                            <td className="border border-slate-300 px-2 py-2 text-sm text-center">{halfRate}%</td>
                            <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(halfAmount)}</td>
                          </>
                        ) : (
                          <>
                            <td className="border border-slate-300 px-2 py-2 text-sm text-center">{gstRate}%</td>
                            <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(item.gst_amount)}</td>
                          </>
                        )}
                        <td className="border border-slate-300 px-2 py-2 text-sm text-right font-medium">{formatCurrency(item.gst_amount)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-semibold">
                    <td className="border border-slate-300 px-2 py-2 text-sm">Total</td>
                    <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(invoice.taxable_amount || invoice.subtotal_after_item_discount)}</td>
                    {!isInterState ? (
                      <>
                        <td className="border border-slate-300 px-2 py-2 text-sm text-center">-</td>
                        <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(invoice.cgst)}</td>
                        <td className="border border-slate-300 px-2 py-2 text-sm text-center">-</td>
                        <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(invoice.sgst)}</td>
                      </>
                    ) : (
                      <>
                        <td className="border border-slate-300 px-2 py-2 text-sm text-center">-</td>
                        <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(invoice.igst)}</td>
                      </>
                    )}
                    <td className="border border-slate-300 px-2 py-2 text-sm text-right">{formatCurrency(invoice.total_gst)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-between gap-6 mb-6">
              {/* Amount in Words */}
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Amount Chargeable (in words)</p>
                <p className="font-semibold text-sm border-b border-slate-300 pb-2">
                  Indian {numberToWords(Math.round(invoice.total_amount * 100) / 100)}
                </p>
                <p className="text-xs text-slate-500 mt-3 mb-1">Tax Amount (in words)</p>
                <p className="font-semibold text-sm">
                  Indian {numberToWords(Math.round(invoice.total_gst * 100) / 100)}
                </p>
              </div>
              
              {/* Summary */}
              <div className="w-64">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-slate-600">Subtotal</td>
                      <td className="py-1 text-right">{formatCurrency(invoice.subtotal)}</td>
                    </tr>
                    {(invoice.item_discount_total || 0) > 0 && (
                      <tr className="text-red-600">
                        <td className="py-1">Item Discount</td>
                        <td className="py-1 text-right">-{formatCurrency(invoice.item_discount_total)}</td>
                      </tr>
                    )}
                    {(invoice.discount_amount || 0) > 0 && (
                      <tr className="text-red-600">
                        <td className="py-1">Invoice Discount {invoice.discount_type === 'percentage' ? `(${invoice.discount_value}%)` : ''}</td>
                        <td className="py-1 text-right">-{formatCurrency(invoice.discount_amount)}</td>
                      </tr>
                    )}
                    {!isInterState ? (
                      <>
                        <tr>
                          <td className="py-1 text-slate-600">CGST</td>
                          <td className="py-1 text-right">{formatCurrency(invoice.cgst)}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-600">SGST</td>
                          <td className="py-1 text-right">{formatCurrency(invoice.sgst)}</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td className="py-1 text-slate-600">IGST</td>
                        <td className="py-1 text-right">{formatCurrency(invoice.igst)}</td>
                      </tr>
                    )}
                    <tr className="border-t border-slate-300 font-bold text-lg">
                      <td className="pt-2">Grand Total</td>
                      <td className="pt-2 text-right">{formatCurrency(invoice.total_amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bank Details & Signatory */}
            <div className="grid grid-cols-2 gap-6 border-t border-slate-300 pt-4">
              {/* Bank Details */}
              <div>
                <p className="font-semibold text-sm mb-2">Company's Bank Details</p>
                {primaryBank ? (
                  <div className="text-sm">
                    <p><span className="text-slate-500">Bank Name:</span> {primaryBank.bank_name}</p>
                    <p><span className="text-slate-500">A/c No.:</span> {primaryBank.account_number}</p>
                    <p><span className="text-slate-500">Branch & IFSC:</span> {primaryBank.branch_name} & {primaryBank.ifsc_code}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No bank account configured</p>
                )}
              </div>
              
              {/* Signatory */}
              <div className="text-right">
                <p className="font-semibold text-sm">for {business?.name}</p>
                <div className="h-16"></div>
                <p className="text-sm font-medium">{business?.signatory_name || 'Authorised Signatory'}</p>
                {business?.signatory_designation && (
                  <p className="text-xs text-slate-500">{business.signatory_designation}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
              {business?.jurisdiction && <p className="font-medium">SUBJECT TO {business.jurisdiction.toUpperCase()} JURISDICTION</p>}
              <p className="mt-1">This is a Computer Generated Invoice</p>
            </div>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
              <Input
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
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

      {/* Delete Dialog */}
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
              Are you sure you want to delete invoice <strong>{invoice?.invoice_number}</strong>?
            </p>
            <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
              <p>This invoice will be soft-deleted and can be restored later.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Delete Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          [data-testid="view-invoice"] { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
          [data-testid="view-invoice"] * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .print\\:border-0 { border: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          @page { margin: 10mm; size: A4; }
        }
      `}</style>
    </div>
  );
};

export default ViewInvoice;
