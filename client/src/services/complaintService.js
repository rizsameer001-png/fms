import api from './api';

export const complaintAPI = {
  getComplaints: (params) => api.get('/complaints', { params }),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  createComplaint: (data) => api.post('/complaints', data),
  assignComplaint: (id, technicianId) => api.put(`/complaints/${id}/assign`, { technicianId }),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  escalateComplaint: (id, data) => api.put(`/complaints/${id}/escalate`, data),
  addFeedback: (id, data) => api.put(`/complaints/${id}/feedback`, data),
  getStats: () => api.get('/complaints/stats/overview'),
};
