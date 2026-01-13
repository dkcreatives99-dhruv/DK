import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, User, MapPin, Phone, Mail, Building2 } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const AdminCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', state: '', pincode: '',
    gstin: '', phone: '', email: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    if (!user) return;
    try {
      const { data, error } = await getCustomers(user.id);
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        gstin: customer.gstin || '',
        phone: customer.phone || '',
        email: customer.email || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', address: '', city: '', state: '', pincode: '', gstin: '', phone: '', email: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        const { error } = await updateCustomer(editingCustomer.id, formData);
        if (error) throw error;
        toast.success('Customer updated successfully');
      } else {
        const { error } = await createCustomer({ ...formData, user_id: user.id });
        if (error) throw error;
        toast.success('Customer created successfully');
      }
      setIsDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const { error } = await deleteCustomer(id);
      if (error) throw error;
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading customers...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-customers">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">Manage your customer database</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary-hover text-white rounded-lg" data-testid="add-customer-button">
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      {/* Customer Cards */}
      {customers.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-manrope">No customers yet</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4 bg-primary text-white">Add Your First Customer</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Card key={customer.id} className="border-slate-200 hover:shadow-md transition-shadow" data-testid={`customer-card-${customer.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-manrope font-semibold text-slate-900">{customer.name}</h3>
                      {customer.gstin && <p className="text-xs text-slate-500">GSTIN: {customer.gstin}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => handleOpenDialog(customer)} variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" data-testid={`edit-customer-${customer.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(customer.id)} variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" data-testid={`delete-customer-${customer.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {customer.address && (
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{customer.address}{customer.city && `, ${customer.city}`}{customer.state && `, ${customer.state}`} {customer.pincode}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-syne">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Name *</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Customer name" data-testid="customer-name-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Phone</label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">GSTIN</label>
              <Input value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })} placeholder="22AAAAA0000A1Z5" maxLength={15} />
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Address</label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">City</label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">State</label>
                <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select</option>
                  {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Pincode</label>
                <Input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} placeholder="110001" maxLength={6} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary-hover text-white" data-testid="save-customer-button">
                {editingCustomer ? 'Update' : 'Add'} Customer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
