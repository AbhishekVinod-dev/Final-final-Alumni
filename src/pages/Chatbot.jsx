import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import OpenAI from "openai";

// 🔹 Firebase setup (init only once)
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// 🔹 OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // Fetch Firestore data
    const eventsSnap = await db.collection("events").get();
    const fundraisingSnap = await db.collection("fundraising").get();
    const internshipsSnap = await db.collection("internships").get();

    const events = eventsSnap.docs.map((d) => d.data());
    const fundraising = fundraisingSnap.docs.map((d) => d.data());
    const internships = internshipsSnap.docs.map((d) => d.data());

    // Build context for AI
    let context = "Here is the alumni platform data:\n\n";

    // 📅 Events
    if (events.length) {
      context += "📅 **Events:**\n";
      events.forEach((e, idx) => {
        context += `${idx + 1}. **${e.title}** (${e.type || "N/A"})\n`;
        context += `   - **Date:** ${e.date}\n`;
        context += `   - **Organizer:** ${e.organizer || "N/A"}\n`;
        context += `   - **Description:** ${e.description || "N/A"}\n`;
      });
      context += "\n";
    }

    // 💰 Fundraising
    if (fundraising.length) {
      context += "💰 **Fundraising Campaigns:**\n";
      fundraising.forEach((f, idx) => {
        context += `${idx + 1}. **${f.campaignName}**\n`;
        context += `   - **Raised:** ${f.amountRaised} / ${f.goal}\n`;
        context += `   - **Organizer:** ${f.organizer || "N/A"}\n`;
      });
      context += "\n";
    }

    // 🏢 Internships
    if (internships.length) {
      context += "🏢 **Internships:**\n";
      internships.forEach((i, idx) => {
        context += `${idx + 1}. **${i.title}** at ${i.company}\n`;
        context += `   - **Duration:** ${i.duration || "N/A"}\n`;
        context += `   - **Stipend:** ${i.stipend || "N/A"}\n`;
      });
      context += "\n";
    }

    // Ask OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap
      messages: [
        {
          role: "system",
          content: "You are the AI Alumni Assistant. Use only the provided Firestore data.",
        },
        { role: "system", content: context },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({ error: "Chatbot error" });
  }
}