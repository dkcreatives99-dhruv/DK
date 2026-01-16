import React, { useEffect, useState } from 'react';
import { businessAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const AdminSettings = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', state: '', pincode: '',
    gstin: '', phone: '', email: '', logo_url: ''
  });

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const data = await businessAPI.get();
      if (data) {
        setBusiness(data);
        setFormData({
          name: data.name || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          gstin: data.gstin || '',
          phone: data.phone || '',
          email: data.email || '',
          logo_url: data.logo_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
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
      fetchBusiness();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-settings">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-syne font-bold text-slate-900">Business Settings</h1>
        <p className="text-slate-500 font-manrope text-sm mt-1">Configure your business profile for invoices</p>
      </div>

      <Card className="border-slate-200 max-w-2xl">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="font-syne font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Business Name *</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="DK Kinetic Digital LLP" data-testid="business-name-input" />
            </div>

            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">GSTIN *</label>
              <Input value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })} required placeholder="06AAAAA0000A1Z5" maxLength={15} data-testid="business-gstin-input" />
              <p className="text-xs text-slate-500 mt-1">Your 15-digit GST Identification Number</p>
            </div>

            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Address</label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">City</label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Rohtak" />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">State *</label>
                <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" data-testid="business-state-select">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Pincode</label>
                <Input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} placeholder="124001" maxLength={6} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Phone</label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="business@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Logo URL (Optional)</label>
              <Input value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-hover text-white rounded-lg" data-testid="save-settings-button">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Settings
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-slate-200 max-w-2xl">
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
              <p className="font-manrope font-medium text-slate-900">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
