import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "chat-service-consumer",
  brokers: ["process.env.KAFKA_BROKERS"],
});

const consumer = kafka.consumer({ groupId: "chat-service-group" });

const pendingReqeuests: Map<string, (serverId: string | null) => void> =
  new Map();

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "get-user-server-response",
    fromBeginning: false,
  });

  consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data = JSON.parse(message.value?.toString() || "{}");
        const { requestId, serverId } = data;

        console.log(`📩 Received WebSocket server response: ${serverId}`);

        // Resolving pending requests
        if (pendingReqeuests.has(requestId)) {
          pendingReqeuests.get(requestId)?.(serverId);
          pendingReqeuests.delete(requestId);
        }
      } catch (error) {
        console.error("Error processing kafka message", error);
      }
    },
  });

  console.log("✅ Kafka consumer started in chat-service");
};

export const addPendingRequest = (
  requestId: string,
  resolve: (serverId: string | null) => void
) => {
  pendingReqeuests.set(requestId, resolve);
};
