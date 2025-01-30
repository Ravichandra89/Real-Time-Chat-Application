import { WebSocket, WebSocketServer } from "ws";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "ws-server-2",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const connectKafkaProducer = async () => {
  await producer.connect();
  console.log("Connected to Kafka for ws-server-2");
};

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

const sendChatMessageToKafka = async (
  senderId: string,
  receiverId: string,
  message: string
) => {
  try {
    await producer.send({
      topic: "chat-messages",
      messages: [
        {
          value: JSON.stringify({
            action: "send-message",
            senderId,
            receiverId,
            message,
            timestamps: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`Kafka message sent for chat: ${senderId} → ${receiverId}`);
  } catch (error) {
    console.error("Failed to send Kafka message for chat message");
  }
};

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

    sendRegisterEvent(userId as string, serverId as string);

    // ws.on("message", (message) => {
    //   console.log(`Received message from ${userId}: ${message}`);
    // });

    ws.on("message", async (messageData) => {
      try {
        const { receiverId, message } = JSON.parse(messageData.toString());

        if (!receiverId || !message) {
          console.error("Invalid message format received");
          return;
        }

        console.log(
          `Received message from ${userId} to ${receiverId}: ${message}`
        );

        // Forward message to Kafka for ChatService
        await sendChatMessageToKafka(userId, receiverId, message);
      } catch (error) {
        console.error("Error processing WebSocket message", error);
      }
    });

    ws.on("close", () => {
      console.log(`User ${userId} disconnected`);
      clients.delete(userId);

      sendUnregisterEvent(userId as string);
    });
  });

  console.log(
    `${process.env.SERVER_ID} WebSocket server running on port ${process.env.PORT}`
  );
};

connectKafkaProducer();

// Start WebSocketServer
startWebSocketServer();
