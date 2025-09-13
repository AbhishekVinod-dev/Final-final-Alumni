import chatbotRouter from "./api/chatbot.js";

app.use("/api/chatbot", chatbotRouter);
import express from "express";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import chatbotRouter from "./api/chatbot.js";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Load service account
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json"));
initializeApp({
  credential: cert(serviceAccount),
});

// Firestore
const db = getFirestore();

// Mount chatbot route
app.use("/api/chatbot", chatbotRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
