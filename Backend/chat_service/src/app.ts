import { startProducer } from "./kafka/kafka.producer";
import { startConsumer } from "./kafka/kafka.consumer";

const startServices = async () => {
  await startProducer();
  await startConsumer();
};

startServices();
