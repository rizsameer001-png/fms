const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },

  checkIn: {
    time: { type: Date },
    location: {
      lat: Number,
      lng: Number,
      address: String
    },
    isWithinGeofence: { type: Boolean, default: false },
    distance: { type: Number }, // meters from building
    photo: { type: String }, // selfie URL
    deviceInfo: { type: String }
  },

  checkOut: {
    time: { type: Date },
    location: {
      lat: Number,
      lng: Number,
      address: String
    },
    photo: { type: String }
  },

  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'on_leave', 'on_duty'],
    default: 'absent'
  },

  shift: {
    start: { type: String },
    end: { type: String }
  },

  totalHours: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },

  notes: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now }
});

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
