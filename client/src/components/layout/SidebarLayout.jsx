import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  CheckSquare,
  Clock,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Wrench,
  History,
  CreditCard,
  MapPin,
  Shield,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

const iconMap = {
  LayoutDashboard, Users, Building2, ClipboardList, CheckSquare,
  Clock, FileText, BarChart3, Settings, MessageSquare, Wrench,
  History, CreditCard, MapPin, Shield, AlertTriangle, TrendingUp,
};

const roleConfig = {
  super_admin: {
    title: 'FMS Admin',
    color: 'bg-primary-600',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/admin/users', label: 'Users', icon: 'Users' },
      { path: '/admin/buildings', label: 'Buildings', icon: 'Building2' },
      { path: '/admin/services', label: 'Services', icon: 'Wrench' },
      { path: '/admin/complaints', label: 'Complaints', icon: 'ClipboardList' },
      { path: '/admin/tasks', label: 'Tasks', icon: 'CheckSquare' },
      { path: '/admin/attendance', label: 'Attendance', icon: 'Clock' },
      { path: '/admin/invoices', label: 'Invoices', icon: 'FileText' },
      { path: '/admin/chat', label: 'Chat', icon: 'MessageSquare' },
      { path: '/admin/reports', label: 'Reports', icon: 'BarChart3' },
      { path: '/admin/settings', label: 'Settings', icon: 'Settings' },
    ],
  },
  manager: {
    title: 'FMS Manager',
    color: 'bg-blue-600',
    items: [
      { path: '/manager/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/manager/team', label: 'My Team', icon: 'Users' },
      { path: '/manager/complaints', label: 'Complaints', icon: 'ClipboardList' },
      { path: '/manager/tasks', label: 'Tasks', icon: 'CheckSquare' },
      { path: '/manager/attendance', label: 'Attendance', icon: 'Clock' },
      { path: '/manager/approvals', label: 'Approvals', icon: 'Shield' },
      { path: '/manager/chat', label: 'Chat', icon: 'MessageSquare' },
      { path: '/manager/reports', label: 'Reports', icon: 'BarChart3' },
    ],
  },
  supervisor: {
    title: 'FMS Supervisor',
    color: 'bg-indigo-600',
    items: [
      { path: '/supervisor/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/supervisor/team', label: 'My Team', icon: 'Users' },
      { path: '/supervisor/complaints', label: 'Complaints', icon: 'ClipboardList' },
      { path: '/supervisor/tasks', label: 'Tasks', icon: 'CheckSquare' },
      { path: '/supervisor/attendance', label: 'Attendance', icon: 'Clock' },
      { path: '/supervisor/chat', label: 'Chat', icon: 'MessageSquare' },
    ],
  },
  technician: {
    title: 'FMS Technician',
    color: 'bg-green-600',
    items: [
      { path: '/technician/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/technician/tasks', label: 'My Tasks', icon: 'CheckSquare' },
      { path: '/technician/complaints', label: 'Complaints', icon: 'ClipboardList' },
      { path: '/technician/attendance', label: 'Attendance', icon: 'Clock' },
      { path: '/technician/chat', label: 'Chat', icon: 'MessageSquare' },
    ],
  },
  customer: {
    title: 'FMS Customer',
    color: 'bg-teal-600',
    items: [
      { path: '/customer/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/customer/complaints', label: 'My Complaints', icon: 'ClipboardList' },
      { path: '/customer/invoices', label: 'Invoices', icon: 'FileText' },
      { path: '/customer/services', label: 'Services', icon: 'Wrench' },
      { path: '/customer/history', label: 'History', icon: 'History' },
      { path: '/customer/chat', label: 'Support Chat', icon: 'MessageSquare' },
    ],
  },
};

export default function SidebarLayout({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const config = roleConfig[role] || roleConfig.super_admin;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-sidebar-bg transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        } lg:relative lg:w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-700">
            <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-lg font-bold text-white">{config.title}</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {config.items.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white font-medium`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">{role.replace('_', ' ')} Panel</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white text-sm font-medium`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
