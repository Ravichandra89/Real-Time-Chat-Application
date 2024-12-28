import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Importing the routes
import userRouter from "./routes/user.route";
import profileRouter from "./routes/profile.route";
import { isLeftHandSideExpression } from "typescript";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Define the base route
app.use("/api/v1/user", userRouter);
app.use("/api/v1/user/profile", profileRouter);

export default app;