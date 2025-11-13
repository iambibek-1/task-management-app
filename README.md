# � Taask Management System

A full-stack task management application built with React, TypeScript, Node.js, Express, and MySQL. Features include user authentication, task CRUD operations, multi-user assignment, and role-based access control.

## ✨ Features

- 🔐 **User Authentication** - JWT-based login and registration
- ✅ **Task Management** - Create, read, update, and delete tasks
- 👥 **Multi-User Assignment** - Assign multiple users to a single task
- 📅 **Due Date Tracking** - Set and track task deadlines
- 🎯 **Priority Levels** - Low, Medium, and High priority tasks
- 📊 **Dashboard** - Visual overview with statistics and upcoming deadlines
- 🔒 **Role-Based Access Control** - Admin and User roles with different permissions
- ✅ **Task Completion** - One-click task completion button
- 📧 **Email Notifications** - Automatic emails when tasks are assigned
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean and intuitive user interface
- 📖 **API Documentation** - Interactive Swagger documentation

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- React Router DOM
- Lucide React (Icons)
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
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
cd task-management-app
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
SMTP_FROM="Task Manager <noreply@taskmanager.com>"
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

1. **Access the application**: Open http://localhost:5173
2. **Sign up**: Create a new account (defaults to 'user' role)
3. **Create Admin User**: See `backend/CREATE_ADMIN.md` for instructions
4. **Login**: Use your credentials to log in
5. **Dashboard**: View task statistics and upcoming deadlines
6. **Manage Tasks**: 
   - **Admin**: Create, edit, delete, and assign tasks
   - **User**: View assigned tasks and mark them complete
7. **Email Notifications**: Users receive emails when assigned to tasks
8. **Admin Features**: Access Users page to manage all users

### Quick Start for Testing
See `QUICK_START_RBAC.md` for a step-by-step testing guide.

## 📚 API Documentation

Access the interactive API documentation at:
```
http://localhost:3001/api-docs
```

## 🗂️ Project Structure

```
task-management-app/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   ├── config/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── services/
│   │   └── validators/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## 🔑 Key Features Explained

### Role-Based Access Control

#### Admin Role
- ✅ View all tasks in the system
- ✅ Create, edit, and delete tasks
- ✅ Assign tasks to multiple users
- ✅ Access user management page
- ✅ View all users
- ✅ Mark tasks as complete

#### User Role
- ✅ View only assigned tasks
- ✅ Mark assigned tasks as complete
- ✅ Filter tasks by priority
- ❌ Cannot create, edit, or delete tasks
- ❌ Cannot access user management
- ❌ Cannot see other users' tasks

**For detailed RBAC documentation, see `ROLE_BASED_ACCESS.md`**

### Task Management
- Create tasks with title, description, status, and priority
- Set due dates for deadline tracking
- Assign multiple users to collaborate on tasks
- Filter tasks by priority (Low, Medium, High)
- One-click task completion button
- Update task status (Incomplete, In Progress, Completed)

### Email Notifications
- Automatic emails when users are assigned to tasks
- Professional HTML email template
- Includes task title, description, and due date
- Configurable SMTP settings
- Works with Gmail, SendGrid, AWS SES, or test services

### User Management (Admin Only)
- View all registered users
- Create new users with role assignment
- Update user information
- Delete users

### Dashboard
- Role-specific views (Admin Dashboard vs My Dashboard)
- Total tasks count (filtered by role)
- Completed, in-progress, and incomplete tasks
- Overdue tasks tracking
- High priority tasks overview
- Recent tasks list
- Upcoming deadlines

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Protected routes with role-based access control
- CORS enabled for frontend-backend communication

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for efficient task management

## 📚 Additional Documentation

- **`ROLE_BASED_ACCESS.md`** - Complete RBAC documentation
- **`QUICK_START_RBAC.md`** - Quick start guide for testing roles
- **`IMPLEMENTATION_SUMMARY.md`** - Technical implementation details
- **`backend/EMAIL_SETUP.md`** - Email configuration guide
- **`backend/CREATE_ADMIN.md`** - How to create admin users

## 🐛 Known Issues

- Email notifications require SMTP configuration (see EMAIL_SETUP.md)
- Role must be set via database for existing users (see CREATE_ADMIN.md)

## 📝 Future Enhancements

- ✅ ~~Email notifications for task assignments~~ (Implemented!)
- ✅ ~~Role-based access control~~ (Implemented!)
- ✅ ~~Task completion button~~ (Implemented!)
- Task comments and activity log
- File attachments to tasks
- Task categories and tags
- Export tasks to CSV/PDF
- Real-time updates with WebSockets
- Mobile app version
- Task templates
- Recurring tasks
- Time tracking
- Team-based access control

---

**Happy Task Managing! 🎉**
