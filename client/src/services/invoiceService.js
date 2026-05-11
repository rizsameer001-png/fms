import api from './api';

export const invoiceAPI = {
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  updateInvoiceStatus: (id, status) => api.put(`/invoices/${id}/status`, { status }),
  recordPayment: (id, data) => api.post(`/invoices/${id}/payment`, data),
};
