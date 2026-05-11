// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   phone: { type: String, required: true },
//   password: { type: String, required: true, minlength: 6 },
//   role: {
//     type: String,
//     enum: ['super_admin', 'manager', 'supervisor', 'technician', 'customer'],
//     required: true
//   },
//   staffType: {
//     type: String,
//     enum: ['electrician', 'cleaner', 'security', 'plumbing', 'waste_management', 
//            'landscaping', 'catering', 'reception', 'ppm_staff', null],
//     default: null
//   },
//   avatar: { type: String, default: null },
//   isActive: { type: Boolean, default: true },

//   // Building & Department Assignment
//   assignedBuildings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Building' }],
//   assignedFloors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Floor' }],
//   department: { type: String, default: null },
//   shift: {
//     start: { type: String, default: '09:00' },
//     end: { type: String, default: '17:00' }
//   },

//   // GPS & Attendance
//   currentLocation: {
//     lat: { type: Number, default: null },
//     lng: { type: Number, default: null },
//     updatedAt: { type: Date, default: null }
//   },
//   isOnline: { type: Boolean, default: false },
//   lastActive: { type: Date, default: Date.now },

//   // Permissions (for granular access)
//   permissions: [{
//     module: String,
//     actions: [String] // ['create', 'read', 'update', 'delete']
//   }],

//   // Approval Workflow
//   reportsTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

//   // Customer Specific
//   companyName: { type: String, default: null },
//   billingAddress: { type: String, default: null },

//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },

  role: {
    type: String,
    enum: ['super_admin', 'manager', 'supervisor', 'technician', 'customer'],
    required: true
  },

  staffType: {
    type: String,
    enum: [
      'electrician', 'cleaner', 'security', 'plumbing',
      'waste_management', 'landscaping', 'catering',
      'reception', 'ppm_staff', null
    ],
    default: null
  },

  avatar: { type: String, default: null },
  isActive: { type: Boolean, default: true },

  // 🔔 FCM TOKENS (NEW ADDITION)
  fcmTokens: [
    {
      token: { type: String, required: true },
      device: { type: String, default: 'web' }, // web / android / ios
      createdAt: { type: Date, default: Date.now }
    }
  ],

  // Building & Department Assignment
  assignedBuildings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Building' }],
  assignedFloors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Floor' }],
  department: { type: String, default: null },

  shift: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },

  // GPS & Attendance
  currentLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    updatedAt: { type: Date, default: null }
  },

  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },

  // Permissions
  permissions: [
    {
      module: String,
      actions: [String]
    }
  ],

  // Approval Workflow
  reportsTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Customer Specific
  companyName: { type: String, default: null },
  billingAddress: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


// 🔐 HASH PASSWORD
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 🔑 COMPARE PASSWORD
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


// 🔥 ADD METHOD: SAVE FCM TOKEN (CLEAN WAY)
userSchema.methods.addFcmToken = async function(token, device = 'web') {
  const exists = this.fcmTokens.find(t => t.token === token);

  if (!exists) {
    this.fcmTokens.push({ token, device });
    await this.save();
  }

  return this;
};


// 🔥 ADD METHOD: REMOVE TOKEN (IMPORTANT)
userSchema.methods.removeFcmToken = async function(token) {
  this.fcmTokens = this.fcmTokens.filter(t => t.token !== token);
  await this.save();
  return this;
};


module.exports = mongoose.model('User', userSchema);