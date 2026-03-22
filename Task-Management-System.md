# Trackora

A full-stack task management application with role-based access control, real-time task tracking, and comprehensive reporting features.

## Features

### Admin Features
- **Dashboard Analytics**: View task distribution, priority levels, and statistics
- **Task Management**: Create, update, and delete tasks
- **Team Management**: View team members with their task statistics
- **Task Assignment**: Assign tasks to multiple team members
- **Reports**: Export tasks and user reports to Excel
- **User Monitoring**: Track pending, in-progress, and completed tasks per user

### User Features
- **Personal Dashboard**: View assigned tasks and personal statistics
- **Task Details**: View complete task information with attachments
- **Todo Checklist**: Mark todo items as complete/incomplete
- **Task Status**: Update task status (Pending, In Progress, Completed)
- **Progress Tracking**: Automatic progress calculation based on checklist completion

### General Features
- **Authentication**: Secure JWT-based authentication
- **Profile Management**: Upload and manage profile pictures
- **Task Priorities**: Low, Medium, High priority levels
- **Due Date Tracking**: Monitor overdue tasks
- **File Attachments**: Add links/attachments to tasks
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **ExcelJS** for report generation
- **bcryptjs** for password hashing

### Frontend
- **React** 19.2.0
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **React Hot Toast** for notifications
- **Moment.js** for date formatting

## Project Structure

```
Task Management Project/
├── Backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── constants/       # Application constants
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Auth & upload middlewares
│   │   ├── models/          # MongoDB schemas
│   │   ├── repositories/    # Database operations
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── uploads/         # Uploaded files
│   │   └── index.js         # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
└── Frontend/
    └── Task-Management/
        ├── src/
        │   ├── components/  # Reusable components
        │   ├── context/     # React context
        │   ├── hooks/       # Custom hooks
        │   ├── pages/       # Page components
        │   ├── routes/      # Route configuration
        │   ├── utils/       # Utility functions
        │   └── App.jsx      # Main component
        └── package.json
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or remote)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
MONGO_URI=mongodb://localhost:27017/tms
ADMIN_INVITE_TOKEN=your_admin_invite_token
JWT_SECRET=your_jwt_secret_key
PORT=8000
CLIENT_URL=http://localhost:5173
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend/Task-Management
```

2. Install dependencies:
```bash
npm install
```

3. Update the API base URL in `src/utils/apiPaths.js`:
```javascript
export const BASE_URL = "http://localhost:8000";
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update user profile
- `POST /api/auth/upload-image` - Upload profile picture

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by role)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (Admin only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin only)
- `PUT /api/tasks/:id/status` - Update task status
- `PUT /api/tasks/:id/todo` - Update todo checklist
- `GET /api/tasks/dashboard-data` - Get admin dashboard data
- `GET /api/tasks/user-dashboard-data` - Get user dashboard data

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Reports
- `GET /api/reports/export/tasks` - Export tasks to Excel (Admin only)
- `GET /api/reports/export/users` - Export users to Excel (Admin only)

## User Roles

### Admin
- Full access to all features
- Can create, update, and delete tasks
- Can view all users and their statistics
- Can export reports
- Register with `ADMIN_INVITE_TOKEN`

### Member
- Can view assigned tasks
- Can update task status and checklist
- Can view personal dashboard
- Register without invite token

## Default Admin Registration

To create an admin account, use the `ADMIN_INVITE_TOKEN` from your `.env` file during registration.

## Environment Variables

### Backend (.env)
```env
MONGO_URI=your_mongo_db
ADMIN_INVITE_TOKEN=your_secure_token
JWT_SECRET=your_jwt_secret
PORT=8000
CLIENT_URL=http://localhost:5173
```

## Features in Detail

### Task Status Flow
1. **Pending** - Initial state
2. **In Progress** - When any todo item is checked
3. **Completed** - When all todo items are checked (100% progress)

### Progress Calculation
- Automatically calculated based on completed todo items
- Formula: `(completed items / total items) * 100`
- Updates task status based on progress

### File Upload
- Profile pictures stored in `Backend/src/uploads/`
- Accessible via `/uploads/:filename`
- Supported formats: JPG, JPEG, PNG

### Reports
- Excel format (.xlsx)
- Tasks report includes: ID, title, description, priority, status, due date, assigned users
- Users report includes: name, email, total tasks, pending, in-progress, completed counts

## Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Role-based access control
- CORS configuration

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
ISC

## Author
Task Management System

## Support
For issues and questions, please create an issue in the repository.
