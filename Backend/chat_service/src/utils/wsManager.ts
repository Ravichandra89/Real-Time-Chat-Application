import { v4 as uuidv4 } from "uuid";
import { sendMessage } from "../kafka/kafka.producer";
import { addPendingRequest } from "../kafka/kafka.consumer";

// 📌 Function to fetch the WebSocket server for a user
export const getUserWsServer = async (
  userId: string
): Promise<string | null> => {
  return new Promise(async (resolve, reject) => {
    const requestId = uuidv4(); // Generate a unique request ID
    addPendingRequest(requestId, resolve);

    console.log(`📤 Requesting WebSocket server for user ${userId}`);

    try {
      await sendMessage("get-user-server-request", [
        { key: requestId, value: JSON.stringify({ userId, requestId }) },
      ]);

      // Timeout after 5 seconds if no response
      setTimeout(() => {
        reject(new Error("Timeout fetching WebSocket server"));
      }, 5000);
    } catch (error) {
      console.error("❌ Error sending Kafka message:", error);
      reject(error);
    }
  });
};
