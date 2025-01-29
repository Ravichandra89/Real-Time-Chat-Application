import { Router } from "express";
import { JoinGroup, ExistGroup } from "../controller/group.controller";

const groupRouter = Router();

// Define here the Grpup join/Exist routes
groupRouter.post("/:groupId/join", JoinGroup);
groupRouter.delete("/:groupId/exist", ExistGroup);

export default groupRouter;