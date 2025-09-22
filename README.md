# Mini Kanban App

A simple and elegant Kanban board application with user authentication, built with React, Node.js, Express, MongoDB, Tailwind CSS, and Material UI.

## Features

- 🔐 User authentication (Signup/Login)
- 🎨 Clean and modern UI with Tailwind CSS and Material UI
- 🗄️ MongoDB database integration
- 🔒 JWT-based authentication
- 📱 Responsive design
- 🚀 Ready for deployment

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd mini-kanban-app
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
   MONGODB_URI=mongodb://localhost:27017/mini-kanban
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

5. **Start MongoDB**

   Make sure MongoDB is running on your system. If using MongoDB Compass, ensure it's connected to `mongodb://localhost:27017`.

## Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm start
   ```

   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

3. **Access the application**

   Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Register a new account**

   - Click on "Sign up here" on the login page
   - Fill in your name, email, and password
   - Click "Create Account"

2. **Login to your account**

   - Enter your email and password
   - Click "Sign In"

3. **Dashboard**
   - After successful login, you'll be redirected to the dashboard
   - View your user information
   - Logout when done

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

## Project Structure

```
mini-kanban-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
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
│   │   │   └── Dashboard.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

### Frontend

- React 19
- React Router DOM
- Material UI
- Tailwind CSS
- Axios for API calls
- Context API for state management

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Input validation and sanitization
- CORS configuration
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Kanban board implementation
- [ ] Task management features
- [ ] Real-time collaboration
- [ ] File attachments
- [ ] User profiles
- [ ] Email notifications
- [ ] Dark mode support

