import { startKafkaConsumer } from "./kafka/kafka.consumer";

(async () => {
  console.log("🚀 ws-manager service starting...");
  await startKafkaConsumer();
})();
