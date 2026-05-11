import api from './api';

export const dashboardAPI = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getManagerDashboard: () => api.get('/dashboard/manager'),
  getSupervisorDashboard: () => api.get('/dashboard/supervisor'),
  getTechnicianDashboard: () => api.get('/dashboard/technician'),
};
