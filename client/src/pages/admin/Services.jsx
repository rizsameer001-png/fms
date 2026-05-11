import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { buildingAPI } from '../../services/buildingService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Plus, Pencil, Trash2, Wrench, DollarSign, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Service Model for CRUD
const SERVICE_CATEGORIES = [
  'cleaning', 'security', 'plumbing', 'electrical', 'hvac',
  'landscaping', 'catering', 'waste', 'hospitality', 'reception', 'it_support'
];

export default function Services() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cleaning',
    description: '',
    basePrice: '',
    unit: 'per_sqft',
    gstRate: 18,
    slaHours: 24,
    isActive: true,
  });

  // Mock services data - in production this would come from API
  const [services, setServices] = useState([
    { _id: '1', name: 'Daily Office Cleaning', category: 'cleaning', description: 'Complete office cleaning including dusting, mopping, sanitization', basePrice: 25, unit: 'per_sqft', gstRate: 18, slaHours: 24, isActive: true },
    { _id: '2', name: '24/7 Security Guard', category: 'security', description: 'Trained security personnel for round-the-clock surveillance', basePrice: 15000, unit: 'per_month', gstRate: 18, slaHours: 2, isActive: true },
    { _id: '3', name: 'Plumbing Maintenance', category: 'plumbing', description: 'Pipe repairs, leak fixes, fixture installation', basePrice: 500, unit: 'per_visit', gstRate: 18, slaHours: 8, isActive: true },
    { _id: '4', name: 'Electrical Repairs', category: 'electrical', description: 'Wiring, switch repairs, lighting maintenance', basePrice: 400, unit: 'per_visit', gstRate: 18, slaHours: 4, isActive: true },
    { _id: '5', name: 'HVAC Servicing', category: 'hvac', description: 'AC maintenance, filter replacement, cooling system check', basePrice: 1200, unit: 'per_visit', gstRate: 18, slaHours: 24, isActive: true },
    { _id: '6', name: 'Garden Maintenance', category: 'landscaping', description: 'Lawn mowing, plant care, garden cleanup', basePrice: 3000, unit: 'per_month', gstRate: 18, slaHours: 72, isActive: true },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingService) {
      setServices(services.map(s => s._id === editingService._id ? { ...formData, _id: editingService._id } : s));
      toast.success('Service updated successfully');
    } else {
      setServices([...services, { ...formData, _id: Date.now().toString() }]);
      toast.success('Service created successfully');
    }
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: '', category: 'cleaning', description: '', basePrice: '', unit: 'per_sqft', gstRate: 18, slaHours: 24, isActive: true });
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({ ...service });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this service?')) return;
    setServices(services.filter(s => s._id !== id));
    toast.success('Service deleted');
  };

  const columns = [
    { key: 'name', label: 'Service Name' },
    { key: 'category', label: 'Category', render: (v) => <span className="capitalize">{v.replace('_', ' ')}</span> },
    { key: 'basePrice', label: 'Base Price', render: (v, row) => `₹${v} ${row.unit.replace('_', '/')}` },
    { key: 'slaHours', label: 'SLA', render: (v) => `${v} hrs` },
    { key: 'gstRate', label: 'GST', render: (v) => `${v}%` },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {v ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">Manage all facility services and pricing</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({ name: '', category: 'cleaning', description: '', basePrice: '', unit: 'per_sqft', gstRate: 18, slaHours: 24, isActive: true });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Wrench className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{services.length}</p><p className="text-xs text-gray-500">Total Services</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{services.filter(s => s.isActive).length}</p><p className="text-xs text-gray-500">Active</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">₹{Math.round(services.reduce((sum, s) => sum + (s.basePrice || 0), 0) / services.length)}</p><p className="text-xs text-gray-500">Avg Price</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg"><Clock className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold">{Math.round(services.reduce((sum, s) => sum + (s.slaHours || 0), 0) / services.length)}h</p><p className="text-xs text-gray-500">Avg SLA</p></div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={services}
        actions={(row) => (
          <>
            <button onClick={() => handleEdit(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => handleDelete(row._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
          </>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Edit Service' : 'Add Service'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
                {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
              <input type="number" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="input-field">
                <option value="per_sqft">Per Sqft</option>
                <option value="per_visit">Per Visit</option>
                <option value="per_month">Per Month</option>
                <option value="per_hour">Per Hour</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SLA Hours</label>
              <input type="number" value={formData.slaHours} onChange={(e) => setFormData({ ...formData, slaHours: parseInt(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
              <input type="number" value={formData.gstRate} onChange={(e) => setFormData({ ...formData, gstRate: parseInt(e.target.value) })} className="input-field" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded border-gray-300" />
              <label className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingService ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
