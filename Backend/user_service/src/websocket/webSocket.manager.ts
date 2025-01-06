import WebSocket, { WebSocketServer } from "ws";
import redisClient from "../config/redis";
import {
  setUserPresenceOnline,
  setUserPresenceOffline,
} from "../controller/presence.controller";
import http from "http";

const webSocketSetUp = (server: http.Server) => {
  // Create a WebSocket server
  const wss = new WebSocketServer({ server });

  // Handle WebSocket connection
  wss.on("connection", async (socket, req) => {
    console.log(`User connected with WebSocket`);

    // Extract userId from query params
    const urlParams = new URLSearchParams(req.url?.split("?")[1]);
    const userId = urlParams.get("userId");

    if (!userId) {
      console.error("Missing userId in WebSocket handshake");
      socket.close(4001, "Missing userId"); // Close connection with an error code
      return;
    }

    // Mark the user as online
    try {
      await setUserPresenceOnline(userId);
      console.log(`{WebSocket} user presence marked Online for ${userId}`);

      // Notify all clients about the presence update
      broadcast(wss, JSON.stringify({ userId, status: "online" }));

      // Handle incoming messages (optional, can add custom logic here)
      socket.on("message", (message) => {
        console.log(`Received message from ${userId}: ${message}`);
      });

      // Handle WebSocket disconnection
      socket.on("close", async () => {
        console.log(`{WebSocket} User disconnected: ${userId}`);

        // Mark the user as offline
        await setUserPresenceOffline(userId);
        console.log(`{WebSocket} user presence marked Offline for ${userId}`);

        // Notify all clients about the presence update
        broadcast(wss, JSON.stringify({ userId, status: "offline" }));
      });
    } catch (error) {
      console.error(`Error handling user presence for ${userId}:`, error);
      socket.close(1011, "Internal server error"); // Close connection with an error code
    }
  });

  return wss;
};

/**
 * Broadcasts a message to all connected clients.
 */
const broadcast = (wss: WebSocketServer, message: string) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

export default webSocketSetUp;
