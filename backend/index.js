require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/workspaces", require("./routes/workspaces"));
app.use("/api/cards", require("./routes/cards"));
app.use("/api/lists", require("./routes/lists"));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Mini Kanban API is running! 🚀" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
