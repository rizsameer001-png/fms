const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['leave', 'overtime', 'complaint_closure', 'expense', 'purchase', 'shift_change'],
    required: true
  },

  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Details
  title: { type: String, required: true },
  description: { type: String },

  // Leave Specific
  leaveDetails: {
    startDate: { type: Date },
    endDate: { type: Date },
    leaveType: { type: String, enum: ['sick', 'casual', 'earned', 'unpaid', 'emergency'] },
    days: { type: Number }
  },

  // Overtime Specific
  overtimeDetails: {
    date: { type: Date },
    hours: { type: Number },
    reason: { type: String }
  },

  // Expense Specific
  expenseDetails: {
    amount: { type: Number },
    category: { type: String },
    receipts: [{ type: String }],
    date: { type: Date }
  },

  // Approval Workflow
  currentLevel: { type: Number, default: 1 },
  approvers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    level: { type: Number },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: { type: String },
    actionAt: { type: Date }
  }],

  overallStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'escalated'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Approval', approvalSchema);
