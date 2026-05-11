import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export default function ManagerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: () => dashboardAPI.getManagerDashboard().then((res) => res.data.data),
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your buildings and team</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">John Manager</p>
              <p className="text-xs text-gray-500">Operations Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              JM
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Team Members"
            value={stats.teamMembers || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Open Complaints"
            value={stats.complaints?.open || 0}
            icon={ClipboardList}
            color="yellow"
          />
          <StatCard
            title="Overdue Complaints"
            value={stats.complaints?.overdue || 0}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks || 0}
            icon={Clock}
            color="purple"
          />
        </div>

        {/* Team Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Technician</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Completed</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Avg Resolution</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.teamPerformance?.map((perf, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{perf._id || 'Unknown'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{perf.completed}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {perf.avgResolutionTime ? `${(perf.avgResolutionTime / (1000 * 60 * 60)).toFixed(1)} hrs` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min((perf.completed / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">No performance data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">View Complaints</h4>
                <p className="text-sm text-gray-500">Manage all complaints</p>
              </div>
            </div>
          </div>
          <div className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Approve Tasks</h4>
                <p className="text-sm text-gray-500">Review completed tasks</p>
              </div>
            </div>
          </div>
          <div className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Reports</h4>
                <p className="text-sm text-gray-500">View analytics & reports</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
