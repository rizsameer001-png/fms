const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Building = require('./models/Building');
const Floor = require('./models/Floor');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Building.deleteMany();
    await Floor.deleteMany();

    // Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@fms.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'super_admin',
      isActive: true
    });

    // Create Buildings
    const building1 = await Building.create({
      name: 'Tech Park Tower A',
      code: 'TPA-01',
      address: '123 Tech Park Road, Bangalore',
      location: { lat: 12.9716, lng: 77.5946 },
      geofenceRadius: 150,
      services: ['cleaning', 'security', 'plumbing', 'electrical'],
      isActive: true
    });

    const building2 = await Building.create({
      name: 'Corporate Hub B',
      code: 'CHB-01',
      address: '456 Business Street, Bangalore',
      location: { lat: 12.9352, lng: 77.6245 },
      geofenceRadius: 100,
      services: ['cleaning', 'security', 'catering'],
      isActive: true
    });

    // Create Floors
    await Floor.create({
      building: building1._id,
      name: 'Ground Floor',
      number: 0,
      zones: [
        {
          name: 'Reception Area',
          code: 'R-01',
          rooms: [
            { name: 'Main Reception', code: 'MR-01', type: 'common' },
            { name: 'Waiting Area', code: 'WA-01', type: 'common' }
          ]
        },
        {
          name: 'Cafeteria',
          code: 'C-01',
          rooms: [
            { name: 'Dining Hall', code: 'DH-01', type: 'common' },
            { name: 'Kitchen', code: 'K-01', type: 'kitchen' }
          ]
        }
      ],
      services: ['cleaning', 'security', 'catering']
    });

    await Floor.create({
      building: building1._id,
      name: 'First Floor',
      number: 1,
      zones: [
        {
          name: 'Office Zone A',
          code: 'OZA-01',
          rooms: [
            { name: 'Office 101', code: 'O-101', type: 'office' },
            { name: 'Office 102', code: 'O-102', type: 'office' },
            { name: 'Meeting Room', code: 'MR-101', type: 'office' }
          ]
        }
      ],
      services: ['cleaning', 'electrical']
    });

    // Create Manager
    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@fms.com',
      phone: '8888888888',
      password: 'manager123',
      role: 'manager',
      assignedBuildings: [building1._id, building2._id],
      department: 'Operations',
      shift: { start: '09:00', end: '18:00' },
      isActive: true
    });

    // Create Supervisor
    const supervisor = await User.create({
      name: 'Sarah Supervisor',
      email: 'supervisor@fms.com',
      phone: '7777777777',
      password: 'supervisor123',
      role: 'supervisor',
      assignedBuildings: [building1._id],
      department: 'Field Operations',
      shift: { start: '08:00', end: '17:00' },
      reportsTo: manager._id,
      isActive: true
    });

    // Create Technicians
    const technician1 = await User.create({
      name: 'Mike Electrician',
      email: 'electrician@fms.com',
      phone: '6666666666',
      password: 'tech123',
      role: 'technician',
      staffType: 'electrician',
      assignedBuildings: [building1._id],
      department: 'Maintenance',
      shift: { start: '09:00', end: '17:00' },
      reportsTo: supervisor._id,
      isActive: true
    });

    const technician2 = await User.create({
      name: 'Lisa Cleaner',
      email: 'cleaner@fms.com',
      phone: '5555555555',
      password: 'tech123',
      role: 'technician',
      staffType: 'cleaner',
      assignedBuildings: [building1._id, building2._id],
      department: 'Housekeeping',
      shift: { start: '06:00', end: '14:00' },
      reportsTo: supervisor._id,
      isActive: true
    });

    // Create Customer
    const customer = await User.create({
      name: 'Acme Corp',
      email: 'customer@acme.com',
      phone: '4444444444',
      password: 'customer123',
      role: 'customer',
      companyName: 'Acme Corporation',
      billingAddress: '789 Corporate Ave, Bangalore',
      isActive: true
    });

    // Update building references
    building1.manager = manager._id;
    building1.supervisors = [supervisor._id];
    await building1.save();

    building2.manager = manager._id;
    await building2.save();

    console.log('✅ Seed data created successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Super Admin: admin@fms.com / admin123');
    console.log('Manager: manager@fms.com / manager123');
    console.log('Supervisor: supervisor@fms.com / supervisor123');
    console.log('Technician (Electrician): electrician@fms.com / tech123');
    console.log('Technician (Cleaner): cleaner@fms.com / tech123');
    console.log('Customer: customer@acme.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
