import TryCatch from "../Config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/Chat.js";


export const createNewChat = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;
    if (!otherUserId) {
        return res.status(400).json({
            success: false,
            message: "Other user ID is required",
        });
    }
    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 },
    });
    if (existingChat) {
        return res.status(200).json({
            success: true,
            message: "Chat already exists",
            chatId: existingChat._id,
        });
    }
    const newChat = await Chat.create({
        users: [userId, otherUserId],
    });

    res.status(201).json({
        success: true,
        message: "Chat created successfully",
        chatId: newChat._id,
    });
});

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const chats = await Chat.find({
        users: userId,
    }).sort({ updatedAt: -1 });
    const chatWithUserData = await Promise.all(
        chats.map(async (chat) => {
            const otherUserId = chat.users.find((id) => id !== userId);
            
        })
    )
    res.status(200).json({
        success: true,
        chats,
    });
});