import api from './api';

export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getOnlineUsers: () => api.get('/users/online'),
  getTechniciansByBuilding: (buildingId) => api.get(`/users/technicians/${buildingId}`),
};
