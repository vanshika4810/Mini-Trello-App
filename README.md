# Mini Trello App

A full-featured Kanban board application with real-time collaboration, built with React, Node.js, Express, MongoDB, Socket.io, and Tailwind CSS.

## Features

### Authentication & User Management

- **User Registration & Login** with JWT authentication
- **Secure Password Hashing** with bcryptjs
- **Protected Routes** with authentication middleware
- **User Profile Management**

### Workspace Management

- **Create & Manage Workspaces**
- **Public & Private Workspaces** with visibility controls
- **Workspace Ownership** and member management
- **Direct Member Addition**
- **Workspace Dashboard** with member count and owner info

### List & Card Management

- **Create, Edit, Delete Lists** with real-time updates
- **Create, Edit, Delete Cards** with rich content
- **Drag & Drop** for cards and lists
- **Card Assignment** to team members
- **Due Dates** with visual indicators
- **Labels & Tags** for card organization
- **Card Descriptions** and detailed information

### Real-time Collaboration

- **Live Updates** - All changes sync instantly across users
- **Real-time Cursor Sharing** - See other users' mouse movements
- **Online User Indicators** - Know who's currently active
- **Socket.io Integration** - WebSocket-based real-time communication
- **Cross-user Synchronization** - All CRUD operations broadcast to all users

### Modern UI/UX

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Tailwind CSS** - Modern, utility first styling
- **Drag & Drop Interface** - Intuitive card and list management
- **Real-time Visual Feedback** - See changes as they happen
- **Clean, Intuitive Interface** - Easy to use for teams

## Quick Start

### Prerequisites

- **Node.js**
- **MongoDB Compass**
- **MongoDB Database Tools** (mongorestore)
- **npm**

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd mini-trello-app
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `backend` directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mini-trello
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

5. **Restore the database dump**

   The project includes a sample database dump in the `db` folder. To restore it:

   ```bash
   # Navigate to the project root
   cd mini-trello-app

   # Restore the database dump
   mongorestore --db mini-trello db/mini-trello
   ```

   This will create a `mini-trello` database with sample data including:

   - Sample users
     1. email: john@abc.com
        password: testing
     2. email: divya@gmail.com
        password: testing
     3. rohit@xyz.com
        password: testing
     4. email: marie@hotmail.com
        password: testing
   - Sample workspaces
   - Sample lists and cards
   - Sample activities and comments

6. **Start MongoDB**
   Make sure MongoDB is running on your system.

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm start
   ```

   Backend runs on `http://localhost:5000`

2. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

   Frontend runs on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Getting Started

1. **Register a new account**

   - Click "Sign up here" on the login page
   - Fill in your name, email, and password
   - Click "Create Account"

2. **Login to your account**

   - Enter your email and password
   - Click "Sign In"

3. **Create your first workspace**
   - Click "Create Workspace" on the dashboard
   - Choose visibility (Public/Private)
   - Add a due date if needed

### Workspace Management

1. **Add Members to Private Workspaces**

   - Open a private workspace
   - Click "Add Members" in the navbar
   - Search for users by email
   - Assign roles (Admin/Member)

2. **Manage Workspace Settings**
   - Toggle visibility between Public/Private
   - Delete workspaces (owner only)
   - View member list and roles

### Real-time Collaboration

1. **Share Workspaces**

   - Invite team members to private workspaces
   - Public workspaces are visible to all users
   - See online users in the navbar

2. **Collaborate in Real-time**
   - All changes sync instantly across users
   - See other users' cursors when they're active
   - Online user indicators show who's connected

### Card & List Management

1. **Create Lists**

   - Click "Add List" in the workspace
   - Give your list a descriptive title
   - Lists appear instantly for all users

2. **Create Cards**

   - Click "Add Card" in any list
   - Add title, description, assignee, due date
   - Use labels for organization

3. **Drag & Drop**
   - Drag cards between lists
   - Reorder cards within lists
   - Drag lists to reorder them
   - All movements sync in real-time

**Happy Collaborating!**
