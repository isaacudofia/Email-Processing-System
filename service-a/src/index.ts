import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/database";
import messagesRouter from "./routes/messages";

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/messages", messagesRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Service A (API) is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
);

app.listen(PORT, () => {
  console.log(`Service A (API) running on port ${PORT}`);
});
