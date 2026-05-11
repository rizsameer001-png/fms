import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceAPI } from '../../services/attendanceService';
import DataTable from '../../components/common/DataTable';
import { Download, Filter, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupervisorAttendance() {
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: '',
  });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['supervisor-attendance', page, filters],
    queryFn: () => attendanceAPI.getAttendance({ ...filters, page, limit: 20 }).then((res) => res.data),
  });

  const handleExport = () => {
    const records = data?.data || [];
    if (records.length === 0) { toast.error('No data'); return; }
    const headers = ['Date', 'Technician', 'Check In', 'Location', 'Check Out', 'Hours', 'Status'];
    const rows = records.map(r => [
      new Date(r.date).toLocaleDateString(), r.user?.name || '-',
      r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : '-',
      r.checkIn?.isWithinGeofence ? 'Inside' : 'Outside',
      r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : '-',
      r.totalHours || '0', r.status,
    ]);
    //const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('');
	const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-attendance-${filters.startDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported');
  };

  const statusColors = {
    present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700', half_day: 'bg-orange-100 text-orange-700',
  };

  const columns = [
    { key: 'user', label: 'Technician', render: (v) => <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">{v?.name?.charAt(0)}</div><div><p className="font-medium text-sm">{v?.name}</p><p className="text-xs text-gray-500">{v?.staffType?.replace('_', ' ')}</p></div></div> },
    { key: 'date', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
    { key: 'checkIn', label: 'Check In', render: (v) => v?.time ? <div><p className="text-sm">{new Date(v.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p><p className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{v.isWithinGeofence ? 'Inside' : 'Outside'}</p></div> : '-' },
    { key: 'checkOut', label: 'Check Out', render: (v) => v?.time ? new Date(v.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'totalHours', label: 'Hours', render: (v) => `${v || 0}h` },
    { key: 'status', label: 'Status', render: (v) => <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[v]}`}>{v.replace('_', ' ')}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Team Attendance</h1><p className="text-gray-500 mt-1">Daily attendance tracking</p></div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2"><Download className="w-4 h-4" />Export</button>
      </div>
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value, endDate: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input-field"><option value="">All</option><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option></select></div>
        </div>
      </div>
      <DataTable columns={columns} data={data?.data || []} pagination={data?.pagination} onPageChange={setPage} loading={isLoading} />
    </div>
  );
}
