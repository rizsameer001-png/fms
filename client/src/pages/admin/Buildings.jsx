import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { buildingAPI } from '../../services/buildingService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Plus, Pencil, Trash2, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Buildings() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    lat: '',
    lng: '',
    geofenceRadius: 100,
    services: [],
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['buildings', page],
    queryFn: () => buildingAPI.getBuildings().then((res) => res.data),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        location: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        },
      };
      if (editingBuilding) {
        await buildingAPI.updateBuilding(editingBuilding._id, payload);
        toast.success('Building updated successfully');
      } else {
        await buildingAPI.createBuilding(payload);
        toast.success('Building created successfully');
      }
      setIsModalOpen(false);
      setEditingBuilding(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (building) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      code: building.code,
      address: building.address,
      lat: building.location?.lat || '',
      lng: building.location?.lng || '',
      geofenceRadius: building.geofenceRadius || 100,
      services: building.services || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this building?')) return;
    try {
      await buildingAPI.deleteBuilding(id);
      toast.success('Building deactivated');
      refetch();
    } catch (error) {
      toast.error('Failed to deactivate building');
    }
  };

  const serviceOptions = ['cleaning', 'security', 'plumbing', 'electrical', 'hvac', 'landscaping', 'catering', 'waste', 'hospitality', 'reception'];

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'address', label: 'Address' },
    {
      key: 'location',
      label: 'Location',
      render: (loc) => loc ? `${loc.lat?.toFixed(4)}, ${loc.lng?.toFixed(4)}` : '-',
    },
    {
      key: 'services',
      label: 'Services',
      render: (services) => (
        <div className="flex flex-wrap gap-1">
          {services?.map((s) => (
            <span key={s} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">
              {s}
            </span>
          )) || '-'}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buildings</h1>
          <p className="text-gray-500 mt-1">Manage buildings and facilities</p>
        </div>
        <button
          onClick={() => {
            setEditingBuilding(null);
            setFormData({ name: '', code: '', address: '', lat: '', lng: '', geofenceRadius: 100, services: [] });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Building
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        actions={(row) => (
          <>
            <button onClick={() => handleEdit(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(row._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBuilding ? 'Edit Building' : 'Add Building'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field" rows={2} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geofence (m)</label>
              <input type="number" value={formData.geofenceRadius} onChange={(e) => setFormData({ ...formData, geofenceRadius: parseInt(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, services: [...formData.services, service] });
                      } else {
                        setFormData({ ...formData, services: formData.services.filter((s) => s !== service) });
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{service.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingBuilding ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
