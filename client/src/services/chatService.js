import api from './api';

export const chatAPI = {
  getChatGroups: () => api.get('/chat/groups'),
  createGroup: (data) => api.post('/chat/groups', data),
  getOrCreateDirectChat: (userId) => api.post('/chat/direct', { userId }),
  getMessages: (groupId, params) => api.get(`/chat/groups/${groupId}/messages`, { params }),
  sendMessage: (groupId, data) => api.post(`/chat/groups/${groupId}/messages`, data),
};
