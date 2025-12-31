# ⚡ TaskFlow - AI-Powered Task Management

A modern, full-stack task management application built with React, TypeScript, Node.js, Express, and MySQL. Features AI-powered user recommendations, real-time updates, intelligent task completion tracking, and a clean white & blue interface inspired by Jira and Trello.

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **WUSS Algorithm** - Weighted User Suitability Scoring for smart task assignment
- **Smart User Recommendations** - AI analyzes performance, workload, and skills
- **Task Recommendations** - AI suggests priority, time estimates, and due dates
- **Performance Analytics** - Track efficiency and completion rates
- **Automatic Time Calculation** - No manual time entry needed

### ⚡ Real-Time Collaboration
- **Live Updates** - Instant task synchronization with Socket.IO
- **Connection Status** - Simple green/red dot indicators
- **Real-Time Dashboard** - Live statistics and notifications
- **Multi-User Assignment** - Assign multiple users with smart recommendations

### 📊 Advanced Task Management
- **Intelligent Assignment** - Color-coded recommendation percentages
- **Automatic Time Tracking** - Calculates hours from creation to completion
- **Task Completion Records** - Detailed completion history and efficiency metrics
- **Priority-Based Recommendations** - Dynamic due date suggestions
- **Performance Insights** - Individual and team analytics

### 🎨 Modern Interface
- **Clean Design** - White & blue theme like Jira/Trello
- **Smart UI** - Minimal, focused design without clutter
- **Responsive Layout** - Works on all devices
- **Intuitive Navigation** - Easy-to-use interface

## 🧠 WUSS Algorithm (Weighted User Suitability Scoring)

TaskFlow's AI-powered recommendation system analyzes multiple factors to suggest the best users for each task:

### Scoring Factors
- **Performance Score (30%)** - Historical efficiency and completion rates
- **Workload Score (25%)** - Current active tasks and availability
- **Availability Score (20%)** - Schedule conflicts around due dates
- **Skill Match Score (15%)** - Content similarity with previous tasks
- **Priority Handling Score (10%)** - Success rate with similar priority tasks

### Recommendation Levels
- **🔴 High (≥80%)** - Highly recommended users
- **🟢 Medium (60-79%)** - Recommended users  
- **🟡 Low (<60%)** - Suitable but not optimal

### Smart Features
- **Dynamic Recommendations** - Updates as you type task details
- **Color-Coded Interface** - Visual indicators for recommendation strength
- **Performance Learning** - Algorithm improves with completion data
- **Workload Balancing** - Prevents user overload

## ⏱️ Intelligent Time Tracking

### Automatic Calculations
- **No Manual Entry** - Time calculated from creation to completion
- **Efficiency Metrics** - Tracks actual vs estimated performance
- **Task Complexity** - AI estimates based on content analysis
- **Performance Trends** - Historical efficiency tracking

### Completion Analytics
- **Individual Performance** - User-specific efficiency ratings
- **Task Completion Records** - Detailed history with timestamps
- **Efficiency Scoring** - Performance metrics for recommendations
- **Trend Analysis** - Performance improvement over time

## 🎯 AI Task Recommendations

TaskFlow provides intelligent suggestions for optimal task creation:

### Smart Recommendations
- **Priority Analysis** - Keyword-based priority suggestions
- **Time Estimation** - Historical data and content analysis
- **Due Date Optimization** - Priority-based deadline recommendations
- **User Assignment** - Workload and performance analysis

### Dynamic Confidence Scoring
- **High Confidence (≥70%)** - Shows confidence badge with percentage
- **Adaptive Learning** - Improves recommendations with usage
- **Context Awareness** - Analyzes task content for better suggestions

## 🛠️ Tech Stack
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

### Getting Started
1. **Access TaskFlow**: Open http://localhost:5173
2. **Sign up**: Create a new account (defaults to 'user' role)
3. **Create Admin User**: See `backend/CREATE_ADMIN.md` for instructions
4. **Login**: Use your credentials to access the dashboard

### AI-Powered Task Creation (Admin)
1. **Smart Assignment**: Start typing task details to see AI recommendations
2. **User Recommendations**: View color-coded suitability scores for each user
3. **Automatic Suggestions**: Get AI recommendations for priority, time, and due dates
4. **Apply Recommendations**: One-click to apply AI suggestions

### Task Management Features
- **Admin**: Create, edit, delete, and assign tasks with AI assistance
- **User**: View assigned tasks and complete them with automatic time tracking
- **Real-Time Updates**: All changes sync instantly across users
- **Performance Tracking**: View efficiency metrics and completion analytics

### Connection Status
- **Green Dot**: Real-time features active
- **Red Dot**: Offline mode (changes will sync when reconnected)

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
- **Primary**: Blue (#0052cc, #003d99, #4c9aff)
- **Background**: Clean whites (#ffffff, #f4f5f7, #ebecf0)
- **Text**: Professional grays (#172b4d, #5e6c84, #8993a4)
- **Success**: Green (#00875a)
- **Danger**: Red (#de350b)
- **Warning**: Orange (#ff8b00)
- **Info**: Blue (#0065ff)

### Design Philosophy
- **Clean & Minimal** - Inspired by Jira and Trello
- **White & Blue Theme** - Professional and modern
- **Focused Interface** - No unnecessary clutter
- **Intuitive Navigation** - Easy-to-understand layout

### Typography
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Headings**: Bold, clear hierarchy
- **Body**: Clean, readable line height (1.6)
- **UI Elements**: Medium weight for emphasis

### Visual Elements
- **Status Dots** - Simple green/red connection indicators
- **Color-Coded Recommendations** - Red (high), green (medium), yellow (low)
- **Minimal Badges** - Clean, unobtrusive status indicators
- **Smooth Transitions** - Subtle animations for better UX

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for efficient task management and real-time collaboration

## 📚 Additional Documentation

- **`WUSS_IMPLEMENTATION.md`** - Complete WUSS algorithm documentation
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

### v3.0.0 - AI-Powered Edition
- 🤖 **WUSS Algorithm** - AI-powered user recommendations with 5-factor scoring
- ⏱️ **Automatic Time Tracking** - No manual time entry, calculates from creation to completion
- 📊 **Performance Analytics** - Individual efficiency metrics and completion tracking
- 🎯 **Smart Recommendations** - AI suggests priority, time estimates, and due dates
- 🎨 **Clean White & Blue Theme** - Inspired by Jira and Trello
- 🔴🟢 **Simple Status Dots** - Green for online, red for offline
- 📈 **Dynamic Confidence Badges** - Only shows meaningful AI confidence scores
- 🧠 **Learning Algorithm** - Improves recommendations with usage data

### v2.0.0 - Real-Time Edition
- ✅ **Socket.IO Integration** - Real-time task updates
- ✅ **New Branding** - TaskFlow with modern interface
- ✅ **Smart Text Truncation** - Modal popups for long descriptions
- ✅ **Connection Status** - Live connection indicators
- ✅ **Enhanced Dashboard** - Real-time statistics
- ✅ **Smart Text Truncation** - Modal popups for long descriptions
- ✅ **Connection Status** - Live/Offline indicators
- ✅ **Enhanced Dashboard** - Real-time statistics
- ✅ **Improved UX** - Better navigation and visual feedback

### Future Enhancements
- **Advanced AI Features**
  - Machine learning model training on completion data
  - Predictive task difficulty scoring
  - Smart task prioritization based on deadlines and dependencies
  - Natural language task creation
- **Enhanced Collaboration**
  - Task comments and activity log
  - File attachments to tasks
  - @mentions and notifications
  - Team-based workspaces
- **Productivity Features**
  - Task templates and recurring tasks
  - Bulk task operations
  - Advanced filtering and search
  - Custom task fields
- **Analytics & Reporting**
  - Team performance dashboards
  - Burndown charts and velocity tracking
  - Export reports to CSV/PDF
  - Time tracking insights
- **Platform Expansion**
  - Mobile app version
  - Desktop application
  - Browser extensions
  - API integrations (Slack, GitHub, etc.)
- **Advanced Features**
  - Offline mode with sync
  - Push notifications
  - Task dependencies and Gantt charts
  - Custom workflows and automation

---

**Experience AI-powered task management with TaskFlow! 🤖⚡**

*Intelligent recommendations • Real-time collaboration • Performance analytics*