import { Router } from "express";
import {
  fetchUserProfile,
  updateUserProfile,
} from "../controller/profile.controller";

const profileRouter = Router();
// Define here the Routes

profileRouter.get("/:userId", fetchUserProfile);
profileRouter.put("/:userId/update", updateUserProfile);

export default profileRouter;
