import { Server } from "socket.io";
import redisClient from "../config/redis";
import {
  setUserPresenceOnline,
  setUserPresenceOffline,
} from "../controller/presence.controller";
import http from "http";

const webSocketSetUp = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Connection event
  io.on("connection", async (socket) => {
    console.log(`User connected with WebSocket : ${socket.id}`);

    const { userId } = socket.handshake.query;
    if (!userId) {
      console.error("Missing userId in WebSocket handshake");
      return;
    }

    // If UserId Exist than update the status
    try {
      await setUserPresenceOnline(userId as string);
      console.log(`{WebSocket} user presence marked Online for ${userId}`);

      // Emit the event
      io.emit("presence-updated", { userId, status: "online" });

      //   DisConnection logic
      socket.on("disconnect", async () => {
        console.log(`{WebSocket} User disConnected ${userId}`);

        // Mark the status as offline
        await setUserPresenceOffline(userId as string);
        console.log(`{WebSocket} user presence marked Offline for ${userId}`);

        // Emit the event
        io.emit("presence-updated", { userId, status: "offline" });
      });
    } catch (error) {
      console.error(`Error Handling for User Presence: ${userId}`);
    }
  });

  return io;
};

export default webSocketSetUp;
