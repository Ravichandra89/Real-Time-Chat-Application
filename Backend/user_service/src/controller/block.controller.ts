// Block User, UnBlock User, MuteUser, UnMute User
import { Request, Response } from "express";
import prisma from "../config/prisma.config";
import apiResponse from "../utils/apiResponse";
import { getEffectiveConstraintOfTypeParameter } from "typescript";

// TODO: Add the kafka Event for triggering other services
export const BlockUser = async (req: Request, res: Response) => {
  try {
    const { blockerId, blockedId } = req.body;
    if (!blockerId || !blockedId)
      return apiResponse(
        res,
        400,
        false,
        "Both blockerId and blockedId are required."
      );

    const response = await prisma.blockUser.create({
      data: {
        blockerId,
        blockedId,
      },
    });

    if (!response) {
      return apiResponse(res, 400, false, "Failed to block user.");
    }

    return apiResponse(res, 200, true, "User blocked successfully!");
  } catch (error) {
    console.error("Error blocking user", error);
    return apiResponse(res, 500, false, "Error blocking user");
  }
};

export const unBlockUser = async (req: Request, res: Response) => {
  try {
    const { blockerId, blockedId } = req.body;
    if (!blockerId || !blockedId) {
      return apiResponse(
        res,
        400,
        false,
        "Both blockerId and blockedId are required"
      );
    }

    const response = await prisma.blockUser.deleteMany({
      where: {
        blockerId,
        blockedId,
      },
    });

    if (!response) {
      return apiResponse(res, 400, false, "Failed to unblock user.");
    }

    return apiResponse(res, 200, true, "Successfully unblocked users");
  } catch (error) {
    console.error("Error unblocking user", error);
    return apiResponse(res, 500, false, "Error unblocking user");
  }
};

export const MuteUser = async (req: Request, res: Response) => {
  try {
    const { muterId, mutedId } = req.body;
    if (!muterId || !mutedId) {
      return apiResponse(res, 400, false, "Id's are Required");
    }

    const response = await prisma.muteUser.create({
      data: {
        muterId,
        mutedId,
      },
    });

    if (!response) {
      return apiResponse(res, 400, false, "Failed to mute user.");
    }

    return apiResponse(res, 200, true, "Successfully muted users");
  } catch (error) {
    console.error("Error muting users", error);
    return apiResponse(res, 500, false, "Error muting users");
  }
};

export const unmuteUser = async (req: Request, res: Response) => {
  try {
    const { muterId, mutedId } = req.body;
    if (!muterId || !mutedId) {
      return apiResponse(res, 400, false, "Id's are Required");
    }

    const response = await prisma.muteUser.deleteMany({
      where: {
        muterId,
        mutedId,
      },
    });

    if (!response) {
      return apiResponse(res, 400, false, "Failed to unmute user.");
    }

    return apiResponse(res, 500, false, "Succesfully unMuted the user.");
  } catch (error) {
    console.error("Error unmuting User", error);
    return apiResponse(res, 500, false, "Error unmuting User");
  }
};
