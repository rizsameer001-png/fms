import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../services/dashboardService';
import { useAuthStore } from '../../store/authStore';
import {
  ClipboardList,
  MapPin,
  Clock,
  Bell,
  CheckCircle,
  AlertTriangle,
  Calendar,
  LogIn,
  LogOut,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TechnicianDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['technician-dashboard'],
    queryFn: () => dashboardAPI.getTechnicianDashboard().then((res) => res.data.data),
  });

  const handleCheckIn = async () => {
    try {
      // In real app, get GPS coordinates
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      // API call would go here
      toast.success('Checked in successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to get location. Please enable GPS.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = data || {};
  const isCheckedIn = stats.attendance?.checkIn?.time && !stats.attendance?.checkOut?.time;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-primary-600 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Technician Portal</h1>
            <p className="text-primary-200 text-sm">{user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 bg-primary-700 rounded-lg">
              <Bell className="w-5 h-5" />
              {stats.unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {stats.unreadNotifications}
                </span>
              )}
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center font-medium">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Attendance Card */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Status</p>
              <h3 className="text-lg font-bold text-gray-900">
                {isCheckedIn ? 'Checked In' : stats.attendance?.checkOut?.time ? 'Shift Completed' : 'Not Checked In'}
              </h3>
              {stats.attendance?.checkIn?.time && (
                <p className="text-sm text-gray-500">
                  In: {new Date(stats.attendance.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <button
              onClick={handleCheckIn}
              disabled={isCheckedIn}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isCheckedIn
                  ? 'bg-green-100 text-green-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isCheckedIn ? <CheckCircle className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {isCheckedIn ? 'Checked In' : 'Check In'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.tasks?.length || 0}</p>
                <p className="text-xs text-gray-500">Tasks</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.complaints?.length || 0}</p>
                <p className="text-xs text-gray-500">Complaints</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Tasks</h3>
          <div className="space-y-3">
            {stats.tasks?.map((task) => (
              <div key={task._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{task.building?.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">{task.category}</span>
                    </div>
                  </div>
                  <button className="p-2 bg-primary-50 rounded-lg text-primary-600">
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-4">No tasks assigned</p>
            )}
          </div>
        </div>

        {/* Complaints Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Complaints</h3>
          <div className="space-y-3">
            {stats.complaints?.map((complaint) => (
              <div key={complaint._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary-600">{complaint.ticketNumber}</span>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        complaint.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        complaint.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {complaint.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">{complaint.title}</p>
                    <p className="text-xs text-gray-500">{complaint.building?.name}</p>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-4">No complaints assigned</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
