import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceAPI } from '../../services/attendanceService';
import DataTable from '../../components/common/DataTable';
import { Download, Calendar, Filter, Users, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAttendance() {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: '',
    user: '',
  });
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-attendance', page, filters],
    queryFn: () => attendanceAPI.getAttendance({ ...filters, page, limit: 20 }).then((res) => res.data),
  });

  const { data: statsData } = useQuery({
    queryKey: ['attendance-stats', filters],
    queryFn: () => attendanceAPI.getAttendanceStats({ startDate: filters.startDate, endDate: filters.endDate }).then((res) => res.data),
  });

  const handleExportExcel = () => {
    const records = data?.data || [];
    if (records.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create CSV content
    const headers = ['Date', 'Employee', 'Role', 'Check In', 'Check Out', 'Total Hours', 'Overtime', 'Status', 'Geofence'];
    const rows = records.map(r => [
      new Date(r.date).toLocaleDateString(),
      r.user?.name || '-',
      r.user?.staffType?.replace('_', ' ') || r.user?.role || '-',
      r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : '-',
      r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : '-',
      r.totalHours || '0',
      r.overtime || '0',
      r.status,
      r.checkIn?.isWithinGeofence ? 'Yes' : 'No',
    ]);

    //const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('');
	const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${filters.startDate}-to-${filters.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const statusStats = statsData?.data?.statusStats || [];
  const dailyStats = statsData?.data?.dailyStats || [];

  const statusColors = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700',
    half_day: 'bg-orange-100 text-orange-700',
    on_leave: 'bg-blue-100 text-blue-700',
    on_duty: 'bg-purple-100 text-purple-700',
  };

  const columns = [
    { key: 'user', label: 'Employee', render: (v) => v?.name || '-' },
    { key: 'date', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
    {
      key: 'checkIn',
      label: 'Check In',
      render: (v) => v?.time ? (
        <div>
          <span>{new Date(v.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {!v.isWithinGeofence && <span className="ml-2 text-xs text-red-500">(Outside)</span>}
        </div>
      ) : '-',
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: (v) => v?.time ? new Date(v.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    { key: 'totalHours', label: 'Hours', render: (v) => v ? `${v}h` : '-' },
    { key: 'overtime', label: 'OT', render: (v) => v ? `${v}h` : '-' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[v] || 'bg-gray-100 text-gray-700'}`}>
          {v.replace('_', ' ')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Monitoring</h1>
          <p className="text-gray-500 mt-1">Track and export attendance reports</p>
        </div>
        <button onClick={handleExportExcel} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Excel/CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statusStats.map((stat) => (
          <div key={stat._id} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                stat._id === 'present' ? 'bg-green-50' :
                stat._id === 'absent' ? 'bg-red-50' :
                stat._id === 'late' ? 'bg-yellow-50' :
                'bg-gray-50'
              }`}>
                {stat._id === 'present' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                 stat._id === 'absent' ? <XCircle className="w-5 h-5 text-red-600" /> :
                 stat._id === 'late' ? <Clock className="w-5 h-5 text-yellow-600" /> :
                 <Users className="w-5 h-5 text-gray-600" />}
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-xs text-gray-500 capitalize">{stat._id.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Daily Summary Chart */}
      {dailyStats.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Present</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Late</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Absent</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Total Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dailyStats.map((day) => (
                  <tr key={day._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{day._id}</td>
                    <td className="py-3 px-4 text-sm text-green-600">{day.present}</td>
                    <td className="py-3 px-4 text-sm text-yellow-600">{day.late}</td>
                    <td className="py-3 px-4 text-sm text-red-600">{day.absent}</td>
                    <td className="py-3 px-4 text-sm">{day.totalHours?.toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
      />
    </div>
  );
}
