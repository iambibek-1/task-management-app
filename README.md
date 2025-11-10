# � Taask Management System

A full-stack task management application built with React, TypeScript, Node.js, Express, and MySQL. Features include user authentication, task CRUD operations, multi-user assignment, and role-based access control.

## ✨ Features

- 🔐 **User Authentication** - JWT-based login and registration
- ✅ **Task Management** - Create, read, update, and delete tasks
- 👥 **Multi-User Assignment** - Assign multiple users to a single task
- 📅 **Due Date Tracking** - Set and track task deadlines
- 🎯 **Priority Levels** - Low, Medium, and High priority tasks
- � **Duashboard** - Visual overview with statistics and upcoming deadlines
- 🔒 **Role-Based Access** - Admin and User roles with different permissions
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
```

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
2. **Sign up**: Create a new account
3. **Login**: Use your credentials to log in
4. **Dashboard**: View task statistics and upcoming deadlines
5. **Manage Tasks**: Create, edit, delete, and assign tasks
6. **Admin Features**: Manage users (admin only)

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

### Task Management
- Create tasks with title, description, status, and priority
- Set due dates for deadline tracking
- Assign multiple users to collaborate on tasks
- Filter tasks by priority (Low, Medium, High)
- Update task status (Incomplete, In Progress, Completed)

### User Management (Admin Only)
- View all registered users
- Create new users with role assignment
- Update user information
- Delete users

### Dashboard
- Total tasks count
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

## 🐛 Known Issues

- None at the moment

## 📝 Future Enhancements

- Email notifications for due dates
- Task comments and attachments
- Task categories and tags
- Export tasks to CSV/PDF
- Real-time updates with WebSockets
- Mobile app version

---

**Happy Task Managing! 🎉**
