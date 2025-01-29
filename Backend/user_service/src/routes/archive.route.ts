import { Router } from "express";
import {
  archiveChat,
  UnArchiveChat,
  getArchivedChats,
} from "../controller/archiveChat.controller";

const chatRouter = Router();

// define here the routers
chatRouter.post("/archive", archiveChat);
chatRouter.post("/unarchive", UnArchiveChat);
chatRouter.get("/chats", getArchivedChats);

export default chatRouter;
