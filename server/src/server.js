const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notifications");
const requestRoutes = require("./routes/requests");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Socket.IO connection handling
const connectedUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Authenticate user and store connection
  socket.on("authenticate", async (data) => {
    try {
      console.log("Authentication attempt:", { socketId: socket.id, data });
      const { token } = data;
      if (!token) {
        console.log("No token provided for socket:", socket.id);
        socket.emit("error", { message: "Authentication token required" });
        return;
      }

      // Verify token (you might want to use your JWT verification here)
      // For now, we'll assume the token is valid and contains userId
      const userId = data.userId; // Frontend should send userId with token

      if (userId) {
        connectedUsers.set(userId, socket.id);
        userSockets.set(socket.id, userId);

        // Join user to their personal room
        socket.join(`user:${userId}`);

        console.log(`User ${userId} authenticated on socket ${socket.id}`);
        console.log("Connected users:", Array.from(connectedUsers.entries()));
        socket.emit("authenticated", { userId });
      } else {
        console.log("No userId provided for socket:", socket.id);
      }
    } catch (error) {
      console.error("Socket authentication error:", error);
      socket.emit("error", { message: "Authentication failed" });
    }
  });

  // Join chat room
  socket.on("join-chat", (chatId) => {
    console.log(`Socket ${socket.id} joining chat ${chatId}`);
    socket.join(`chat:${chatId}`);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on("leave-chat", (chatId) => {
    console.log(`Socket ${socket.id} leaving chat ${chatId}`);
    socket.leave(`chat:${chatId}`);
    console.log(`Socket ${socket.id} left chat ${chatId}`);
  });

  // Handle typing indicators
  socket.on("typing-start", (data) => {
    console.log("Typing start event:", data);
    const { chatId, userId, userName } = data;
    socket.to(`chat:${chatId}`).emit("user-typing", {
      chatId,
      userId,
      userName,
      type: "start",
    });
    console.log(`Emitted typing-start to chat ${chatId}`);
  });

  socket.on("typing-stop", (data) => {
    console.log("Typing stop event:", data);
    const { chatId, userId } = data;
    socket.to(`chat:${chatId}`).emit("user-typing", {
      chatId,
      userId,
      type: "stop",
    });
    console.log(`Emitted typing-stop to chat ${chatId}`);
  });

  // Handle message reactions
  socket.on("message-reaction", (data) => {
    console.log("Message reaction event:", data);
    const { chatId, messageId, userId, emoji, type } = data;
    socket.to(`chat:${chatId}`).emit("message-reaction-update", {
      chatId,
      messageId,
      userId,
      emoji,
      type, // 'add' or 'remove'
    });
    console.log(`Emitted message-reaction-update to chat ${chatId}`);
  });

  // Handle new messages
  socket.on("new-message", (data) => {
    console.log("New message event:", data);
    const { chatId, message } = data;
    socket.to(`chat:${chatId}`).emit("message-received", {
      chatId,
      message,
    });
    console.log(`Emitted message-received to chat ${chatId}`);
  });

  // Handle message deletion
  socket.on("message-deleted", (data) => {
    console.log("Message deleted event:", data);
    const { chatId, messageId } = data;
    socket.to(`chat:${chatId}`).emit("message-deleted", {
      chatId,
      messageId,
    });
    console.log(`Emitted message-deleted to chat ${chatId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      connectedUsers.delete(userId);
      userSockets.delete(socket.id);
      console.log(`User ${userId} disconnected from socket ${socket.id}`);
    }
  });
});

// Make io available globally for other modules
global.io = io;

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/requests", requestRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log("Socket.IO server initialized");
});
