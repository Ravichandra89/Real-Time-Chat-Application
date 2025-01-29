import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// WebSocket Setup
import http from "http";
import webSocketSetUp from "./websocket/webSocket.manager";

// Importing the routes
import userRouter from "./routes/user.route";
import profileRouter from "./routes/profile.route";
import presenceRouter from "./routes/presence.route";
import groupRouter from "./routes/group.routes";
import blockRouter from "./routes/block.route";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Define the base route
app.use("/api/v1/user", userRouter);
app.use("/api/v1/user/profile", profileRouter);
app.use("/api/v1/user/presence", presenceRouter);
app.use("/api/v1/group", groupRouter);
app.use("/api/v1/mb", blockRouter);

// Start Websocket
webSocketSetUp(server);

export default app;
