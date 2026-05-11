export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer',
};

export const STAFF_TYPES = [
  'electrician',
  'cleaner',
  'security',
  'plumbing',
  'waste_management',
  'landscaping',
  'catering',
  'reception',
  'ppm_staff',
];

export const SERVICE_CATEGORIES = [
  'cleaning',
  'security',
  'plumbing',
  'electrical',
  'hvac',
  'landscaping',
  'catering',
  'waste',
  'hospitality',
  'reception',
  'it_support',
  'general',
];

export const COMPLAINT_PRIORITIES = [
  { value: 'low', label: 'Low', slaHours: 72 },
  { value: 'medium', label: 'Medium', slaHours: 24 },
  { value: 'high', label: 'High', slaHours: 8 },
  { value: 'critical', label: 'Critical', slaHours: 2 },
];

export const TASK_TYPES = [
  { value: 'ppm', label: 'Preventive Maintenance' },
  { value: 'routine', label: 'Routine' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'audit', label: 'Audit' },
];

export const APPROVAL_TYPES = [
  { value: 'leave', label: 'Leave Request' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'complaint_closure', label: 'Complaint Closure' },
  { value: 'expense', label: 'Expense' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'shift_change', label: 'Shift Change' },
];

export const NOTIFICATION_TYPES = {
  COMPLAINT: 'complaint',
  TASK: 'task',
  ATTENDANCE: 'attendance',
  APPROVAL: 'approval',
  BILLING: 'billing',
  CHAT: 'chat',
  EMERGENCY: 'emergency',
  GENERAL: 'general',
};

export const PAYMENT_METHODS = [
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'upi', label: 'UPI' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
];
