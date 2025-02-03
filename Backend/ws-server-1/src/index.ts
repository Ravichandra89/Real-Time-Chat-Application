import { WebSocket, WebSocketServer } from "ws";
import { Kafka } from "kafkajs";

// Setup Kafka producer
const kafka = new Kafka({
  clientId: "ws-server-1",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const connectKafkaProducer = async () => {
  await producer.connect();
  console.log("Connected to Kafka Producer");
};

// Function to send chat message event to Kafka
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
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`Kafka: Sent chat message from ${senderId} to ${receiverId}`);
  } catch (error) {
    console.error("Kafka: Failed to send chat message", error);
  }
};

// Map to store connected clients (userId => WebSocket)
const clients = new Map<string, WebSocket>();

// Start the WebSocket server
export const startWebSocketServer = () => {
  const port = Number(process.env.PORT) || 8080;
  const wss = new WebSocketServer({ port });
  console.log(`WebSocket server running on port ${port}`);

  wss.on("connection", (ws, req) => {
    // Extract userId from the query parameter (e.g., ws://localhost:8080/?userId=123)
    const url = new URL(req.url || "", "http://localhost");
    const userId = url.searchParams.get("userId");
    if (!userId) {
      ws.close();
      return;
    }

    console.log(`User ${userId} connected`);
    clients.set(userId, ws);

    // Accept the message from the client using webSocket
    ws.on("message", async (messageData) => {
      try {
        // Expecting messageData to be JSON with properties: { receiverId, message }
        const parsed = JSON.parse(messageData.toString());
        const { receiverId, message } = parsed;
        if (!receiverId || !message) {
          console.error("Invalid message data received:", parsed);
          return;
        }
        console.log(
          `Received message from ${userId} for ${receiverId}: ${message}`
        );

        // Send the message to kafka for ChatService
        await sendChatMessageToKafka(userId, receiverId, message);
      } catch (error) {
        console.error("Error processing WebSocket message", error);
      }
    });


    ws.on("close", () => {
      console.log(`User ${userId} disconnected`);
      clients.delete(userId);
      // Optionally, send an unregister event to ws-manager here.
    });
  });
};

// Initialize and start the WebSocket server along with Kafka producer
const init = async () => {
  await connectKafkaProducer();
  startWebSocketServer();
};

init();
