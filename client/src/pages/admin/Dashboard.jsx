import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  Building2,
  ClipboardList,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  MapPin
} from 'lucide-react';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardAPI.getAdminDashboard().then((res) => res.data.data),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.counts?.totalUsers || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Buildings"
          value={stats.counts?.totalBuildings || 0}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Open Complaints"
          value={stats.complaints?.open || 0}
          icon={ClipboardList}
          color="yellow"
        />
        <StatCard
          title="Revenue (30d)"
          value={`₹${(stats.revenue?.total || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.counts?.totalCustomers || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Technicians"
          value={stats.counts?.totalTechnicians || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="SLA Breaches"
          value={stats.complaints?.slaBreaches || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Online Now"
          value={stats.onlineTechnicians || 0}
          icon={MapPin}
          color="green"
        />
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Ticket</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Building</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentComplaints?.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-primary-600">{complaint.ticketNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{complaint.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{complaint.building?.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      complaint.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                      complaint.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                      complaint.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      complaint.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      complaint.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {complaint.priority}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No recent complaints</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
