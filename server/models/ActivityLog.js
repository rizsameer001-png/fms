const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // 'created_complaint', 'updated_user', etc.
  entityType: { type: String, required: true }, // 'User', 'Complaint', etc.
  entityId: { type: mongoose.Schema.Types.ObjectId },

  details: { type: mongoose.Schema.Types.Mixed }, // before/after data

  ipAddress: { type: String },
  userAgent: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
