import WebSocket, { WebSocketServer } from "ws";
import prisma from "../config/prisma.config";
import redisClient from "../config/redis";
import {
  setUserPresenceOnline,
  setUserPresenceOffline,
} from "../controller/presence.controller";
import http from "http";

const userSocket = new Map<string, WebSocket>(); 

const webSocketSetUp = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (socket, req) => {
    console.log(`User connected with WebSocket`);

    const urlParams = new URLSearchParams(req.url?.split("?")[1]);
    const userId = urlParams.get("userId");

    if (!userId) {
      console.error("Missing userId in WebSocket handshake");
      socket.close(4001, "Missing userId");
      return;
    }

    userSocket.set(userId, socket);

    try {
      await setUserPresenceOnline(userId);
      console.log(`{WebSocket} user presence marked Online for ${userId}`);

      broadcast(wss, JSON.stringify({ userId, status: "online" }));

      socket.on("message", (message) => {
        console.log(`Received message from ${userId}: ${message}`);
      });

      // Handle WebSocket disconnection
      socket.on("close", async () => {
        console.log(`{WebSocket} User disconnected: ${userId}`);

        // Remove from active sockets
        userSocket.delete(userId);

        // Mark the user as offline
        await setUserPresenceOffline(userId);
        console.log(`{WebSocket} user presence marked Offline for ${userId}`);

        // Notify all clients about the presence update
        broadcast(wss, JSON.stringify({ userId, status: "offline" }));
      });
    } catch (error) {
      console.error(`Error handling user presence for ${userId}:`, error);
      socket.close(1011, "Internal server error");
    }
  });

  return wss;
};

export const notifyGroupMembers = async (groupId: string, message: Object) => {
  try {

    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
      },
      select: { userId: true },
    });


    groupMembers.forEach(({ userId }) => {
      const socket = userSocket.get(userId);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    });
    
  } catch (error) {
    console.error("Error notifying group members", error);
  }
};

const broadcast = (wss: WebSocketServer, message: string) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

export default webSocketSetUp;
