const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
  building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  name: { type: String, required: true },
  number: { type: Number, required: true },
  zones: [{
    name: { type: String, required: true },
    code: { type: String, required: true },
    rooms: [{
      name: String,
      code: String,
      type: { type: String, enum: ['office', 'restroom', 'kitchen', 'server_room', 'common'] }
    }]
  }],
  services: [{ type: String }],
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Floor', floorSchema);
