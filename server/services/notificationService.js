const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  static async createNotification({ recipient, title, body, type, referenceModel, referenceId, channels = ['in_app'] }) {
    try {
      const notification = await Notification.create({
        recipient,
        title,
        body,
        type,
        referenceModel,
        referenceId,
        channels: channels.map(channel => ({
          type: channel,
          status: 'pending'
        }))
      });

      // Send push notification via Socket.io
      const io = global.io;
      if (io) {
        io.to(`user_${recipient}`).emit('notification', {
          id: notification._id,
          title,
          body,
          type,
          referenceModel,
          referenceId,
          createdAt: new Date()
        });
      }

      // TODO: Send Firebase Push Notification
      // TODO: Send SMS via Twilio
      // TODO: Send Email via Nodemailer

      return notification;
    } catch (error) {
      console.error('Notification creation error:', error);
    }
  }

  static async notifyComplaintCreated(complaint) {
    // Notify supervisors of the building
    const supervisors = await User.find({
      role: 'supervisor',
      assignedBuildings: complaint.building,
      isActive: true
    });

    for (const supervisor of supervisors) {
      await this.createNotification({
        recipient: supervisor._id,
        title: 'New Complaint Received',
        body: `Complaint #${complaint.ticketNumber}: ${complaint.title}`,
        type: 'complaint',
        referenceModel: 'Complaint',
        referenceId: complaint._id,
        channels: ['push', 'in_app']
      });
    }
  }

  static async notifyComplaintAssigned(complaint) {
    if (complaint.assignedTo) {
      await this.createNotification({
        recipient: complaint.assignedTo,
        title: 'New Task Assigned',
        body: `Complaint #${complaint.ticketNumber} has been assigned to you`,
        type: 'complaint',
        referenceModel: 'Complaint',
        referenceId: complaint._id,
        channels: ['push', 'in_app']
      });
    }
  }

  static async notifyTaskCreated(task) {
    for (const technicianId of task.assignedTo) {
      await this.createNotification({
        recipient: technicianId,
        title: 'New Task Assigned',
        body: `${task.title} - ${task.category}`,
        type: 'task',
        referenceModel: 'Task',
        referenceId: task._id,
        channels: ['push', 'in_app']
      });
    }
  }

  static async notifyApprovalRequest(approval) {
    const firstApprover = approval.approvers.find(a => a.level === 1);
    if (firstApprover) {
      await this.createNotification({
        recipient: firstApprover.user,
        title: 'Approval Request',
        body: `${approval.title} requires your approval`,
        type: 'approval',
        referenceModel: 'Approval',
        referenceId: approval._id,
        channels: ['push', 'in_app', 'email']
      });
    }
  }

  static async notifyBillDue(invoice) {
    await this.createNotification({
      recipient: invoice.customer,
      title: 'Bill Due',
      body: `Invoice #${invoice.invoiceNumber} of ₹${invoice.totalAmount} is due on ${new Date(invoice.dueDate).toLocaleDateString()}`,
      type: 'billing',
      referenceModel: 'Invoice',
      referenceId: invoice._id,
      channels: ['push', 'email', 'sms']
    });
  }
}

module.exports = NotificationService;
