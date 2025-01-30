import { Kafka } from "kafkajs";
import redisClient from "../utils/redis.client";
import dotenv from "dotenv";
import axios from "axios";

const kafka = new Kafka({
  clientId: "ws-manager",
  brokers: ["process.env.KAFKA_BROKERS"],
});

const consumer = kafka.consumer({ groupId: "ws-manager-group" });

// Helper Functions
const setPresenceOnline = async (userId: string) => {
  try {
    await redisClient.set(`user:${userId}:status`, "online");
    await axios.post(`${process.env.API_ENDPOINT}/setPresenceOnline`, {
      userId,
    });
  } catch (error) {
    console.error("Error setting user presence online", error);
  }
};

const setPresenceOffline = async (userId: string) => {
  try {
    await redisClient.set(`user:${userId}:status`, "offline");
    await axios.post(`${process.env.API_ENDPOINT}/setPresenceOffline`, {
      userId,
    });
  } catch (error) {
    console.error("Error setting user presence offline", error);
  }
};

export const startKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "ws-manager-events",
    fromBeginning: true,
  });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { action, userId, serverId } = JSON.parse(
        message.value?.toString() || "{}"
      );

      if (action == "register") {
        console.log(`User ${userId} registered on server ${serverId}`);
        await redisClient.set(`user:${userId}:server`, serverId);
        await setPresenceOnline(userId);
      } else if (action == "unregister") {
        console.log(`User ${userId} Un Registered on server ${serverId}`);
        await redisClient.del(`user:${userId}:server`);
        await setPresenceOffline(userId);
      }
    },
  });
  console.log("Kafka consumer started for ws-manager events");
};
