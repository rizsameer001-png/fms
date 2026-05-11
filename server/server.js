// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const morgan = require('morgan');
// const http = require('http');
// const { Server } = require('socket.io');
// require('dotenv').config();

// const connectDB = require('./config/db');
// const errorHandler = require('./middleware/errorHandler');
// const setupSocketHandlers = require('./socket/socketHandler');
// const setupCronJobs = require('./jobs/cronJobs');

// // Route imports
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const buildingRoutes = require('./routes/buildingRoutes');
// const complaintRoutes = require('./routes/complaintRoutes');
// const attendanceRoutes = require('./routes/attendanceRoutes');
// const taskRoutes = require('./routes/taskRoutes');
// const invoiceRoutes = require('./routes/invoiceRoutes');
// const chatRoutes = require('./routes/chatRoutes');
// const approvalRoutes = require('./routes/approvalRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const dashboardRoutes = require('./routes/dashboardRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');

// // Connect to database
// connectDB();

// const app = express();
// const server = http.createServer(app);

// // Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//   },
// });

// // Make io accessible globally
// global.io = io;
// setupSocketHandlers(io);

// // Security middleware
// app.use(helmet());
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true
// }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// // Body parser
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Logger
// app.use(morgan('dev'));

// // Static files
// app.use('/uploads', express.static('uploads'));

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/buildings', buildingRoutes);
// app.use('/api/complaints', complaintRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/approvals', approvalRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/payments', paymentRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ success: true, message: 'FMS Server is running', timestamp: new Date() });
// });

// // Error handler
// app.use(errorHandler);

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// // Setup cron jobs
// setupCronJobs();

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📡 Socket.io ready for real-time connections`);
//   console.log(`⏰ Cron jobs scheduled`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error(`Unhandled Rejection: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// module.exports = { app, server, io };


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const setupSocketHandlers = require('./socket/socketHandler');
const setupCronJobs = require('./jobs/cronJobs');

// 🔥 NEW: Firebase init (IMPORTANT for FCM)
require('./config/firebase'); // <-- ADD THIS

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const taskRoutes = require('./routes/taskRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const chatRoutes = require('./routes/chatRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// 🔥 IMPROVED: Socket CORS config
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'], // 🔥 NEW
    credentials: true,
  },
});

// Make io accessible globally
global.io = io;
setupSocketHandlers(io);

// ================= SECURITY =================
app.use(helmet());

// 🔥 IMPROVED: CORS (more flexible)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 🔥 NEW
}));

// ================= RATE LIMIT =================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ================= BODY PARSER =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ================= LOGGER =================
app.use(morgan('dev'));

// ================= STATIC =================
app.use('/uploads', express.static('uploads'));

// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);

// 🔥 NEW: Test FCM route (VERY USEFUL)
app.get('/api/test-fcm', async (req, res) => {
  try {
    const admin = require('./config/firebase');

    const response = await admin.messaging().send({
      topic: 'test',
      notification: {
        title: '🔥 FCM Working',
        body: 'Your Firebase setup is correct!'
      }
    });

    res.json({ success: true, response });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================= HEALTH =================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FMS Server is running',
    timestamp: new Date()
  });
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ================= CRON =================
setupCronJobs();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`⏰ Cron jobs scheduled`);
  console.log(`🔔 FCM Ready`); // 🔥 NEW
});

// ================= ERROR SAFE =================
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };