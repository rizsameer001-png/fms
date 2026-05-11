const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true },
  body: { type: String, required: true },

  type: {
    type: String,
    enum: ['complaint', 'task', 'attendance', 'approval', 'billing', 'chat', 'emergency', 'general'],
    required: true
  },

  // Reference
  referenceModel: { type: String }, // 'Complaint', 'Task', etc.
  referenceId: { type: mongoose.Schema.Types.ObjectId },

  // Delivery
  channels: [{
    type: { type: String, enum: ['push', 'sms', 'email', 'in_app'] },
    status: { type: String, enum: ['pending', 'sent', 'failed', 'read'], default: 'pending' },
    sentAt: { type: Date },
    error: { type: String }
  }],

  isRead: { type: Boolean, default: false },
  readAt: { type: Date },

  // Action
  actionUrl: { type: String },
  actionLabel: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
