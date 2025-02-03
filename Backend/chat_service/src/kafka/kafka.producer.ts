import { Kafka, Message } from "kafkajs";

const kafka = new Kafka({
  clientId: "chat-service-producer",
  brokers: [process.env.KAFKA_BROKERS!],
});

const producer = kafka.producer();

export const startProducer = async () => {
  await producer.connect();
  console.log("✅ Kafka producer connected in chat-service");
};

export const sendMessage = async (topic: string, messages: Message[]) => {
  try {
    await producer.send({ topic, messages });
  } catch (error) {
    console.error("❌ Error sending Kafka message:", error);
  }
};
