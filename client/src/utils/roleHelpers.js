export const getRoleDashboard = (role) => {
  const routes = {
    super_admin: '/admin/dashboard',
    manager: '/manager/dashboard',
    supervisor: '/supervisor/dashboard',
    technician: '/technician/dashboard',
    customer: '/customer/dashboard',
  };
  return routes[role] || '/login';
};

export const getRoleSidebarItems = (role) => {
  const items = {
    super_admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/admin/users', label: 'Users', icon: 'Users' },
      { path: '/admin/buildings', label: 'Buildings', icon: 'Building2' },
      { path: '/admin/complaints', label: 'Complaints', icon: 'ClipboardList' },
      { path: '/admin/tasks', label: 'Tasks', icon: 'CheckSquare' },
      { path: '/admin/attendance', label: 'Attendance', icon: 'Clock' },
      { path: '/admin/invoices', label: 'Invoices', icon: 'FileText' },
      { path: '/admin/reports', label: 'Reports', icon: 'BarChart3' },
      { path: '/admin/settings', label: 'Settings', icon: 'Settings' },
    ],
    manager: [
      { path: '/manager/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/manager/team', label: 'My Team', icon: 'Users' },
      { path: '/manager/complaints', label: 'Complaints', icon: 'ClipboardList' },
      { path: '/manager/tasks', label: 'Tasks', icon: 'CheckSquare' },
      { path: '/manager/attendance', label: 'Attendance', icon: 'Clock' },
      { path: '/manager/approvals', label: 'Approvals', icon: 'CheckCircle' },
      { path: '/manager/reports', label: 'Reports', icon: 'BarChart3' },
    ],
    supervisor: [
      { path: '/supervisor/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/supervisor/team', label: 'Team', icon: 'Users' },
      { path: '/supervisor/complaints', label: 'Complaints', icon: 'ClipboardList' },
      { path: '/supervisor/tasks', label: 'Tasks', icon: 'CheckSquare' },
      { path: '/supervisor/attendance', label: 'Attendance', icon: 'Clock' },
      { path: '/supervisor/chat', label: 'Chat', icon: 'MessageSquare' },
    ],
    technician: [
      { path: '/technician/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/technician/tasks', label: 'My Tasks', icon: 'CheckSquare' },
      { path: '/technician/complaints', label: 'Complaints', icon: 'ClipboardList' },
      { path: '/technician/attendance', label: 'Attendance', icon: 'Clock' },
      { path: '/technician/chat', label: 'Chat', icon: 'MessageSquare' },
    ],
    customer: [
      { path: '/customer/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/customer/complaints', label: 'My Complaints', icon: 'ClipboardList' },
      { path: '/customer/invoices', label: 'Invoices', icon: 'FileText' },
      { path: '/customer/services', label: 'Services', icon: 'Wrench' },
      { path: '/customer/history', label: 'History', icon: 'History' },
    ],
  };
  return items[role] || [];
};
