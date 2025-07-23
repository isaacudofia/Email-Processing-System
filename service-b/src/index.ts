import express from "express";
import connectDB from "./config/database";
import emailWorker from "./workers/emailWorker";
import { Queue } from "bullmq";

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to database
connectDB();

// Initialize the worker
console.log("Service B (Worker) starting...");
console.log("Email worker initialized and listening for jobs");

// Create a BullMQ Queue instance for stats
const emailQueue = new Queue("email-processing", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Service B (Worker) is running",
    timestamp: new Date().toISOString(),
    worker: {
      isRunning: !emailWorker.closing,
      concurrency: 5,
    },
  });
});

// Worker stats endpoint
app.get("/stats", async (req, res) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      emailQueue.getWaiting(),
      emailQueue.getActive(),
      emailQueue.getCompleted(),
      emailQueue.getFailed(),
    ]);

    res.json({
      success: true,
      stats: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching worker stats",
    });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down worker gracefully...");
  await emailWorker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down worker gracefully...");
  await emailWorker.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Service B (Worker) running on port ${PORT}`);
});
