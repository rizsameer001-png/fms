const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Manager)
exports.getUsers = async (req, res) => {
  try {
    const { role, building, search, isActive, page = 1, limit = 20 } = req.query;

    let query = {};

    // Role filter
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Building filter (for managers)
    if (req.user.role === 'manager') {
      query.assignedBuildings = { $in: req.user.assignedBuildings };
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('assignedBuildings', 'name code')
      .populate('reportsTo', 'name email')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedBuildings', 'name code address')
      .populate('reportsTo', 'name email role')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private (Admin, Manager)
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, staffType, assignedBuildings, 
            department, shift, reportsTo, permissions } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      staffType: role === 'technician' ? staffType : null,
      assignedBuildings,
      department,
      shift,
      reportsTo,
      permissions
    });

    res.status(201).json({
      success: true,
      data: await User.findById(user._id).populate('assignedBuildings', 'name code').select('-password')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin, Manager)
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, role, staffType, assignedBuildings, department, 
            shift, reportsTo, permissions, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, role, staffType, assignedBuildings, department, 
        shift, reportsTo, permissions, isActive },
      { new: true, runValidators: true }
    ).populate('assignedBuildings', 'name code').select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get technicians by building
// @route   GET /api/users/technicians/:buildingId
// @access  Private
exports.getTechniciansByBuilding = async (req, res) => {
  try {
    const technicians = await User.find({
      role: 'technician',
      assignedBuildings: req.params.buildingId,
      isActive: true
    }).select('name email phone staffType shift isOnline currentLocation');

    res.json({ success: true, data: technicians });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user location (GPS)
// @route   PUT /api/users/location
// @access  Private
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        currentLocation: { lat, lng, updatedAt: new Date() },
        lastActive: new Date()
      },
      { new: true }
    ).select('currentLocation isOnline');

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get online users
// @route   GET /api/users/online
// @access  Private (Admin, Manager, Supervisor)
exports.getOnlineUsers = async (req, res) => {
  try {
    let query = { isOnline: true, isActive: true };

    if (req.user.role === 'manager') {
      query.assignedBuildings = { $in: req.user.assignedBuildings };
    }
    if (req.user.role === 'supervisor') {
      query.assignedBuildings = { $in: req.user.assignedBuildings };
      query.role = 'technician';
    }

    const users = await User.find(query)
      .select('name email role staffType currentLocation assignedBuildings')
      .populate('assignedBuildings', 'name code');

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// naj new FCM Added below

// ================= 🔔 SAVE FCM TOKEN =================
exports.saveFcmToken = async (req, res) => {
  try {
    const { token, device } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token required" });
    }

    const user = await User.findById(req.user.id);

    // Prevent duplicate tokens
    const exists = user.fcmTokens?.find(t => t.token === token);

    if (!exists) {
      user.fcmTokens = user.fcmTokens || [];
      user.fcmTokens.push({
        token,
        device
      });

      await user.save();
    }

    res.json({ success: true, message: "Token saved" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ================= ❌ REMOVE FCM TOKEN =================
exports.removeFcmToken = async (req, res) => {
  try {
    const { token } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { fcmTokens: { token } }
    });

    res.json({ success: true, message: "Token removed" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};