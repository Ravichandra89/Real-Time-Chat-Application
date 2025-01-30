import { WebSocket, WebSocketServer } from "ws";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "ws-server-1",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const connectKafkaProducer = async () => {
  await producer.connect();
  console.log("Connected to Kafka");
};

// Send the Kafka event for Register user
const sendRegisterEvent = async (userId: string, serverId: string) => {
  try {
    await producer.send({
      topic: "ws-manager-events",
      messages: [
        {
          value: JSON.stringify({
            action: "register",
            userId,
            serverId,
            timestamps: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(
      `Kafka message sent for user ${userId} register on ${serverId}`
    );
  } catch (error) {
    console.error("Failed to send Kafka message", error);
  }
};

// Send the Kafka event for Unregister user
const sendUnregisterEvent = async (userId: string) => {
  try {
    await producer.send({
      topic: "ws-manager-events",
      messages: [
        {
          value: JSON.stringify({
            action: "unregister",
            userId,
            timestamps: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`Kafka message sent for user ${userId} unregister`);
  } catch (error) {
    console.error("Failed to send Kafka message", error);
  }
};

// Setup the WebSocket Server
const clients = new Map<string, WebSocket>();

export const startWebSocketServer = () => {
  const wss = new WebSocketServer({ port: Number(process.env.PORT) });

  // Establish the connection
  wss.on("connection", (ws, req) => {
    const userId = new URL(req.url || "", "http://localhost").searchParams.get(
      "userId"
    );
    if (!userId) {
      ws.close();
      return;
    }

    const serverId = process.env.SERVER_ID;
    console.log(`User ${userId} connected to ${serverId}`);
    clients.set(userId, ws);

    // Send Kafka message for user registration to ws-manager
    sendRegisterEvent(userId as string, serverId as string);

    ws.on("message", (message) => {
      console.log(`Received message from ${userId}: ${message}`);
    });

    ws.on("close", () => {
      console.log(`User ${userId} disconnected`);
      clients.delete(userId);

      // Send Kafka message for user unregistration to ws-manager
      sendUnregisterEvent(userId as string);
    });
  });

  console.log(
    `${process.env.SERVER_ID} WebSocket server running on port ${process.env.PORT}`
  );
};

connectKafkaProducer();
