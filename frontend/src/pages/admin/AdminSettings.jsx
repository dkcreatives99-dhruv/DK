import React, { useEffect, useState } from 'react';
import { businessAPI, bankAccountsAPI, bankTransfersAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Building2, Save, Plus, Pencil, Trash2, CreditCard, Star, ArrowRightLeft, Lock, AlertCircle } from 'lucide-react';

const INDIAN_STATES = [
  { name: 'Andhra Pradesh', code: '37' }, { name: 'Arunachal Pradesh', code: '12' },
  { name: 'Assam', code: '18' }, { name: 'Bihar', code: '10' },
  { name: 'Chhattisgarh', code: '22' }, { name: 'Goa', code: '30' },
  { name: 'Gujarat', code: '24' }, { name: 'Haryana', code: '06' },
  { name: 'Himachal Pradesh', code: '02' }, { name: 'Jharkhand', code: '20' },
  { name: 'Karnataka', code: '29' }, { name: 'Kerala', code: '32' },
  { name: 'Madhya Pradesh', code: '23' }, { name: 'Maharashtra', code: '27' },
  { name: 'Manipur', code: '14' }, { name: 'Meghalaya', code: '17' },
  { name: 'Mizoram', code: '15' }, { name: 'Nagaland', code: '13' },
  { name: 'Odisha', code: '21' }, { name: 'Punjab', code: '03' },
  { name: 'Rajasthan', code: '08' }, { name: 'Sikkim', code: '11' },
  { name: 'Tamil Nadu', code: '33' }, { name: 'Telangana', code: '36' },
  { name: 'Tripura', code: '16' }, { name: 'Uttar Pradesh', code: '09' },
  { name: 'Uttarakhand', code: '05' }, { name: 'West Bengal', code: '19' },
  { name: 'Delhi', code: '07' }, { name: 'Jammu and Kashmir', code: '01' },
  { name: 'Ladakh', code: '38' }
];

const ACCOUNT_TYPES = ['Current', 'Savings', 'Cash'];

const AdminSettings = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankTransfers, setBankTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', state: '', pincode: '',
    gstin: '', phone: '', email: '', logo_url: '', state_code: '',
    jurisdiction: '', signatory_name: '', signatory_designation: ''
  });
  
  const [bankFormData, setBankFormData] = useState({
    bank_name: '', account_number: '', ifsc_code: '', branch_name: '',
    account_type: 'Current', is_primary: false, opening_balance: '', opening_balance_date: ''
  });

  const [transferFormData, setTransferFormData] = useState({
    from_bank_id: '', to_bank_id: '', amount: '',
    transfer_date: new Date().toISOString().split('T')[0],
    reference_number: '', remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [businessData, bankData, transfersData] = await Promise.all([
        businessAPI.get(),
        bankAccountsAPI.getAll(),
        bankTransfersAPI.getAll()
      ]);
      
      if (businessData) {
        setBusiness(businessData);
        setFormData({
          name: businessData.name || '',
          address: businessData.address || '',
          city: businessData.city || '',
          state: businessData.state || '',
          pincode: businessData.pincode || '',
          gstin: businessData.gstin || '',
          phone: businessData.phone || '',
          email: businessData.email || '',
          logo_url: businessData.logo_url || '',
          state_code: businessData.state_code || '',
          jurisdiction: businessData.jurisdiction || '',
          signatory_name: businessData.signatory_name || '',
          signatory_designation: businessData.signatory_designation || ''
        });
      }
      
      setBankAccounts(bankData || []);
      setBankTransfers(transfersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (stateName) => {
    const stateObj = INDIAN_STATES.find(s => s.name === stateName);
    setFormData({ ...formData, state: stateName, state_code: stateObj?.code || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (business) {
        await businessAPI.update(formData);
      } else {
        await businessAPI.create(formData);
      }
      toast.success('Business settings saved successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const openBankDialog = (account = null) => {
    if (account) {
      setEditingBankId(account.id);
      setBankFormData({
        bank_name: account.bank_name,
        account_number: account.account_number,
        ifsc_code: account.ifsc_code,
        branch_name: account.branch_name || '',
        account_type: account.account_type,
        is_primary: account.is_primary,
        opening_balance: account.opening_balance?.toString() || '0',
        opening_balance_date: account.opening_balance_date || ''
      });
    } else {
      setEditingBankId(null);
      setBankFormData({
        bank_name: '', account_number: '', ifsc_code: '', branch_name: '',
        account_type: 'Current', is_primary: bankAccounts.length === 0,
        opening_balance: '', opening_balance_date: new Date().toISOString().split('T')[0]
      });
    }
    setBankDialogOpen(true);
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    
    if (editingBankId) {
      // Update - don't send opening balance
      try {
        await bankAccountsAPI.update(editingBankId, {
          bank_name: bankFormData.bank_name,
          account_number: bankFormData.account_number,
          ifsc_code: bankFormData.ifsc_code,
          branch_name: bankFormData.branch_name,
          account_type: bankFormData.account_type,
          is_primary: bankFormData.is_primary
        });
        toast.success('Bank account updated');
        setBankDialogOpen(false);
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to update bank account');
      }
    } else {
      // Create - require opening balance
      if (!bankFormData.opening_balance || bankFormData.opening_balance === '') {
        toast.error('Opening balance is mandatory');
        return;
      }
      if (!bankFormData.opening_balance_date) {
        toast.error('Opening balance date is mandatory');
        return;
      }
      
      try {
        await bankAccountsAPI.create({
          ...bankFormData,
          opening_balance: parseFloat(bankFormData.opening_balance)
        });
        toast.success('Bank account added');
        setBankDialogOpen(false);
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to add bank account');
      }
    }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    try {
      await bankAccountsAPI.delete(id);
      toast.success('Bank account deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete bank account');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    
    if (transferFormData.from_bank_id === transferFormData.to_bank_id) {
      toast.error('Cannot transfer to the same account');
      return;
    }
    
    try {
      await bankTransfersAPI.create({
        ...transferFormData,
        amount: parseFloat(transferFormData.amount)
      });
      toast.success('Transfer recorded');
      setTransferDialogOpen(false);
      setTransferFormData({
        from_bank_id: '', to_bank_id: '', amount: '',
        transfer_date: new Date().toISOString().split('T')[0],
        reference_number: '', remarks: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record transfer');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-settings">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-syne font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 font-manrope text-sm mt-1">Configure business profile and bank accounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name *</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Your Business Name" data-testid="business-name-input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN *</label>
                  <Input value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })} required placeholder="06AAAAA0000A1Z5" maxLength={15} data-testid="business-gstin-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State Code</label>
                  <Input value={formData.state_code} onChange={(e) => setFormData({ ...formData, state_code: e.target.value })} placeholder="06" maxLength={2} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                  <select value={formData.state} onChange={(e) => handleStateChange(e.target.value)} required className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" data-testid="business-state-select">
                    <option value="">Select</option>
                    {INDIAN_STATES.map(state => <option key={state.code} value={state.name}>{state.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                  <Input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} placeholder="000000" maxLength={6} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="business@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Signatory Name</label>
                  <Input value={formData.signatory_name} onChange={(e) => setFormData({ ...formData, signatory_name: e.target.value })} placeholder="Authorized Person Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Signatory Designation</label>
                  <Input value={formData.signatory_designation} onChange={(e) => setFormData({ ...formData, signatory_designation: e.target.value })} placeholder="Partner / Director" />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-hover text-white rounded-lg" data-testid="save-settings-button">
                  {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Business Info</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Bank Accounts */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Bank Accounts
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setTransferDialogOpen(true)} disabled={bankAccounts.length < 2}>
                  <ArrowRightLeft className="w-4 h-4 mr-1" /> Transfer
                </Button>
                <Button size="sm" onClick={() => openBankDialog()} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Total Balance */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">Total Balance (All Accounts)</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalBalance)}</p>
              </div>
              
              {bankAccounts.length === 0 ? (
                <div className="text-center py-6">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No bank accounts added yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first bank account to start tracking finances.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map(account => (
                    <div key={account.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {account.is_primary && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mt-1" />}
                          <div>
                            <p className="font-medium text-slate-900">{account.bank_name}</p>
                            <p className="text-xs text-slate-500">A/C: ****{account.account_number.slice(-4)} | {account.account_type}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <div>
                                <p className="text-xs text-slate-400">Opening</p>
                                <p className="text-sm font-medium text-slate-600">{formatCurrency(account.opening_balance)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">Current</p>
                                <p className="text-sm font-bold text-blue-600">{formatCurrency(account.current_balance)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openBankDialog(account)} className="h-8 w-8 p-0">
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteBank(account.id)} className="h-8 w-8 p-0">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          {bankTransfers.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="font-syne font-bold text-slate-900 text-base flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                  Recent Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {bankTransfers.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                      <div>
                        <p className="text-slate-700">{t.from_bank_name} → {t.to_bank_name}</p>
                        <p className="text-xs text-slate-400">{formatDate(t.transfer_date)}</p>
                      </div>
                      <p className="font-medium text-slate-900">{formatCurrency(t.amount)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Info */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="font-syne font-bold text-slate-900">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-syne font-bold text-lg">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bank Account Dialog */}
      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne">{editingBankId ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name *</label>
              <Input
                value={bankFormData.bank_name}
                onChange={(e) => setBankFormData({ ...bankFormData, bank_name: e.target.value })}
                required
                placeholder="HDFC Bank"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Number *</label>
                <Input
                  value={bankFormData.account_number}
                  onChange={(e) => setBankFormData({ ...bankFormData, account_number: e.target.value })}
                  required
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code *</label>
                <Input
                  value={bankFormData.ifsc_code}
                  onChange={(e) => setBankFormData({ ...bankFormData, ifsc_code: e.target.value.toUpperCase() })}
                  required
                  placeholder="HDFC0001234"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                <Input
                  value={bankFormData.branch_name}
                  onChange={(e) => setBankFormData({ ...bankFormData, branch_name: e.target.value })}
                  placeholder="Main Branch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
                <select
                  value={bankFormData.account_type}
                  onChange={(e) => setBankFormData({ ...bankFormData, account_type: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {ACCOUNT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
            
            {/* Opening Balance - Only for new accounts */}
            {!editingBankId && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700">Opening Balance (Required)</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-blue-600 mb-1">Amount (₹) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bankFormData.opening_balance}
                      onChange={(e) => setBankFormData({ ...bankFormData, opening_balance: e.target.value })}
                      required
                      placeholder="50000"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-blue-600 mb-1">As of Date *</label>
                    <Input
                      type="date"
                      value={bankFormData.opening_balance_date}
                      onChange={(e) => setBankFormData({ ...bankFormData, opening_balance_date: e.target.value })}
                      required
                      className="bg-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-blue-500 mt-2">Opening balance will be locked after account creation.</p>
              </div>
            )}
            
            {/* Show locked opening balance for existing accounts */}
            {editingBankId && (
              <div className="p-3 bg-slate-100 rounded-lg flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Opening Balance: <strong>{formatCurrency(parseFloat(bankFormData.opening_balance))}</strong></p>
                  <p className="text-xs text-slate-400">Opening balance is locked and cannot be changed</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={bankFormData.is_primary}
                onChange={(e) => setBankFormData({ ...bankFormData, is_primary: e.target.checked })}
                className="rounded border-slate-300"
              />
              <label htmlFor="is_primary" className="text-sm text-slate-700">Set as primary account</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setBankDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {editingBankId ? 'Update' : 'Add'} Account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne">Transfer Between Accounts</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Account *</label>
              <select
                value={transferFormData.from_bank_id}
                onChange={(e) => setTransferFormData({ ...transferFormData, from_bank_id: e.target.value })}
                required
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Select Source</option>
                {bankAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank_name} (Bal: {formatCurrency(acc.current_balance)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Account *</label>
              <select
                value={transferFormData.to_bank_id}
                onChange={(e) => setTransferFormData({ ...transferFormData, to_bank_id: e.target.value })}
                required
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Select Destination</option>
                {bankAccounts.filter(acc => acc.id !== transferFormData.from_bank_id).map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank_name} (Bal: {formatCurrency(acc.current_balance)})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={transferFormData.amount}
                  onChange={(e) => setTransferFormData({ ...transferFormData, amount: e.target.value })}
                  required
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <Input
                  type="date"
                  value={transferFormData.transfer_date}
                  onChange={(e) => setTransferFormData({ ...transferFormData, transfer_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference Number</label>
              <Input
                value={transferFormData.reference_number}
                onChange={(e) => setTransferFormData({ ...transferFormData, reference_number: e.target.value })}
                placeholder="Transaction ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
              <Input
                value={transferFormData.remarks}
                onChange={(e) => setTransferFormData({ ...transferFormData, remarks: e.target.value })}
                placeholder="Notes"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Record Transfer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
