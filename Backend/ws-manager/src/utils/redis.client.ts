import { createClient } from "redis";

const redisClient = createClient();

redisClient.on("error", (err) => console.error("Redis client error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));
redisClient.on("ready", () => console.log("Could not connect to Redis"));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log("Redis Client Connected Successfully");
    } catch (error) {
      console.error("Could not connect to Redis", error);
    }
  }
};

connectRedis();

export default redisClient;
