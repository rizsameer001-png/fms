const express = require('express');
const router = express.Router();
const {
  getBuildings,
  getBuilding,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getFloors,
  createFloor,
  updateFloor,
  deleteFloor
} = require('../controllers/buildingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getBuildings);
router.get('/:id', protect, getBuilding);
router.post('/', protect, authorize('super_admin'), createBuilding);
router.put('/:id', protect, authorize('super_admin', 'manager'), updateBuilding);
router.delete('/:id', protect, authorize('super_admin'), deleteBuilding);

router.get('/:buildingId/floors', protect, getFloors);
router.post('/:buildingId/floors', protect, authorize('super_admin', 'manager'), createFloor);
router.put('/:buildingId/floors/:floorId', protect, authorize('super_admin', 'manager'), updateFloor);
router.delete('/:buildingId/floors/:floorId', protect, authorize('super_admin', 'manager'), deleteFloor);

module.exports = router;
