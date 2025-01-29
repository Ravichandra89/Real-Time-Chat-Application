import { Request, Response } from "express";
import prisma from "../config/prisma.config";
import { sendArchiveEvent } from "../config/Kafka.Producer";
import apiResponse from "../utils/apiResponse";

/*
 * @POST: ArchiveChat
 * @POST: UnArchiveChat
 * @GET : GetArchiveChats
 */

export const archiveChat = async (req: Request, res: Response) => {
  try {
    const { userId, chatId } = req.body;

    if (!userId || !chatId)
      return apiResponse(res, 400, false, "UserId and ChatId is Required");

    const archivedResponse = await prisma.archiveChat.create({
      data: {
        userId,
        chatId,
        isArchived: true,
      },
    });

    // Send to the kafka
    await sendArchiveEvent(userId, chatId, "archive");

    return apiResponse(res, 200, true, "Chat archived successfully!", {
      archivedResponse,
    });
  } catch (error) {
    console.error("Error in archiveChat", error);
    return apiResponse(res, 500, false, "Unable to archiveChat");
  }
};

export const UnArchiveChat = async (req: Request, res: Response) => {
  try {
    const { userId, chatId } = req.body;

    if (!userId || !chatId) {
      return apiResponse(res, 400, false, "UserId and ChatId is Required");
    }

    const unArchiveResponse = await prisma.archiveChat.updateMany({
      where: {
        userId,
        chatId,
      },
      data: {
        isArchived: false, 
      },
    });

    if (unArchiveResponse.count === 0) {
      return apiResponse(
        res,
        404,
        false,
        "No archived chat found to unarchive"
      );
    }

    await sendArchiveEvent(userId, chatId, "unarchive");

    return apiResponse(res, 200, true, "Unarchived chat successfully!");
  } catch (error) {
    console.error("Error in unarchiving chat", error);
    return apiResponse(res, 500, false, "Unable to unarchiveChat");
  }
};

export const getArchivedChats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return apiResponse(res, 400, false, "UserId is Required");
    }

    const archivedChats = await prisma.archiveChat.findMany({
      where: {
        userId,
      },
      include: {
        chat: true,
      },
    });

    if (archivedChats.length === 0) {
      return apiResponse(res, 200, true, "No archived chats found");
    }

    return apiResponse(res, 200, true, "Archived chats fetched successfully!", {
      archivedChats,
    });
  } catch (error) {
    console.error("Error in getArchivedChats", error);
    return apiResponse(res, 500, false, "Unable to getArchivedChats");
  }
};
