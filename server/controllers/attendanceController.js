const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Building = require('../models/Building');
const geolib = require('geolib');

// @desc    Check-in
// @route   POST /api/attendance/checkin
// @access  Private (Technician, Supervisor)
exports.checkIn = async (req, res) => {
  try {
    const { lat, lng, photo, deviceInfo } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      user: req.user.id,
      date: today
    });

    if (attendance && attendance.checkIn.time) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    // Get user's assigned buildings for geofence check
    const user = await User.findById(req.user.id).populate('assignedBuildings');

    let isWithinGeofence = false;
    let nearestBuilding = null;
    let distance = null;

    if (user.assignedBuildings && user.assignedBuildings.length > 0) {
      for (const building of user.assignedBuildings) {
        if (building.location) {
          const dist = geolib.getDistance(
            { latitude: lat, longitude: lng },
            { latitude: building.location.lat, longitude: building.location.lng }
          );

          if (dist <= (building.geofenceRadius || 100)) {
            isWithinGeofence = true;
            nearestBuilding = building;
            distance = dist;
            break;
          }

          if (!distance || dist < distance) {
            distance = dist;
            nearestBuilding = building;
          }
        }
      }
    }

    // Determine status
    const now = new Date();
    const shiftStart = user.shift?.start || '09:00';
    const [hours, minutes] = shiftStart.split(':').map(Number);
    const shiftStartTime = new Date(today);
    shiftStartTime.setHours(hours, minutes, 0, 0);

    let status = 'present';
    const gracePeriod = 15 * 60 * 1000; // 15 minutes grace

    if (now > new Date(shiftStartTime.getTime() + gracePeriod)) {
      status = 'late';
    }

    if (!attendance) {
      attendance = await Attendance.create({
        user: req.user.id,
        date: today,
        checkIn: {
          time: now,
          location: { lat, lng },
          isWithinGeofence,
          distance,
          photo,
          deviceInfo
        },
        status,
        shift: user.shift
      });
    } else {
      attendance.checkIn = {
        time: now,
        location: { lat, lng },
        isWithinGeofence,
        distance,
        photo,
        deviceInfo
      };
      attendance.status = status;
      await attendance.save();
    }

    // Update user online status
    await User.findByIdAndUpdate(req.user.id, { isOnline: true });

    res.json({
      success: true,
      data: attendance,
      message: isWithinGeofence ? 'Check-in successful' : 'Check-in recorded (outside geofence)'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-out
// @route   POST /api/attendance/checkout
// @access  Private (Technician, Supervisor)
exports.checkOut = async (req, res) => {
  try {
    const { lat, lng, photo } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today
    });

    if (!attendance || !attendance.checkIn.time) {
      return res.status(400).json({ success: false, message: 'No check-in found for today' });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    const now = new Date();
    attendance.checkOut = {
      time: now,
      location: { lat, lng },
      photo
    };

    // Calculate total hours
    const totalMs = now - attendance.checkIn.time;
    attendance.totalHours = parseFloat((totalMs / (1000 * 60 * 60)).toFixed(2));

    // Calculate overtime
    const user = await User.findById(req.user.id);
    const shiftEnd = user.shift?.end || '17:00';
    const [endHours, endMinutes] = shiftEnd.split(':').map(Number);
    const shiftEndTime = new Date(today);
    shiftEndTime.setHours(endHours, endMinutes, 0, 0);

    if (now > shiftEndTime) {
      attendance.overtime = parseFloat(((now - shiftEndTime) / (1000 * 60 * 60)).toFixed(2));
    }

    await attendance.save();

    // Update user online status
    await User.findByIdAndUpdate(req.user.id, { isOnline: false, lastActive: now });

    res.json({
      success: true,
      data: attendance,
      message: 'Check-out successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const { user, startDate, endDate, status, page = 1, limit = 20 } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'technician') {
      query.user = req.user.id;
    } else if (req.user.role === 'supervisor') {
      // Get technicians under this supervisor
      const technicians = await User.find({
        role: 'technician',
        assignedBuildings: { $in: req.user.assignedBuildings }
      }).select('_id');
      query.user = { $in: technicians.map(t => t._id) };
    } else if (req.user.role === 'manager') {
      const technicians = await User.find({
        assignedBuildings: { $in: req.user.assignedBuildings }
      }).select('_id');
      query.user = { $in: technicians.map(t => t._id) };
    }

    if (user) query.user = user;
    if (status) query.status = status;

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'name email staffType')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendance,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (Admin, Manager, Supervisor)
exports.getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // For non-admin users, filter by building
    if (req.user.role !== 'super_admin') {
      const users = await User.find({
        assignedBuildings: { $in: req.user.assignedBuildings }
      }).select('_id');
      matchQuery.user = { $in: users.map(u => u._id) };
    }

    const stats = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const dailyStats = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          totalHours: { $sum: '$totalHours' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        dailyStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
