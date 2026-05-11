const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { status, category, type, building, assignedTo, scheduledDate, page = 1, limit = 20 } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'technician') {
      query.assignedTo = { $in: [req.user.id] };
    } else if (req.user.role === 'supervisor') {
      query.building = { $in: req.user.assignedBuildings };
    } else if (req.user.role === 'manager') {
      query.building = { $in: req.user.assignedBuildings };
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (type) query.type = type;
    if (building) query.building = building;
    if (assignedTo) query.assignedTo = assignedTo;
    if (scheduledDate) {
      const date = new Date(scheduledDate);
      query.scheduledDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email phone staffType')
      .populate('assignedBy', 'name email')
      .populate('building', 'name code')
      .populate('floor', 'name number')
      .sort({ scheduledDate: 1, priority: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Task.countDocuments(query);

    res.json({
      success: true,
      data: tasks,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email phone staffType')
      .populate('assignedBy', 'name email')
      .populate('building', 'name code address')
      .populate('floor', 'name number')
      .populate('checklist.completedBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('verifiedBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Admin, Manager, Supervisor)
exports.createTask = async (req, res) => {
  try {
    const { title, description, type, category, building, floor, 
            assignedTo, scheduledDate, scheduledTime, duration, 
            checklist, priority, isRecurring, recurrence } = req.body;

    const task = await Task.create({
      title,
      description,
      type: type || 'routine',
      category,
      building,
      floor,
      assignedTo,
      assignedBy: req.user.id,
      scheduledDate,
      scheduledTime,
      duration,
      checklist: checklist || [],
      priority: priority || 'medium',
      isRecurring: isRecurring || false,
      recurrence
    });

    // TODO: Notify assigned technicians

    res.status(201).json({
      success: true,
      data: await Task.findById(task._id)
        .populate('assignedTo', 'name email')
        .populate('building', 'name code')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task checklist item
// @route   PUT /api/tasks/:id/checklist/:itemIndex
// @access  Private (Technician)
exports.updateChecklist = async (req, res) => {
  try {
    const { isCompleted, notes, photos } = req.body;
    const { id, itemIndex } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.assignedTo.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not assigned to this task' });
    }

    if (task.checklist[itemIndex]) {
      task.checklist[itemIndex].isCompleted = isCompleted;
      task.checklist[itemIndex].completedBy = req.user.id;
      task.checklist[itemIndex].completedAt = new Date();
      task.checklist[itemIndex].notes = notes;
      if (photos) task.checklist[itemIndex].photos = photos;
    }

    // Check if all checklist items are completed
    const allCompleted = task.checklist.every(item => item.isCompleted);
    if (allCompleted && task.checklist.length > 0) {
      task.status = 'completed';
      task.completedAt = new Date();
      task.completedBy = req.user.id;
    }

    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete task
// @route   PUT /api/tasks/:id/complete
// @access  Private (Technician)
exports.completeTask = async (req, res) => {
  try {
    const { completionNotes, completionPhotos } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        completedAt: new Date(),
        completedBy: req.user.id,
        completionNotes,
        completionPhotos: completionPhotos || []
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify task
// @route   PUT /api/tasks/:id/verify
// @access  Private (Supervisor, Manager)
exports.verifyTask = async (req, res) => {
  try {
    const { status, comment } = req.body; // status: 'approved' or 'rejected'

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Admin, Manager, Supervisor)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email').populate('building', 'name code');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Manager)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = 'cancelled';
    await task.save();

    res.json({ success: true, message: 'Task cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
