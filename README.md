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

5. **Start MongoDB**
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

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Workspaces

- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces` - Get user's workspaces
- `GET /api/workspaces/:id` - Get single workspace
- `PUT /api/workspaces/:id/visibility` - Toggle visibility
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/members` - Add member
- `DELETE /api/workspaces/:id/members/:userId` - Remove member
- `GET /api/workspaces/users/search` - Search users

### Lists

- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `PUT /api/workspaces/:id/reorder-lists` - Reorder lists

### Cards

- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `PUT /api/cards/reorder` - Reorder cards
- `PUT /api/cards/:id/move` - Move card

## Project Structure

```
mini-trello-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Workspace.js
│   │   ├── List.js
│   │   ├── Card.js
│   │   └── Activity.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── workspaces.js
│   │   ├── lists.js
│   │   └── cards.js
│   ├── .env
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── WorkspaceCard.jsx
│   │   │   ├── WorkspaceView.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── List.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── CreateList.jsx
│   │   │   ├── CreateCard.jsx
│   │   │   ├── EditCard.jsx
│   │   │   ├── InviteMembers.jsx
│   │   │   └── UserCursor.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── WorkspaceContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🛠️ Technologies Used

### Backend

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **Socket.io**
- **JWT**
- **bcryptjs**
- **CORS**

### Frontend

- **React**
- **React Router DOM**
- **Tailwind CSS**
- **@dnd-kit**
- **Socket.io Client**
- **Axios**
- **Context API**
- **Lucide React**

## Security Features

- **Password Hashing** with bcryptjs
- **JWT Token Authentication** with user data
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **Environment Variables** for sensitive data
- **Protected Routes** with authentication middleware
- **Role-based Access Control** for workspace management

## 🚀 Real-time Features

### Socket.io Events

- **User Presence** - `user-joined`, `user-left`
- **Card Operations** - `card-created`, `card-updated`, `card-deleted`, `card-moved`
- **List Operations** - `list-created`, `list-updated`, `list-deleted`
- **Cursor Sharing** - `cursor-move`
- **Card Reordering** - `cards-reordered`

### Collaboration Features

- **Live Cursor Tracking** - See other users' mouse movements
- **Online User Indicators** - Know who's currently active
- **Real-time Updates** - All changes sync instantly
- **Cross-user Synchronization** - Workspace state stays consistent

## 🎯 Key Features Implemented

### ✅ Completed Features

- [x] User authentication and registration
- [x] Workspace creation and management
- [x] Public/Private workspace visibility
- [x] Member management with roles
- [x] List and card CRUD operations
- [x] Drag and drop functionality
- [x] Real-time collaboration
- [x] Cursor sharing
- [x] Online user indicators
- [x] Responsive design
- [x] Socket.io integration
- [x] JWT authentication with user data
- [x] Database fallback for user names
- [x] Real-time workspace refresh

### 🔮 Future Enhancements

- [ ] File attachments for cards
- [ ] Email notifications
- [ ] Dark mode support
- [ ] Advanced search and filtering
- [ ] Workspace templates
- [ ] Time tracking
- [ ] Comments and mentions
- [ ] Workspace analytics
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Workspace archiving
- [ ] Advanced permissions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

1. **Port 5000 already in use**

   ```bash
   # Kill all Node.js processes
   taskkill /f /im node.exe
   # Then restart the server
   npm start
   ```

2. **MongoDB connection issues**

   - Ensure MongoDB is running
   - Check the MONGODB_URI in .env file
   - Verify MongoDB is accessible on localhost:27017

3. **Socket.io connection issues**

   - Check if backend server is running on port 5000
   - Verify CORS settings in backend
   - Check browser console for connection errors

4. **"Unknown User" on cursors**
   - Log out and log back in to get a new JWT token
   - The system will automatically fetch user names from the database

## Support

If you encounter any issues or have questions, please:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all dependencies are properly installed
4. Verify your environment variables are set correctly

---

**Happy Collaborating!**
