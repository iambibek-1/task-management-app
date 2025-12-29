# ⚡ TaskFlow - Streamline Your Workflow

A modern, full-stack task management application built with React, TypeScript, Node.js, Express, and MySQL. Features real-time updates, user authentication, task management, and role-based access control with a sleek dark theme interface.

## ✨ Features

- 🔐 **User Authentication** - JWT-based login and registration
- ⚡ **Real-Time Updates** - Live task updates with Socket.IO
- ✅ **Task Management** - Create, read, update, and delete tasks
- � ***Multi-User Assignment** - Assign multiple users to a single task
- 📅 **Due Date Tracking** - Set and track task deadlines
- 🎯 **Priority Levels** - Low, Medium, and High priority tasks
- �  **Live Dashboard** - Real-time statistics and upcoming deadlines
- 🔒 **Role-Based Access Control** - Admin and User roles with different permissions
- ✅ **Task Completion** - One-click task completion with live updates
- � ***Email Notifications** - Automatic emails when tasks are assigned
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern Dark UI** - Clean, professional interface with blue accent colors
- 📖 **API Documentation** - Interactive Swagger documentation
- � **ConneSction Status** - Live/Offline indicator for real-time features
- 📝 **Smart Text Truncation** - Expandable descriptions with modal popups

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- React Router DOM
- Socket.IO Client (Real-time updates)
- Lucide React (Icons)
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- Socket.IO (Real-time communication)
- Sequelize ORM
- MySQL
- JWT Authentication
- Swagger UI

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd taskflow-app
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=3001
ENVIRONMENT=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task-manage-db
DB_PORT=3306

JWT_SECRET_KEY=your-secret-key

# Email Configuration (Optional - for task assignment notifications)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-email@ethereal.email
SMTP_PASS=your-ethereal-password
SMTP_FROM="TaskFlow <noreply@taskflow.com>"
```

**Note:** For email setup instructions, see `backend/EMAIL_SETUP.md`

Run migrations:
```bash
npx sequelize-cli db:migrate
```

Optional - Seed demo data:
```bash
npx sequelize-cli db:seed:all
```

Build and start:
```bash
npm run build
npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🚀 Usage

1. **Access TaskFlow**: Open http://localhost:5173
2. **Sign up**: Create a new account (defaults to 'user' role)
3. **Create Admin User**: See `backend/CREATE_ADMIN.md` for instructions
4. **Login**: Use your credentials to access the dashboard
5. **Real-Time Dashboard**: View live task statistics and updates
6. **Manage Tasks**: 
   - **Admin**: Create, edit, delete, and assign tasks with live updates
   - **User**: View assigned tasks and mark them complete in real-time
7. **Live Updates**: See instant notifications when tasks are created, updated, or completed
8. **Connection Status**: Monitor real-time connection with Live/Offline indicator
9. **Smart UI**: Click "...more" on long descriptions to view in popup modal

### Quick Start for Testing
See `QUICK_START_RBAC.md` for a step-by-step testing guide.

## ⚡ Real-Time Features

TaskFlow uses Socket.IO to provide instant updates across all connected users:

- **Live Task Creation** - New tasks appear instantly for all relevant users
- **Real-Time Updates** - Task edits sync immediately across all sessions
- **Instant Completion** - Task status changes update live for all users
- **Live Notifications** - In-app notifications for all task activities
- **Connection Monitoring** - Visual indicator shows real-time connection status
- **Auto-Reconnection** - Automatic reconnection with exponential backoff

### Socket Events
- `task-created` - New task notifications
- `task-updated` - Task modification updates
- `task-deleted` - Task removal notifications
- `task-completed` - Task completion updates

## 📚 API Documentation

Access the interactive API documentation at:
```
http://localhost:3001/api-docs
```

## 🗂️ Project Structure

```
taskflow-app/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/    # Socket-enabled controllers
│   │   │   └── routes/
│   │   ├── config/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── services/
│   │   └── server.ts          # Socket.IO server setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── TruncatedText.tsx  # Smart text truncation
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── socketService.ts   # Real-time client
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## 🔑 Key Features Explained

### Real-Time Updates
- **Instant Sync**: All task changes sync immediately across all connected users
- **Live Dashboard**: Statistics update in real-time without page refresh
- **Connection Status**: Visual indicator shows when real-time features are active
- **Smart Notifications**: Non-intrusive notifications for task activities
- **Room-Based Updates**: Users only receive relevant updates (assigned tasks + admin sees all)

### Role-Based Access Control

#### Admin Role
- ✅ View all tasks in real-time
- ✅ Create, edit, and delete tasks with live updates
- ✅ Assign tasks to multiple users
- ✅ Access user management page
- ✅ View all users
- ✅ Receive all task notifications

#### User Role
- ✅ View only assigned tasks with live updates
- ✅ Mark assigned tasks as complete in real-time
- ✅ Filter tasks by priority
- ✅ Receive notifications for assigned tasks only
- ❌ Cannot create, edit, or delete tasks
- ❌ Cannot access user management
- ❌ Cannot see other users' tasks

### Enhanced UI/UX
- **Dark Theme**: Professional dark interface with blue accent colors
- **Smart Text Handling**: Long descriptions show "...more" with modal popup
- **Connection Indicator**: Live/Offline status with animated icons
- **Responsive Design**: Optimized for all screen sizes
- **Modern Typography**: Clean, readable fonts with proper hierarchy
- **Smooth Animations**: Subtle transitions and hover effects

### Task Management
- Create tasks with title, description, status, and priority
- Set due dates for deadline tracking
- Assign multiple users to collaborate on tasks
- Filter tasks by priority (Low, Medium, High)
- One-click task completion with real-time updates
- Update task status (Incomplete, In Progress, Completed)
- Smart description truncation with expandable modals

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Protected routes with role-based access control
- CORS enabled for frontend-backend communication
- Socket.IO rooms for secure real-time updates
- User-specific and admin-only event channels

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb, #3b82f6)
- **Background**: Dark grays (#374151, #1f2937, #4b5563)
- **Text**: Light grays (#f9fafb, #d1d5db, #9ca3af)
- **Success**: Green (#10b981)
- **Danger**: Red (#ef4444)
- **Warning**: Orange (#f59e0b)

### Typography
- **Font Family**: Inter, system fonts
- **Headings**: Bold, proper hierarchy
- **Body**: Clean, readable line height
- **UI Elements**: Medium weight for emphasis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for efficient task management and real-time collaboration

## 📚 Additional Documentation

- **`ROLE_BASED_ACCESS.md`** - Complete RBAC documentation
- **`QUICK_START_RBAC.md`** - Quick start guide for testing roles
- **`IMPLEMENTATION_SUMMARY.md`** - Technical implementation details
- **`backend/EMAIL_SETUP.md`** - Email configuration guide
- **`backend/CREATE_ADMIN.md`** - How to create admin users

## 🐛 Known Issues

- Email notifications require SMTP configuration (see EMAIL_SETUP.md)
- Role must be set via database for existing users (see CREATE_ADMIN.md)
- Real-time features require both frontend and backend to be running

## 📝 Recent Updates

### v2.0.0 - Real-Time Edition
- ✅ **Socket.IO Integration** - Real-time task updates
- ✅ **New Branding** - TaskFlow with modern blue theme
- ✅ **Dark UI Theme** - Professional dark interface
- ✅ **Smart Text Truncation** - Modal popups for long descriptions
- ✅ **Connection Status** - Live/Offline indicators
- ✅ **Enhanced Dashboard** - Real-time statistics
- ✅ **Improved UX** - Better navigation and visual feedback

### Future Enhancements
- Task comments and activity log
- File attachments to tasks
- Task categories and tags
- Export tasks to CSV/PDF
- Mobile app version
- Task templates
- Recurring tasks
- Time tracking
- Team-based access control
- Push notifications
- Offline mode with sync

---

**Experience the future of task management with TaskFlow! ⚡**

*Real-time collaboration • Modern interface • Powerful features*