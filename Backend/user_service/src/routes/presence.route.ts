import { Router } from "express";
import { getUserPresence } from "../controller/presence.controller";

const presenceRouter = Router();

// Define here routes
presenceRouter.get("/:userId", getUserPresence);

export default presenceRouter;
