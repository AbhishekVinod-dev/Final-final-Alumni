import dotenv from "dotenv";
dotenv.config();

console.log("Loaded API Key:", process.env.OPENAI_API_KEY ? "Present" : "Missing");

import express from "express";
import cors from "cors";
import chatbotRouter from "./api/chatbot.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chatbot", chatbotRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
