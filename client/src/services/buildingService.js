import api from './api';

export const buildingAPI = {
  getBuildings: () => api.get('/buildings'),
  getBuilding: (id) => api.get(`/buildings/${id}`),
  createBuilding: (data) => api.post('/buildings', data),
  updateBuilding: (id, data) => api.put(`/buildings/${id}`, data),
  deleteBuilding: (id) => api.delete(`/buildings/${id}`),
  getFloors: (buildingId) => api.get(`/buildings/${buildingId}/floors`),
  createFloor: (buildingId, data) => api.post(`/buildings/${buildingId}/floors`, data),
};
