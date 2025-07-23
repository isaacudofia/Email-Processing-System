import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { Queue } from "bullmq";
import Message from "../model/Message";

const router = express.Router();

// Initialize Redis queue
const emailQueue = new Queue("email-processing", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

// Validation rules
const messageValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("message")
    .isLength({ min: 1, max: 1000 })
    .trim()
    .withMessage("Message must be between 1 and 1000 characters"),
];

// POST /messages - Create and queue a new message
router.post("/", messageValidation, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, message } = req.body;

    // Save message to MongoDB
    const newMessage = new Message({
      email,
      message,
    });

    const savedMessage =
      (await newMessage.save()) as import("../model/Message").IMessage;

    // Add job to Redis queue with the saved message ID
    await emailQueue.add("process-email", {
      messageId: (
        savedMessage._id as unknown as { toString: () => string }
      ).toString(),
    });

    res.status(201).json({
      success: true,
      message: "Message saved and queued for processing",
      data: {
        id: savedMessage._id,
        email: savedMessage.email,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /messages - Retrieve all messages (bonus feature)
router.get("/", async (req: Request, res: Response) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(100);

    res.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
