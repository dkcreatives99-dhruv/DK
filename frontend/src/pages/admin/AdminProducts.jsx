import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, IndianRupee, Percent } from 'lucide-react';

const UNITS = ['Nos', 'Hours', 'Days', 'Kg', 'Grams', 'Liters', 'Meters', 'Sq.ft', 'Units', 'Pieces', 'Sets'];
const GST_RATES = [0, 5, 12, 18, 28];

const AdminProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', hsn_code: '', unit: 'Nos', price: '', gst_rate: 18
  });

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const { data, error } = await getProducts(user.id);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        hsn_code: product.hsn_code || '',
        unit: product.unit || 'Nos',
        price: product.price || '',
        gst_rate: product.gst_rate || 18
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', hsn_code: '', unit: 'Nos', price: '', gst_rate: 18 });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, price: parseFloat(formData.price), gst_rate: parseFloat(formData.gst_rate) };
      if (editingProduct) {
        const { error } = await updateProduct(editingProduct.id, data);
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await createProduct({ ...data, user_id: user.id });
        if (error) throw error;
        toast.success('Product created successfully');
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await deleteProduct(id);
      if (error) throw error;
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading products...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-products">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-syne font-bold text-slate-900">Products & Services</h1>
          <p className="text-slate-500 font-manrope text-sm mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary-hover text-white rounded-lg" data-testid="add-product-button">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Product Cards */}
      {products.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-manrope">No products yet</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4 bg-primary text-white">Add Your First Product</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="border-slate-200 hover:shadow-md transition-shadow" data-testid={`product-card-${product.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-manrope font-semibold text-slate-900">{product.name}</h3>
                      {product.hsn_code && <p className="text-xs text-slate-500">HSN: {product.hsn_code}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => handleOpenDialog(product)} variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(product.id)} variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {product.description && <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-slate-900 font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    <span>{formatCurrency(product.price).replace('₹', '')}</span>
                    <span className="text-slate-400 text-sm font-normal">/ {product.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
                    <Percent className="w-3 h-3" />
                    <span>{product.gst_rate}% GST</span>
                  </div>
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
            <DialogTitle className="font-syne">{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Name *</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Product or service name" data-testid="product-name-input" />
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Description</label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">HSN/SAC Code</label>
                <Input value={formData.hsn_code} onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })} placeholder="998311" />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Unit</label>
                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  {UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">Price (₹) *</label>
                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required placeholder="1000" data-testid="product-price-input" />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-slate-700 mb-1">GST Rate (%)</label>
                <select value={formData.gst_rate} onChange={(e) => setFormData({ ...formData, gst_rate: e.target.value })} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  {GST_RATES.map(rate => <option key={rate} value={rate}>{rate}%</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary-hover text-white" data-testid="save-product-button">
                {editingProduct ? 'Update' : 'Add'} Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
