import { Kafka } from "kafkajs";
import redisClient from "../utils/redis.client";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const kafka = new Kafka({
  clientId: "ws-manager",
  brokers: [process.env.KAFKA_BROKERS!], // Ensure env variable is loaded properly
});

const consumer = kafka.consumer({ groupId: "ws-manager-group" });
const producer = kafka.producer();

const startKafkaConsumer = async () => {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: "ws-manager-events", fromBeginning: false });
  await consumer.subscribe({ topic: "get-user-server-request", fromBeginning: false });

  consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const data = JSON.parse(message.value?.toString() || "{}");

        if (topic === "ws-manager-events") {
          await handleWsManagerEvents(data);
        } else if (topic === "get-user-server-request") {
          await handleGetUserServerRequest(data);
        }
      } catch (error) {
        console.error("Error processing Kafka message:", error);
      }
    },
  });

  console.log("✅ Kafka consumer started in ws-manager");
};


const handleWsManagerEvents = async ({ action, userId, serverId }: { action: string; userId: string; serverId: string }) => {
  if (action === "register") {
    console.log(`✅ User ${userId} registered on server ${serverId}`);
    await redisClient.set(`user:${userId}:server`, serverId);
    await setPresenceOnline(userId);
  } else if (action === "unregister") {
    console.log(`❌ User ${userId} unregistered from server ${serverId}`);
    await redisClient.del(`user:${userId}:server`);
    await setPresenceOffline(userId);
  }
};


const handleGetUserServerRequest = async ({ userId, requestId }: { userId: string; requestId: string }) => {
  console.log(`🔍 Fetching WebSocket server for user ${userId}`);

  const serverId = await redisClient.get(`user:${userId}:server`);

  await producer.send({
    topic: "get-user-server-response",
    messages: [{ key: requestId, value: JSON.stringify({ userId, serverId }) }],
  });

  console.log(`Sent serverId (${serverId || "offline"}) for user ${userId}`);
};

const setPresenceOnline = async (userId: string) => {
  try {
    await redisClient.set(`user:${userId}:status`, "online");
    await axios.post(`${process.env.API_ENDPOINT}/setPresenceOnline`, { userId });
  } catch (error) {
    console.error("❌ Error setting user presence online", error);
  }
};

const setPresenceOffline = async (userId: string) => {
  try {
    await redisClient.set(`user:${userId}:status`, "offline");
    await axios.post(`${process.env.API_ENDPOINT}/setPresenceOffline`, { userId });
  } catch (error) {
    console.error("❌ Error setting user presence offline", error);
  }
};

export { startKafkaConsumer };
