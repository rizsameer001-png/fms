# Faci Management System (FMS)

A complete enterprise-level Faci Management System with multi-role support, real-time operations, GPS tracking, and mobile workforce management.

## Technology Stack

- **Frontend Web**: React 18 + Vite + Tailwind CSS + TanStack Query + Zustand
- **Backend**: Node.js + Express.js + Socket.io
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io
- **File Storage**: Cloudinary / AWS S3
- **Notifications**: Firebase FCM + Twilio SMS + Nodemailer Email

## User Levels

| Role | Description |
|------|-------------|
| Super Admin | Full system control |
| Manager | Manages assigned buildings/projects |
| Supervisor | Handles field operations |
| Technician | Service staff (Electrician, Cleaner, Security, etc.) |
| Customer | Portal for complaints, billing, services |

## Core Modules

- Authentication & Authorization (JWT + Role-based)
- User Management
- Building & Floor Management
- Complaint Management with SLA tracking
- Preventive Maintenance (PPM)
- Attendance & GPS Tracking with Geofencing
- Billing & Invoice System
- Approval Workflow
- Real-time Chat
- Notifications (Push, SMS, Email, In-app)
- Reports & Analytics
- Dashboard per role

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed    # Create demo data
npm run dev     # Start development server
```

### Client Setup
```bash
cd client
npm install
npm run dev     # Start Vite dev server
```

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@fms.com | admin123 |
| Manager | manager@fms.com | manager123 |
| Supervisor | supervisor@fms.com | supervisor123 |
| Technician | electrician@fms.com | tech123 |
| Customer | customer@acme.com | customer123 |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/forgot-password` - Send OTP
- `POST /api/auth/reset-password` - Reset with OTP

### Users
- `GET /api/users` - List users (Admin/Manager)
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `GET /api/users/online` - Online users
- `PUT /api/users/location` - Update GPS location

### Buildings
- `GET /api/buildings` - List buildings
- `POST /api/buildings` - Create building
- `GET /api/buildings/:id` - Get building details
- `GET /api/buildings/:id/floors` - List floors

### Complaints
- `GET /api/complaints` - List complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id/assign` - Assign technician
- `PUT /api/complaints/:id/status` - Update status
- `PUT /api/complaints/:id/escalate` - Escalate

### Attendance
- `POST /api/attendance/checkin` - GPS check-in
- `POST /api/attendance/checkout` - Check-out
- `GET /api/attendance` - Attendance records

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id/complete` - Complete task
- `PUT /api/tasks/:id/verify` - Verify task

### Dashboard
- `GET /api/dashboard/admin` - Admin stats
- `GET /api/dashboard/manager` - Manager stats
- `GET /api/dashboard/supervisor` - Supervisor stats
- `GET /api/dashboard/technician` - Technician stats

## Socket.io Events

### Client -> Server
- `update_location` - Send GPS coordinates
- `join_chat` - Join chat room
- `send_message` - Send chat message
- `typing` - Typing indicator
- `emergency_alert` - Send emergency alert

### Server -> Client
- `notification` - New notification
- `new_message` - New chat message
- `location_update` - Technician location update
- `user_online` / `user_offline` - Online status
- `emergency` - Emergency broadcast

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fms_db
JWT_SECRET=your_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Firebase
FIREBASE_SERVER_KEY=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Twilio
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=

# Google Maps
GOOGLE_MAPS_API_KEY=
```

## Project Structure

```
fms/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Role-based pages
│   │   │   ├── admin/
│   │   │   ├── manager/
│   │   │   ├── supervisor/
│   │   │   ├── technician/
│   │   │   ├── customer/
│   │   │   └── auth/
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand stores
│   │   └── App.jsx
│   └── package.json
├── server/                 # Node.js Backend
│   ├── config/             # DB config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth, error, upload
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── socket/             # Socket.io handlers
│   ├── jobs/               # Cron jobs
│   ├── utils/              # Helpers
│   ├── server.js           # Entry point
│   └── seed.js             # Demo data
└── mobile/                 # Flutter apps (structure)
    ├── technician_app/
    ├── supervisor_app/
    └── customer_app/
```

## License
MIT
