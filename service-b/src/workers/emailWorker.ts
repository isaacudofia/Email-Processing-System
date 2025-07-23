import { Worker, Job } from "bullmq";
import Message from "../model/Message";

interface EmailJobData {
  messageId: string;
}

const emailWorker = new Worker(
  "email-processing",
  async (job: Job<EmailJobData>) => {
    const { messageId } = job.data;

    try {
      console.log(`Processing job ${job.id} for message ${messageId}`);

      // Fetch the message from MongoDB using the provided ID
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error(`Message with ID ${messageId} not found`);
      }

      // Simulate email sending by logging
      console.log(
        `Sending message to [${message.email}]: [${message.message}]`
      );

      // Simulate some processing time (remove in production)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`Successfully processed message ${messageId}`);

      return {
        success: true,
        messageId,
        email: message.email,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error; // This will mark the job as failed
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    },
    concurrency: 5, // Process up to 5 jobs concurrently
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
    removeOnFail: { count: 50 }, // Keep last 50 failed jobs
  }
);

// Event listeners for monitoring
emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  const jobId = job?.id ?? "unknown";
  const errorMsg =
    err && typeof err === "object" && "message" in err
      ? err.message
      : String(err);
  console.error(`Job ${jobId} failed:`, errorMsg);
});

emailWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

export default emailWorker;
