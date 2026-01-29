# Project Marketplace Workflow

A comprehensive role-based project marketplace system where **Buyers** create projects and **Problem Solvers** execute them through a structured workflow with task management, file submissions, and review capabilities.

![Project Status](https://img.shields.io/badge/status-complete-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 System Overview

This application demonstrates a full-stack role-based access control system with smooth UI transitions and a complete project lifecycle management workflow.

### Role Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                      Admin                          │
│  • Assign Buyer role to users                     │
│  • View all users and projects                    │
│  • No project execution responsibilities          │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌──────────────────┐           ┌──────────────────────┐
│      Buyer       │           │  Problem Solver      │
│  • Create        │           │  • Create profile    │
│    projects      │           │  • Browse projects   │
│  • Review        │           │  • Request to work   │
│    requests      │           │  • Create tasks      │
│  • Assign        │           │  • Submit work       │
│    solver        │           │                      │
│  • Accept/Reject │           │                      │
│    submissions   │           │                      │
└──────────────────┘           └──────────────────────┘
```

### Project Lifecycle

```
🔓 Open → 🔨 Assigned → ✅ Completed
  │          │              │
  ├─ Buyers create projects
  ├─ Solvers request to work
  ├─ Buyer assigns solver
  ├─ Solver creates tasks
  ├─ Solver submits work
  └─ Buyer reviews & accepts
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer (ZIP files only)
- **Validation**: Express Validator

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your database credentials:
   ```env
   DB_USER=your_postgres_user
   DB_HOST=localhost
   DB_NAME=project_marketplace
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your_super_secret_key
   ```

4. **Create PostgreSQL database**
   ```bash
   psql -U postgres
   CREATE DATABASE project_marketplace;
   \q
   ```

5. **Run database schema**
   ```bash
   psql -U postgres -d project_marketplace -f db/schema.sql
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   Server runs on: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Default configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Application runs on: `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Admin Only)
- `GET /api/users` - List all users
- `PATCH /api/users/:id/role` - Assign role to user
- `GET /api/users/me` - Get current user

### Projects
- `POST /api/projects` - Create project (Buyer)
- `GET /api/projects` - List projects (filtered by role)
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Project Requests
- `POST /api/requests` - Request to work (Solver)
- `GET /api/requests/project/:projectId` - Get requests for project (Buyer)
- `PATCH /api/requests/:id/accept` - Accept request (Buyer)
- `PATCH /api/requests/:id/reject` - Reject request (Buyer)
- `GET /api/requests/my-requests` - Get my requests (Solver)

### Tasks
- `POST /api/tasks` - Create task (Solver)
- `GET /api/tasks/project/:projectId` - List tasks
- `PATCH /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Submissions
- `POST /api/submissions` - Upload submission with ZIP file (Solver)
- `GET /api/submissions/task/:taskId` - Get submissions for task
- `PATCH /api/submissions/:id/accept` - Accept submission (Buyer)
- `PATCH /api/submissions/:id/reject` - Reject submission (Buyer)

## 🎨 Key Features

### State Transitions with Animations
- Smooth transitions between project states (Open → Assigned → Completed)
- Animated task status changes
- Progress indicators for file uploads
- Micro-interactions on hover and click events

### Role-Based Access Control
- Automatic route protection
- Role-specific UI rendering
- Permission-based API endpoints
- Visual role distinction with color theming

### File Upload System
- ZIP file only validation
- Upload progress tracking
- Secure file storage
- File size limits (50MB default)

### Clean Data Flow
- Clear request/response contracts
- Consistent error handling
- Loading states for async operations
- Empty state handling

## 🔑 Key Architectural Decisions

1. **JWT Authentication**: Stateless authentication suitable for REST APIs
2. **PostgreSQL**: Relational model perfect for structured workflow data
3. **Separate Backend/Frontend**: Clear separation of concerns, easier to scale
4. **Local File Storage**: Simple for development (can upgrade to S3/cloud storage)
5. **Framer Motion**: Declarative animations with great performance
6. **Role-Based Theming**: Visual feedback for user roles enhances UX
7. **Transaction Safety**: Used PostgreSQL transactions for critical operations (request acceptance)

## 📝 Usage Flow

### 1. Initial Setup
```
1. Register users (they start as Problem Solvers)
2. Manually set first user as Admin in database:
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
3. Admin logs in and assigns Buyer role to users
```

### 2. Project Creation (Buyer)
```
1. Buyer logs in → Dashboard
2. Click "Create Project"
3. Enter title and description
4. Project created with "open" status
```

### 3. Request Flow (Problem Solver)
```
1. Solver logs in → Browse available projects
2. Click "Request to Work"
3. Optional: Add message
4. Request submitted to Buyer
```

### 4. Assignment (Buyer)
```
1. Buyer views project requests
2. Review solver profiles
3. Click "Accept" on chosen solver
4. Project status → "assigned"
5. Other requests auto-rejected
```

### 5. Task Management (Problem Solver)
```
1. Solver views assigned project
2. Click "Add Task"
3. Enter title, description, deadline
4. Change status: pending → in_progress
5. Upload ZIP submission
6. Status changes to "submitted"
```

### 6. Review (Buyer)
```
1. Buyer views project tasks
2. Review submissions
3. Accept → task marked "completed"
4. Reject → provide feedback, task marked "rejected"
```
