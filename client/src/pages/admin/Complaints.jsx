import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '../../services/complaintService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Plus, Eye, ArrowUpRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  open: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  on_hold: 'bg-gray-100 text-gray-700',
  resolved: 'bg-green-100 text-green-700',
  verified: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-700',
  escalated: 'bg-red-100 text-red-700',
};

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function Complaints() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['complaints', page, filters],
    queryFn: () => complaintAPI.getComplaints({ page, limit: 10, ...filters }).then((res) => res.data),
  });

  const handleView = async (complaint) => {
    try {
      const { data } = await complaintAPI.getComplaint(complaint._id);
      setSelectedComplaint(data.data);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error('Failed to load complaint details');
    }
  };

  const columns = [
    { key: 'ticketNumber', label: 'Ticket' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: (v) => <span className="capitalize">{v.replace('_', ' ')}</span> },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColors[v]}`}>
          {v}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[v]}`}>
          {v.replace('_', ' ')}
        </span>
      ),
    },
    { key: 'building', label: 'Building', render: (v) => v?.name || '-' },
    { key: 'createdAt', label: 'Created', render: (v) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-500 mt-1">Manage and track all complaints</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field text-sm py-2"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="input-field text-sm py-2"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        actions={(row) => (
          <button onClick={() => handleView(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      {/* Complaint Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Complaint ${selectedComplaint?.ticketNumber}`} size="lg">
        {selectedComplaint && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedComplaint.status]}`}>
                    {selectedComplaint.status.replace('_', ' ')}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Priority</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColors[selectedComplaint.priority]}`}>
                    {selectedComplaint.priority}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Title</label>
              <p className="mt-1 text-sm text-gray-900">{selectedComplaint.title}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Description</label>
              <p className="mt-1 text-sm text-gray-700">{selectedComplaint.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Building</label>
                <p className="mt-1 text-sm">{selectedComplaint.building?.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Floor</label>
                <p className="mt-1 text-sm">{selectedComplaint.floor?.name || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Reported By</label>
                <p className="mt-1 text-sm">{selectedComplaint.reportedBy?.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Assigned To</label>
                <p className="mt-1 text-sm">{selectedComplaint.assignedTo?.name || 'Not assigned'}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">SLA Deadline</label>
              <p className="mt-1 text-sm">{selectedComplaint.slaDeadline ? new Date(selectedComplaint.slaDeadline).toLocaleString() : '-'}</p>
            </div>
            {selectedComplaint.timeline?.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500">Timeline</label>
                <div className="mt-2 space-y-2">
                  {selectedComplaint.timeline.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-700">Status changed to {item.status.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{item.updatedBy?.name} - {new Date(item.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
