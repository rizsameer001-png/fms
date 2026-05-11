import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceAPI } from '../../services/attendanceService';
import { useAuthStore } from '../../store/authStore';
import { Clock, MapPin, Calendar, CheckCircle, LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TechnicianAttendance() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['technician-attendance'],
    queryFn: () => attendanceAPI.getAttendance({ user: user?._id, page: 1, limit: 30 }).then((res) => res.data),
  });

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
      await attendanceAPI.checkIn({ lat: position.coords.latitude, lng: position.coords.longitude });
      toast.success('Checked in successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to check in. Enable GPS.');
    } finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
      await attendanceAPI.checkOut({ lat: position.coords.latitude, lng: position.coords.longitude });
      toast.success('Checked out successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to check out.');
    } finally { setLoading(false); }
  };

  const todayRecord = data?.data?.find(r => new Date(r.date).toDateString() === new Date().toDateString());
  const isCheckedIn = todayRecord?.checkIn?.time && !todayRecord?.checkOut?.time;

  const statusColors = {
    present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700', half_day: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">My Attendance</h1><p className="text-gray-500 mt-1">Track your daily attendance</p></div>

      {/* Today's Action Card */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Today's Status</p>
            <h3 className="text-xl font-bold text-gray-900">
              {isCheckedIn ? 'Checked In' : todayRecord?.checkOut?.time ? 'Completed' : 'Not Checked In'}
            </h3>
            {todayRecord?.checkIn?.time && <p className="text-sm text-gray-500">In: {new Date(todayRecord.checkIn.time).toLocaleTimeString()}</p>}
            {todayRecord?.checkOut?.time && <p className="text-sm text-gray-500">Out: {new Date(todayRecord.checkOut.time).toLocaleTimeString()}</p>}
          </div>
          <div className="flex gap-3">
            {!isCheckedIn && !todayRecord?.checkOut?.time && (
              <button onClick={handleCheckIn} disabled={loading} className="btn-primary flex items-center gap-2">
                <LogIn className="w-4 h-4" />{loading ? 'Processing...' : 'Check In'}
              </button>
            )}
            {isCheckedIn && (
              <button onClick={handleCheckOut} disabled={loading} className="btn-secondary flex items-center gap-2">
                <LogOut className="w-4 h-4" />{loading ? 'Processing...' : 'Check Out'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div><div><p className="text-xl font-bold">{data?.data?.filter(r => r.status === 'present').length || 0}</p><p className="text-xs text-gray-500">Present</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-50 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div><div><p className="text-xl font-bold">{data?.data?.filter(r => r.status === 'late').length || 0}</p><p className="text-xs text-gray-500">Late</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-red-50 rounded-lg"><MapPin className="w-5 h-5 text-red-600" /></div><div><p className="text-xl font-bold">{data?.data?.filter(r => r.status === 'absent').length || 0}</p><p className="text-xs text-gray-500">Absent</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div><div><p className="text-xl font-bold">{data?.data?.reduce((sum, r) => sum + (r.totalHours || 0), 0).toFixed(1)}h</p><p className="text-xs text-gray-500">Total Hours</p></div></div></div>
      </div>

      {/* History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Date</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Check In</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Check Out</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Hours</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data?.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm">{record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td className="py-3 px-4 text-sm">{record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td className="py-3 px-4 text-sm">{record.totalHours || 0}h</td>
                  <td className="py-3 px-4"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[record.status]}`}>{record.status.replace('_', ' ')}</span></td>
                </tr>
              )) || <tr><td colSpan={5} className="py-8 text-center text-gray-500">No records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
