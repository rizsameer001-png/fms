const Building = require('../models/Building');
const Floor = require('../models/Floor');

// @desc    Get all buildings
// @route   GET /api/buildings
// @access  Private
exports.getBuildings = async (req, res) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'manager') {
      query._id = { $in: req.user.assignedBuildings };
    } else if (req.user.role === 'supervisor') {
      query._id = { $in: req.user.assignedBuildings };
    } else if (req.user.role === 'technician') {
      query._id = { $in: req.user.assignedBuildings };
    }

    const buildings = await Building.find(query)
      .populate('manager', 'name email phone')
      .populate('supervisors', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: buildings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single building
// @route   GET /api/buildings/:id
// @access  Private
exports.getBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
      .populate('manager', 'name email phone')
      .populate('supervisors', 'name email phone');

    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    // Get floors
    const floors = await Floor.find({ building: req.params.id });

    res.json({ 
      success: true, 
      data: { ...building.toObject(), floors } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create building
// @route   POST /api/buildings
// @access  Private (Admin)
exports.createBuilding = async (req, res) => {
  try {
    const { name, code, address, location, geofenceRadius, services, manager, supervisors } = req.body;

    const building = await Building.create({
      name,
      code,
      address,
      location,
      geofenceRadius,
      services,
      manager,
      supervisors
    });

    res.status(201).json({
      success: true,
      data: await Building.findById(building._id)
        .populate('manager', 'name email')
        .populate('supervisors', 'name email')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update building
// @route   PUT /api/buildings/:id
// @access  Private (Admin, Manager)
exports.updateBuilding = async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'name email').populate('supervisors', 'name email');

    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    res.json({ success: true, data: building });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete building
// @route   DELETE /api/buildings/:id
// @access  Private (Admin)
exports.deleteBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    // Soft delete
    building.isActive = false;
    await building.save();

    res.json({ success: true, message: 'Building deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Floor Controllers
exports.getFloors = async (req, res) => {
  try {
    const floors = await Floor.find({ building: req.params.buildingId })
      .sort({ number: 1 });
    res.json({ success: true, data: floors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFloor = async (req, res) => {
  try {
    const { name, number, zones, services } = req.body;

    const floor = await Floor.create({
      building: req.params.buildingId,
      name,
      number,
      zones,
      services
    });

    res.status(201).json({ success: true, data: floor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFloor = async (req, res) => {
  try {
    const floor = await Floor.findByIdAndUpdate(
      req.params.floorId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!floor) {
      return res.status(404).json({ success: false, message: 'Floor not found' });
    }

    res.json({ success: true, data: floor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFloor = async (req, res) => {
  try {
    await Floor.findByIdAndUpdate(req.params.floorId, { isActive: false });
    res.json({ success: true, message: 'Floor deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
