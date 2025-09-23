require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const connectDB = require("./config/database");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("Socket auth attempt - token present:", !!token);

  if (!token) {
    console.log("Socket authentication failed: No token provided");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT decoded successfully:", {
      id: decoded.id,
      name: decoded.name,
    });

    socket.userId = decoded.id;

    // If name is not in JWT (old token), fetch from database
    if (decoded.name) {
      socket.userName = decoded.name;
    } else {
      console.log("Name not in JWT, fetching from database...");
      const user = await User.findById(decoded.id).select("name");
      socket.userName = user?.name || "Unknown User";
    }

    console.log(
      `Socket authenticated for user: ${socket.userName} (${socket.userId})`
    );
    next();
  } catch (err) {
    console.log("Socket authentication failed: Invalid token", err.message);
    console.log("Token that failed:", token);
    next(new Error("Authentication error"));
  }
});

// Socket.io connection handling
io.on("connection", async (socket) => {
  console.log(`User ${socket.userName} connected: ${socket.id}`);

  // Join workspace room
  socket.on("join-workspace", (workspaceId) => {
    socket.join(`workspace-${workspaceId}`);
    console.log(`User ${socket.userName} joined workspace ${workspaceId}`);

    // Notify others in the workspace
    socket.to(`workspace-${workspaceId}`).emit("user-joined", {
      userId: socket.userId,
      userName: socket.userName,
      socketId: socket.id,
    });
  });

  // Leave workspace room
  socket.on("leave-workspace", (workspaceId) => {
    socket.leave(`workspace-${workspaceId}`);
    console.log(`User ${socket.userName} left workspace ${workspaceId}`);

    // Notify others in the workspace
    socket.to(`workspace-${workspaceId}`).emit("user-left", {
      userId: socket.userId,
      userName: socket.userName,
      socketId: socket.id,
    });
  });

  // Handle cursor movement
  socket.on("cursor-move", (data) => {
    const cursorData = {
      userId: socket.userId,
      userName: socket.userName,
      x: data.x,
      y: data.y,
      workspaceId: data.workspaceId,
    };
    console.log("Emitting cursor-move:", cursorData);
    socket.to(`workspace-${data.workspaceId}`).emit("cursor-move", cursorData);
  });

  // Handle socket errors
  socket.on("error", (error) => {
    console.error(`Socket error for user ${socket.userName}:`, error);
  });

  // Handle card movements
  socket.on("card-moved", (data) => {
    socket.to(`workspace-${data.workspaceId}`).emit("card-moved", {
      ...data,
      userId: socket.userId,
      userName: socket.userName,
    });
  });

  // Handle card updates
  socket.on("card-updated", (data) => {
    socket.to(`workspace-${data.workspaceId}`).emit("card-updated", {
      ...data,
      userId: socket.userId,
      userName: socket.userName,
    });
  });

  // Handle list updates
  socket.on("list-updated", (data) => {
    socket.to(`workspace-${data.workspaceId}`).emit("list-updated", {
      ...data,
      userId: socket.userId,
      userName: socket.userName,
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(
      `User ${socket.userName} disconnected: ${socket.id}, reason: ${reason}`
    );
  });
});

// Make io available to routes
app.set("io", io);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/workspaces", require("./routes/workspaces"));
app.use("/api/cards", require("./routes/cards"));
app.use("/api/lists", require("./routes/lists"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/search", require("./routes/search"));
app.use("/api/activities", require("./routes/activities"));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Mini Kanban API is running! 🚀" });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Socket.io server ready for real-time connections`);
});
