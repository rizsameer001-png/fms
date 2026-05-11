const generateTicketNumber = () => {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${random}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const calculateSLA = (priority) => {
  const slaMap = {
    low: 72,
    medium: 24,
    high: 8,
    critical: 2
  };
  return slaMap[priority] || 24;
};

module.exports = {
  generateTicketNumber,
  generateInvoiceNumber,
  formatDate,
  calculateSLA
};
