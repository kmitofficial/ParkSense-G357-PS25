import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import axios from "axios";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import vehicleRoutes from './routes/vehicles.js';
import directionsRoute from './routes/directions.js';
import qrGenerate from "./routes/qrGenerate.js";
import feedback from "./routes/feedback.js";
import uploadRoutes from "./routes/upload.js";
import numberPlatesRouter from "./routes/numberplates.js";

dotenv.config();
const APP_LINK = process.env.NEXT_PUBLIC_APP_LINK;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: APP_LINK || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 5001;

const userSockets = new Map();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors());
connectDB();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Register user with their phone
  socket.on("register", (phone) => {
    userSockets.set(phone, socket.id);
    console.log(`User with phone ${phone} registered with socket ${socket.id}`);
    console.log("Current connected users:", Array.from(userSockets.keys()));
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const [phone, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(phone);
        console.log(`User with phone ${phone} disconnected`);
        console.log("Current connected users:", Array.from(userSockets.keys()));
        break;
      }
    }
  });
});

app.post("/api/sos", (req, res) => {
  const { userId, message } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User phone is required" });
  }

  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit("sos_alert", {
      message: message || "Urgent: Please check your vehicle or contact support immediately!",
      timestamp: new Date().toISOString(),
    });
    res.status(200).json({ message: "SOS alert sent" });
  } else {
    res.status(404).json({ error: "User not connected" });
  }
});

app.get("/api/connected-users", (req, res) => {
  res.json({ connectedUsers: Array.from(userSockets.keys()) });
});

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/directions', directionsRoute);
app.use('/api/qr', qrGenerate);
app.use('/api/feedback', feedback);
app.use('/api/upload', uploadRoutes);
app.use('/api/numberplates', numberPlatesRouter);

server.listen(PORT, '0.0.0.0', () => {
  console.log("Parksense backend running on port", PORT);
});