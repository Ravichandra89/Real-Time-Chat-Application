import app from "./src/app";
import prisma from "./src/config/prisma.client";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to database successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
