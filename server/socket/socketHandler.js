const socketAuth = require('../middleware/auth');

const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      // Verify JWT token
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../models/User');
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user-specific room
    socket.join(`user_${socket.userId}`);

    // Join role-based room
    socket.join(`role_${socket.userRole}`);

    // Join building rooms
    if (socket.user.assignedBuildings) {
      socket.user.assignedBuildings.forEach(buildingId => {
        socket.join(`building_${buildingId}`);
      });
    }

    // Update online status
    const User = require('../models/User');
    User.findByIdAndUpdate(socket.userId, { isOnline: true, lastActive: new Date() }).exec();

    // Broadcast online status
    socket.broadcast.emit('user_online', { userId: socket.userId, isOnline: true });

    // GPS Location Update
    socket.on('update_location', async (data) => {
      try {
        const { lat, lng } = data;
        await User.findByIdAndUpdate(socket.userId, {
          currentLocation: { lat, lng, updatedAt: new Date() }
        });

        // Broadcast to supervisors of same buildings
        socket.to(`building_${socket.user.assignedBuildings?.[0]}`).emit('location_update', {
          userId: socket.userId,
          lat,
          lng,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Location update error:', error);
      }
    });

    // Chat Messages
    socket.on('join_chat', (groupId) => {
      socket.join(`chat_${groupId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { Message } = require('../models/Chat');
        const message = await Message.create({
          sender: socket.userId,
          group: data.groupId,
          content: data.content,
          attachments: data.attachments || []
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar');

        io.to(`chat_${data.groupId}`).emit('new_message', populatedMessage);
      } catch (error) {
        console.error('Message error:', error);
      }
    });

    socket.on('typing', (data) => {
      socket.to(`chat_${data.groupId}`).emit('typing', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Complaint Updates
    socket.on('subscribe_complaints', (buildingId) => {
      socket.join(`complaints_${buildingId}`);
    });

    // Notifications
    socket.on('mark_notification_read', async (notificationId) => {
      const Notification = require('../models/Notification');
      await Notification.findByIdAndUpdate(notificationId, { isRead: true, readAt: new Date() });
    });

    // Attendance Updates
    socket.on('attendance_update', (data) => {
      socket.to(`building_${data.buildingId}`).emit('attendance_changed', data);
    });

    // Emergency Alert
    socket.on('emergency_alert', async (data) => {
      const { title, message, buildingId } = data;

      // Broadcast to all users in building
      io.to(`building_${buildingId}`).emit('emergency', {
        title,
        message,
        sentBy: socket.userId,
        timestamp: new Date()
      });

      // Also send to admins
      io.to('role_super_admin').emit('emergency', {
        title,
        message,
        buildingId,
        sentBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false, 
        lastActive: new Date() 
      });
      socket.broadcast.emit('user_offline', { userId: socket.userId });
    });
  });
};

module.exports = setupSocketHandlers;
