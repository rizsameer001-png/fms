import api from './api';

export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  updateChecklist: (id, itemIndex, data) => api.put(`/tasks/${id}/checklist/${itemIndex}`, data),
  completeTask: (id, data) => api.put(`/tasks/${id}/complete`, data),
  verifyTask: (id, data) => api.put(`/tasks/${id}/verify`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};
