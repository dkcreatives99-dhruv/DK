import { supabase } from '@/lib/supabaseClient';

// ==================== BUSINESS ====================
export const getBusiness = async (userId) => {
  const { data, error } = await supabase
    .from('business')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const createBusiness = async (businessData) => {
  const { data, error } = await supabase
    .from('business')
    .insert([businessData])
    .select()
    .single();
  return { data, error };
};

export const updateBusiness = async (id, businessData) => {
  const { data, error } = await supabase
    .from('business')
    .update({ ...businessData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ==================== CUSTOMERS ====================
export const getCustomers = async (userId) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createCustomer = async (customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();
  return { data, error };
};

export const updateCustomer = async (id, customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .update({ ...customerData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteCustomer = async (id) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  return { error };
};

// ==================== PRODUCTS ====================
export const getProducts = async (userId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();
  return { data, error };
};

export const updateProduct = async (id, productData) => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  return { error };
};

// ==================== INVOICES ====================
export const getInvoices = async (userId) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers (name, email, gstin, state)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getInvoice = async (id) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers (*),
      invoice_items (*)
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

export const getNextInvoiceNumber = async (userId) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) return { number: 'INV-00001', error };
  
  if (!data || data.length === 0) {
    return { number: 'INV-00001', error: null };
  }
  
  const lastNumber = data[0].invoice_number;
  const numPart = parseInt(lastNumber.split('-')[1]) + 1;
  const newNumber = `INV-${numPart.toString().padStart(5, '0')}`;
  
  return { number: newNumber, error: null };
};

export const createInvoice = async (invoiceData, items) => {
  // Insert invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([invoiceData])
    .select()
    .single();
  
  if (invoiceError) return { data: null, error: invoiceError };
  
  // Insert invoice items
  const itemsWithInvoiceId = items.map(item => ({
    ...item,
    invoice_id: invoice.id
  }));
  
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsWithInvoiceId);
  
  if (itemsError) return { data: null, error: itemsError };
  
  return { data: invoice, error: null };
};

export const updateInvoice = async (id, invoiceData) => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ ...invoiceData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const updateInvoicePayment = async (id, paymentData) => {
  const { data, error } = await supabase
    .from('invoices')
    .update({
      payment_status: paymentData.payment_status,
      payment_date: paymentData.payment_date,
      payment_method: paymentData.payment_method,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ==================== EXPENSES ====================
export const getExpenses = async (userId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return { data, error };
};

export const createExpense = async (expenseData) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseData])
    .select()
    .single();
  return { data, error };
};

export const updateExpense = async (id, expenseData) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({ ...expenseData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteExpense = async (id) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  return { error };
};

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = async (userId) => {
  try {
    const [invoicesRes, customersRes, productsRes, expensesRes] = await Promise.all([
      supabase.from('invoices').select('total_amount, payment_status').eq('user_id', userId),
      supabase.from('customers').select('id').eq('user_id', userId),
      supabase.from('products').select('id').eq('user_id', userId),
      supabase.from('expenses').select('amount').eq('user_id', userId)
    ]);

    const invoices = invoicesRes.data || [];
    const totalRevenue = invoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);
    
    const totalExpenses = (expensesRes.data || [])
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    return {
      totalInvoices: invoices.length,
      totalRevenue,
      totalCustomers: (customersRes.data || []).length,
      totalProducts: (productsRes.data || []).length,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      pendingPayments: invoices.filter(inv => inv.payment_status !== 'paid').length
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
};

// ==================== LEDGER DATA ====================
export const getLedgerData = async (userId) => {
  try {
    const [invoicesRes, expensesRes] = await Promise.all([
      supabase
        .from('invoices')
        .select('*, customers(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
    ]);

    const invoices = invoicesRes.data || [];
    const expenses = expensesRes.data || [];

    const totalIncome = invoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);
    
    const totalExpenses = expenses
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    const pendingAmount = invoices
      .filter(inv => inv.payment_status !== 'paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      pendingAmount,
      recentIncome: invoices.filter(inv => inv.payment_status === 'paid').slice(0, 5),
      recentExpenses: expenses.slice(0, 5),
      allInvoices: invoices
    };
  } catch (error) {
    console.error('Error fetching ledger data:', error);
    return null;
  }
};
