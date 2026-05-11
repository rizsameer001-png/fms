import api from './api';

export const approvalAPI = {
  getApprovals: (params) => api.get('/approvals', { params }),
  getApproval: (id) => api.get(`/approvals/${id}`),
  createApproval: (data) => api.post('/approvals', data),
  approveReject: (id, data) => api.put(`/approvals/${id}/action`, data),
};
