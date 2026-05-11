const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  geofenceRadius: { type: Number, default: 100 }, // meters
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supervisors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  services: [{ type: String }], // ['cleaning', 'security', etc.]
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Building', buildingSchema);
