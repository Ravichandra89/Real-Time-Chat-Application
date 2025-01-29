import { Response, Request } from "express";
import prisma from "../config/prisma.config";
import apiResponse from "../utils/apiResponse";

export const fetchUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return apiResponse(res, 400, false, "User ID is required");
    }

    // Fetching User Profile
    const userProfile = await prisma.user.findUnique({
      where: {
        userId,
      },
      select: {
        username: true,
        email: true,
        phone: true,
        profile: true,
        isActive: true,
        lastSeen: true,
      },
    });

    if (!userProfile) {
      return apiResponse(res, 404, false, "User not found");
    }

    return apiResponse(
      res,
      200,
      true,
      "User Profile Fetched Successfully",
      userProfile
    );
  } catch (error) {
    console.error("Error fetching user profile", error);
    return apiResponse(res, 500, false, "Error fetching user profile");
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return apiResponse(res, 400, false, "User ID is required");
    }

    const { username, email, phone, profile } = req.body;
    if (!username && !email && !phone && !profile) {
      return apiResponse(res, 400, false, "At least one field is required");
    }

    const updatedUser = await prisma.user.update({
      where: {
        userId,
      },
      data: {
        ...(username && { username }),
        ...(phone && { phone }),
        ...(profile && { profile }),
      },
      select: {
        username: true,
        email: true,
        phone: true,
        profile: true,
        isActive: true,
        lastSeen: true,
      },
    });

    return apiResponse(
      res,
      200,
      true,
      "User Profile Updated successfully",
      updateUserProfile
    );
  } catch (error) {
    console.error("Error updating user profile", error);
    return apiResponse(res, 500, false, "Error updating user profile");
  }
};


