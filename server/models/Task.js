const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  type: {
    type: String,
    enum: ['ppm', 'routine', 'emergency', 'inspection', 'audit'],
    default: 'routine'
  },

  category: {
    type: String,
    enum: ['cleaning', 'security', 'plumbing', 'electrical', 'hvac', 
           'landscaping', 'catering', 'waste', 'general'],
    required: true
  },

  building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor' },

  // Assignment
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Scheduling
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String },
  duration: { type: Number }, // estimated minutes

  // Recurring
  isRecurring: { type: Boolean, default: false },
  recurrence: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] },
    interval: { type: Number, default: 1 },
    endDate: { type: Date }
  },

  // Checklist
  checklist: [{
    item: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date },
    notes: { type: String },
    photos: [{ type: String }]
  }],

  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'],
    default: 'pending'
  },

  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },

  // Completion
  completedAt: { type: Date },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completionNotes: { type: String },
  completionPhotos: [{ type: String }],

  // Approval
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
