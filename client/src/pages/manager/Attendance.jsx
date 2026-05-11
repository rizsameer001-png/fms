import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceAPI } from '../../services/attendanceService';
import DataTable from '../../components/common/DataTable';
import { Download, Filter, Users, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerAttendance() {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: '',
  });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['manager-attendance', page, filters],
    queryFn: () => attendanceAPI.getAttendance({ ...filters, page, limit: 20 }).then((res) => res.data),
  });

  const { data: statsData } = useQuery({
    queryKey: ['manager-attendance-stats', filters],
    queryFn: () => attendanceAPI.getAttendanceStats({ startDate: filters.startDate, endDate: filters.endDate }).then((res) => res.data),
  });

  const handleExport = () => {
    const records = data?.data || [];
    if (records.length === 0) { toast.error('No data to export'); return; }
    const headers = ['Date', 'Employee', 'Check In', 'Check Out', 'Hours', 'Overtime', 'Status'];
    const rows = records.map(r => [
      new Date(r.date).toLocaleDateString(), r.user?.name || '-',
      r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : '-',
      r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : '-',
      r.totalHours || '0', r.overtime || '0', r.status,
    ]);
    //const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('');
	const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manager-attendance-${filters.startDate}-to-${filters.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const statusColors = {
    present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700', half_day: 'bg-orange-100 text-orange-700',
    on_leave: 'bg-blue-100 text-blue-700', on_duty: 'bg-purple-100 text-purple-700',
  };

  const columns = [
    { key: 'user', label: 'Employee', render: (v) => <div><p className="font-medium">{v?.name}</p><p className="text-xs text-gray-500">{v?.staffType?.replace('_', ' ')}</p></div> },
    { key: 'date', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
    { key: 'checkIn', label: 'Check In', render: (v) => v?.time ? new Date(v.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'checkOut', label: 'Check Out', render: (v) => v?.time ? new Date(v.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'totalHours', label: 'Hours', render: (v) => `${v || 0}h` },
    { key: 'overtime', label: 'OT', render: (v) => `${v || 0}h` },
    { key: 'status', label: 'Status', render: (v) => <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[v]}`}>{v.replace('_', ' ')}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Team Attendance</h1><p className="text-gray-500 mt-1">Monitor your team's attendance</p></div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2"><Download className="w-4 h-4" />Export Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(statsData?.data?.statusStats || []).map((stat) => (
          <div key={stat._id} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat._id === 'present' ? 'bg-green-50' : stat._id === 'absent' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                {stat._id === 'present' ? <CheckCircle className="w-5 h-5 text-green-600" /> : stat._id === 'absent' ? <XCircle className="w-5 h-5 text-red-600" /> : <Clock className="w-5 h-5 text-yellow-600" />}
              </div>
              <div><p className="text-2xl font-bold">{stat.count}</p><p className="text-xs text-gray-500 capitalize">{stat._id.replace('_', ' ')}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input-field"><option value="">All</option><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option></select></div>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} pagination={data?.pagination} onPageChange={setPage} loading={isLoading} />
    </div>
  );
}
