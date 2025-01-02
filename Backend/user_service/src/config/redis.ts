import Redis from "ioredis";

const client = new Redis({
  host: process.env.HOST_NAME || "localhost",
  port: process.env.PORT || 6379,
});

export default client;
