import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  ClipboardList,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
} from 'lucide-react';

export default function SupervisorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['supervisor-dashboard'],
    queryFn: () => dashboardAPI.getSupervisorDashboard().then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
            <p className="text-gray-500 mt-1">Field operations overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Sarah Supervisor</p>
              <p className="text-xs text-gray-500">Field Operations</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              SS
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Technicians"
            value={stats.totalTechnicians || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Online Now"
            value={stats.onlineTechs?.length || 0}
            icon={MapPin}
            color="green"
          />
          <StatCard
            title="Active Tasks"
            value={stats.activeTasks?.length || 0}
            icon={ClipboardList}
            color="purple"
          />
          <StatCard
            title="Urgent Complaints"
            value={stats.urgentComplaints?.length || 0}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Attendance */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
            <div className="space-y-3">
              {stats.attendanceToday?.map((att) => (
                <div key={att._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
                      {att.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{att.user?.name}</p>
                      <p className="text-xs text-gray-500">{att.user?.staffType?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      att.status === 'present' ? 'bg-green-100 text-green-700' :
                      att.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {att.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {att.checkIn?.time ? new Date(att.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not checked in'}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-4">No attendance records yet</p>
              )}
            </div>
          </div>

          {/* Online Technicians Map */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Locations</h3>
            <div className="space-y-3">
              {stats.onlineTechs?.map((tech) => (
                <div key={tech._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-medium">
                        {tech.name?.charAt(0)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tech.name}</p>
                      <p className="text-xs text-gray-500">{tech.staffType?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {tech.currentLocation ? `${tech.currentLocation.lat?.toFixed(4)}, ${tech.currentLocation.lng?.toFixed(4)}` : 'No location'}
                    </p>
                    <p className="text-xs text-green-600">Online</p>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-4">No technicians online</p>
              )}
            </div>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Tasks</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Task</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Assigned To</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Building</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.activeTasks?.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{task.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{task.assignedTo?.map(a => a.name).join(', ')}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{task.building?.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        task.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No active tasks</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
