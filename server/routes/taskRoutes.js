const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateChecklist,
  completeTask,
  verifyTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTasks);
router.get('/:id', protect, getTask);
router.post('/', protect, authorize('super_admin', 'manager', 'supervisor'), createTask);
router.put('/:id', protect, authorize('super_admin', 'manager', 'supervisor'), updateTask);
router.put('/:id/checklist/:itemIndex', protect, authorize('technician'), updateChecklist);
router.put('/:id/complete', protect, authorize('technician'), completeTask);
router.put('/:id/verify', protect, authorize('super_admin', 'manager', 'supervisor'), verifyTask);
router.delete('/:id', protect, authorize('super_admin', 'manager'), deleteTask);

module.exports = router;
