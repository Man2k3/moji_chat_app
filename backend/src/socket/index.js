import express from "express";
import { Server } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
const onlineUsers = new Map(); // {userId: socketId}

io.use(socketAuthMiddleware);

io.on("connection", async (socket) => {
  const user = socket.user;

  console.log(`${user.displayName} connected with socket ID: ${socket.id}`);

  onlineUsers.set(user._id, socket.id);
  io.emit("online-users", Array.from(onlineUsers.keys()));
  const conversationIds = await getUserConversationsForSocketIO(user._id);
  conversationIds.forEach((conversationId) => {
    socket.join(conversationId);
  });
  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });
  socket.join(user._id.toString());
  socket.on("disconnect", () => {
    onlineUsers.delete(user._id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log(`Socket disconnected: ${socket.id}`);
  });
});
export { app, server, io };
