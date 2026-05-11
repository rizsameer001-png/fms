const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },

  // Reporter
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterType: { type: String, enum: ['customer', 'supervisor', 'manager', 'system'] },

  // Location
  building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor' },
  zone: { type: String },
  room: { type: String },

  // Complaint Details
  category: {
    type: String,
    enum: ['cleaning', 'security', 'plumbing', 'electrical', 'hvac', 
           'landscaping', 'catering', 'waste', 'it_support', 'general'],
    required: true
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  title: { type: String, required: true },
  description: { type: String, required: true },

  // Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },

  // SLA
  slaHours: { type: Number, default: 24 },
  slaDeadline: { type: Date },

  // Status Workflow
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'on_hold', 'resolved', 'verified', 'closed', 'escalated'],
    default: 'open'
  },

  // Timeline
  timeline: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
  }],

  // Attachments
  attachments: [{
    url: String,
    type: { type: String, enum: ['image', 'video', 'document'] },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Resolution
  resolution: {
    note: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date }
  },

  // Escalation
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  escalationReason: { type: String },
  escalatedAt: { type: Date },

  // Customer Feedback
  customerRating: { type: Number, min: 1, max: 5 },
  customerFeedback: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

complaintSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      updatedBy: this._updatedBy,
      updatedAt: new Date()
    });
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
