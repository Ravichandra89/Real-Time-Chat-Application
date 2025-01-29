// Building the group Join and Exist Api's
/*
 JOIN : checking the GroupId
        Check User Already member of group or not
        Add the user in group as well as group membership

*/

import prisma from "../config/prisma.config";
import { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";
import { notifyGroupMembers } from "../websocket/webSocket.manager";

export const JoinGroup = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const { groupId } = req.params;

    if (!groupId || !userId) {
      return apiResponse(
        res,
        400,
        false,
        "Please provide both groupId and userId"
      );
    }

    // Check the groupId
    const groupIdExist = await prisma.group.findUnique({
      where: {
        groupId,
      },
    });

    if (!groupIdExist) {
      return apiResponse(res, 404, false, "Group does not exist");
    }

    // Check if User Already member of group or not
    const userAlreadyMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (userAlreadyMember) {
      return apiResponse(res, 400, false, "User already member of group");
    }

    // if the Use not exist than adding to group and member list
    await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: "Member",
      },
    });

    // notify the GroupMembers
    notifyGroupMembers(groupId, {
      type: "group_update",
      action: "join",
      groupId,
      userId,
      message: `User${userId} joined the group.`,
    });

    return apiResponse(res, 200, true, "User added Successfully");
  } catch (error) {
    console.error("Error While Join group", error);
    return apiResponse(res, 500, false, "Unable to join group");
  }
};

export const ExistGroup = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const { groupId } = req.params;

    if (!groupId || !userId) {
      return apiResponse(res, 400, false, "Group id and user id are required");
    }

    const groupExist = await prisma.group.findUnique({
      where: {
        groupId,
      },
    });

    if (!groupExist) {
      return apiResponse(res, 404, false, "Group does not exist");
    }

    // Check user member or not
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!member) {
      return apiResponse(res, 400, false, "User is not member of group");
    }

    // Remove the User from the group
    await prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId,
      },
    });

    // Notify GroupMembers
    notifyGroupMembers(groupId, {
      type: "group_update",
      action: "exist",
      groupId,
      userId,
      message: `User ${userId} exist the group.`,
    });

    return apiResponse(res, 200, true, "User Existed from the Group");
  } catch (error) {
    console.error("Error while exist member from group", error);
    return apiResponse(res, 500, false, "Unable to exist from group");
  }
};
