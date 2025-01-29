import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "user-service",
  brokers: ["localhost:9092"],
});

export const kafkaProducer = kafka.producer();

// Send archiveChat Event
export const sendArchiveEvent = async (
  userId: string,
  chatId: string,
  action: "archive" | "unarchive"
) => {
  await kafkaProducer.send({
    topic: "archive-chat",
    messages: [
      {
        value: JSON.stringify({ userId, chatId, action }),
      },
    ],
  });
};
