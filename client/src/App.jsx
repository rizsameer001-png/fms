import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import SidebarLayout from './components/layout/SidebarLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Buildings from './pages/admin/Buildings';
import Services from './pages/admin/Services';
import Complaints from './pages/admin/Complaints';
import AdminAttendance from './pages/admin/Attendance';
import AdminInvoices from './pages/admin/Invoices';
import AdminChat from './pages/admin/Chat';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerTeam from './pages/manager/Team';
import ManagerComplaints from './pages/manager/Complaints';
import ManagerTasks from './pages/manager/Tasks';
import ManagerAttendance from './pages/manager/Attendance';
import ManagerApprovals from './pages/manager/Approvals';
import ManagerChat from './pages/manager/Chat';
import ManagerReports from './pages/manager/Reports';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/Dashboard';
import SupervisorTeam from './pages/supervisor/Team';
import SupervisorComplaints from './pages/supervisor/Complaints';
import SupervisorTasks from './pages/supervisor/Tasks';
import SupervisorAttendance from './pages/supervisor/Attendance';
import SupervisorChat from './pages/supervisor/Chat';

// Technician Pages
import TechnicianDashboard from './pages/technician/Dashboard';
import TechnicianTasks from './pages/technician/Tasks';
import TechnicianComplaints from './pages/technician/Complaints';
import TechnicianAttendance from './pages/technician/Attendance';
import TechnicianChat from './pages/technician/Chat';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerComplaints from './pages/customer/Complaints';
import CustomerInvoices from './pages/customer/Invoices';
import CustomerServices from './pages/customer/Services';
import CustomerHistory from './pages/customer/History';
import CustomerChat from './pages/customer/Chat';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'super_admin': return '/admin/dashboard';
      case 'manager': return '/manager/dashboard';
      case 'supervisor': return '/supervisor/dashboard';
      case 'technician': return '/technician/dashboard';
      case 'customer': return '/customer/dashboard';
      default: return '/login';
    }
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
    return children;
  };

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardRoute()} />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getDashboardRoute()} />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to={getDashboardRoute()} />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SidebarLayout role="super_admin">
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="buildings" element={<Buildings />} />
                <Route path="services" element={<Services />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="attendance" element={<AdminAttendance />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="chat" element={<AdminChat />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </SidebarLayout>
          </ProtectedRoute>
        } />

        {/* Manager Routes */}
        <Route path="/manager/*" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <SidebarLayout role="manager">
              <Routes>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="team" element={<ManagerTeam />} />
                <Route path="complaints" element={<ManagerComplaints />} />
                <Route path="tasks" element={<ManagerTasks />} />
                <Route path="attendance" element={<ManagerAttendance />} />
                <Route path="approvals" element={<ManagerApprovals />} />
                <Route path="chat" element={<ManagerChat />} />
                <Route path="reports" element={<ManagerReports />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </SidebarLayout>
          </ProtectedRoute>
        } />

        {/* Supervisor Routes */}
        <Route path="/supervisor/*" element={
          <ProtectedRoute allowedRoles={['supervisor']}>
            <SidebarLayout role="supervisor">
              <Routes>
                <Route path="dashboard" element={<SupervisorDashboard />} />
                <Route path="team" element={<SupervisorTeam />} />
                <Route path="complaints" element={<SupervisorComplaints />} />
                <Route path="tasks" element={<SupervisorTasks />} />
                <Route path="attendance" element={<SupervisorAttendance />} />
                <Route path="chat" element={<SupervisorChat />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </SidebarLayout>
          </ProtectedRoute>
        } />

        {/* Technician Routes */}
        <Route path="/technician/*" element={
          <ProtectedRoute allowedRoles={['technician']}>
            <SidebarLayout role="technician">
              <Routes>
                <Route path="dashboard" element={<TechnicianDashboard />} />
                <Route path="tasks" element={<TechnicianTasks />} />
                <Route path="complaints" element={<TechnicianComplaints />} />
                <Route path="attendance" element={<TechnicianAttendance />} />
                <Route path="chat" element={<TechnicianChat />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </SidebarLayout>
          </ProtectedRoute>
        } />

        {/* Customer Routes */}
        <Route path="/customer/*" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <SidebarLayout role="customer">
              <Routes>
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="complaints" element={<CustomerComplaints />} />
                <Route path="invoices" element={<CustomerInvoices />} />
                <Route path="services" element={<CustomerServices />} />
                <Route path="history" element={<CustomerHistory />} />
                <Route path="chat" element={<CustomerChat />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </SidebarLayout>
          </ProtectedRoute>
        } />

        {/* Default */}
        <Route path="/" element={<Navigate to={isAuthenticated ? getDashboardRoute() : '/login'} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
