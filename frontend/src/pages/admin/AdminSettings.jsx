import React, { useEffect, useState } from 'react';
import { businessAPI, bankAccountsAPI, ledgerSettingsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Building2, Save, Plus, Pencil, Trash2, CreditCard, Wallet, Star } from 'lucide-react';

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
  const [ledgerSettings, setLedgerSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', state: '', pincode: '',
    gstin: '', phone: '', email: '', logo_url: '', state_code: '',
    jurisdiction: '', signatory_name: '', signatory_designation: ''
  });
  
  const [bankFormData, setBankFormData] = useState({
    bank_name: '', account_number: '', ifsc_code: '', branch_name: '',
    account_type: 'Current', is_primary: false
  });
  
  const [ledgerFormData, setLedgerFormData] = useState({
    opening_balance: '0',
    opening_balance_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [businessData, bankData, ledgerData] = await Promise.all([
        businessAPI.get(),
        bankAccountsAPI.getAll(),
        ledgerSettingsAPI.get()
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
      
      if (ledgerData) {
        setLedgerSettings(ledgerData);
        setLedgerFormData({
          opening_balance: ledgerData.opening_balance?.toString() || '0',
          opening_balance_date: ledgerData.opening_balance_date || new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (stateName) => {
    const stateObj = INDIAN_STATES.find(s => s.name === stateName);
    setFormData({ 
      ...formData, 
      state: stateName, 
      state_code: stateObj?.code || '' 
    });
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

  const handleLedgerSubmit = async (e) => {
    e.preventDefault();
    try {
      await ledgerSettingsAPI.update({
        opening_balance: parseFloat(ledgerFormData.opening_balance) || 0,
        opening_balance_date: ledgerFormData.opening_balance_date
      });
      toast.success('Ledger settings saved');
      fetchData();
    } catch (error) {
      toast.error('Failed to save ledger settings');
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
        is_primary: account.is_primary
      });
    } else {
      setEditingBankId(null);
      setBankFormData({
        bank_name: '', account_number: '', ifsc_code: '', branch_name: '',
        account_type: 'Current', is_primary: bankAccounts.length === 0
      });
    }
    setBankDialogOpen(true);
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBankId) {
        await bankAccountsAPI.update(editingBankId, bankFormData);
        toast.success('Bank account updated');
      } else {
        await bankAccountsAPI.create(bankFormData);
        toast.success('Bank account added');
      }
      setBankDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save bank account');
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

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-settings">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-syne font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 font-manrope text-sm mt-1">Configure your business profile, bank accounts, and ledger</p>
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jurisdiction</label>
                <Input value={formData.jurisdiction} onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })} placeholder="Subject to Delhi Jurisdiction" />
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
          {/* Ledger Settings */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-600" />
                Opening Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleLedgerSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Opening Balance (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={ledgerFormData.opening_balance}
                      onChange={(e) => setLedgerFormData({ ...ledgerFormData, opening_balance: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">As of Date</label>
                    <Input
                      type="date"
                      value={ledgerFormData.opening_balance_date}
                      onChange={(e) => setLedgerFormData({ ...ledgerFormData, opening_balance_date: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">Set your starting balance for accurate ledger calculations.</p>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-2" /> Save Opening Balance
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Bank Accounts */}
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Bank Accounts
              </CardTitle>
              <Button size="sm" onClick={() => openBankDialog()} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {bankAccounts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No bank accounts added yet.</p>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {account.is_primary && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        <div>
                          <p className="font-medium text-slate-900">{account.bank_name}</p>
                          <p className="text-xs text-slate-500">A/C: {account.account_number} | IFSC: {account.ifsc_code}</p>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
    </div>
  );
};

export default AdminSettings;
