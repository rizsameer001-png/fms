const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const Task = require('../models/Task');
const Invoice = require('../models/Invoice');
//const NotificationService = require('./notificationService');
const NotificationService = require('../services/notificationService');

const setupCronJobs = () => {
  // Check SLA breaches every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const breachedComplaints = await Complaint.find({
        status: { $nin: ['closed', 'verified', 'resolved'] },
        slaDeadline: { $lt: now },
        $or: [
          { lastSLANotification: { $exists: false } },
          { lastSLANotification: { $lt: new Date(now - 60 * 60 * 1000) } }
        ]
      }).populate('assignedTo', 'name').populate('building', 'name');

      for (const complaint of breachedComplaints) {
        // Notify assigned technician
        if (complaint.assignedTo) {
          await NotificationService.createNotification({
            recipient: complaint.assignedTo._id,
            title: 'SLA Breach Alert',
            body: `Complaint #${complaint.ticketNumber} SLA has been breached!`,
            type: 'complaint',
            referenceModel: 'Complaint',
            referenceId: complaint._id,
            channels: ['push', 'in_app']
          });
        }

        // Notify supervisors
        const supervisors = await require('../models/User').find({
          role: 'supervisor',
          assignedBuildings: complaint.building,
          isActive: true
        });

        for (const sup of supervisors) {
          await NotificationService.createNotification({
            recipient: sup._id,
            title: 'SLA Breach Alert',
            body: `Complaint #${complaint.ticketNumber} in ${complaint.building?.name} has breached SLA`,
            type: 'complaint',
            referenceModel: 'Complaint',
            referenceId: complaint._id,
            channels: ['push', 'in_app', 'email']
          });
        }

        complaint.lastSLANotification = now;
        await complaint.save();
      }
    } catch (error) {
      console.error('SLA check error:', error);
    }
  });

  // Check overdue tasks daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueTasks = await Task.find({
        scheduledDate: { $lt: today },
        status: { $nin: ['completed', 'cancelled'] }
      }).populate('assignedTo', 'name').populate('building', 'name');

      for (const task of overdueTasks) {
        for (const techId of task.assignedTo) {
          await NotificationService.createNotification({
            recipient: techId,
            title: 'Overdue Task',
            body: `Task "${task.title}" is overdue`,
            type: 'task',
            referenceModel: 'Task',
            referenceId: task._id,
            channels: ['push', 'in_app']
          });
        }
      }
    } catch (error) {
      console.error('Overdue task check error:', error);
    }
  });

  // Send bill due reminders daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const dueInvoices = await Invoice.find({
        status: { $in: ['sent', 'partial'] },
        dueDate: { $lte: threeDaysFromNow },
        $or: [
          { lastReminder: { $exists: false } },
          { lastReminder: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      });

      for (const invoice of dueInvoices) {
        await NotificationService.notifyBillDue(invoice);
        invoice.lastReminder = new Date();
        await invoice.save();
      }
    } catch (error) {
      console.error('Bill reminder error:', error);
    }
  });

  // Mark absent users daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const Attendance = require('../models/Attendance');
      const User = require('../models/User');

      // Find technicians who didn't check in
      const technicians = await User.find({ role: 'technician', isActive: true });

      for (const tech of technicians) {
        const attendance = await Attendance.findOne({
          user: tech._id,
          date: yesterday
        });

        if (!attendance) {
          await Attendance.create({
            user: tech._id,
            date: yesterday,
            status: 'absent'
          });
        }
      }
    } catch (error) {
      console.error('Absent marking error:', error);
    }
  });

  console.log('✅ Cron jobs scheduled');
};

module.exports = setupCronJobs;
