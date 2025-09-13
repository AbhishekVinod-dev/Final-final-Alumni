/* eslint-disable max-len */

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(functions.config().sendgrid.key);
// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const sgMail = require("@sendgrid/mail");

// admin.initializeApp();
// const db = admin.firestore();

// sgMail.setApiKey(functions.config().sendgrid.key);

// exports.sendNotificationEmail = functions.firestore
//     .document("notifications/{notifId}")
//     .onCreate(async (snap, context) => {
//       const data = snap.data();
//       const {subject, body, target} = data;

//       try {
//         const recipients = [];

//         if (target === "all" || target === "students") {
//           const students = await db.collection("students").get();
//           students.forEach((doc) => {
//             if (doc.data().email) recipients.push(doc.data().email);
//           });
//         }

//         if (target === "all" || target === "alumni") {
//           const alumni = await db.collection("alumni").get();
//           alumni.forEach((doc) => {
//             if (doc.data().email) recipients.push(doc.data().email);
//           });
//         }

//         if (recipients.length === 0) {
//           console.log("No recipients found.");
//           return null;
//         }

//         const msg = {
//           to: recipients,
//           from: "your_verified_sender@domain.com", // replace with verified sender
//           subject,
//           text: body,
//           html: `<p>${body}</p>`,
//         };

//         await sgMail.sendMultiple(msg);
//         console.log(`✅ Email sent to ${recipients.length} recipients`);
//         return null;
//       } catch (err) {
//         console.error("❌ Error sending email:", err);
//         return null;
//       }
//     });


// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// functions/index.js
// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const sgMail = require("@sendgrid/mail");

// admin.initializeApp();
// sgMail.setApiKey(functions.config().sendgrid.key); // Your SendGrid API key

// exports.sendAnnouncementEmail = functions.firestore
//     .document("notifications/{docId}")
//     .onCreate(async (snap, context) => {
//       const announcement = snap.data();
//       const targetRole = announcement.targetRole || "all";

//       // Reference to users collection
//       let usersRef = admin.firestore().collection("users");

//       // Filter users by role if targetRole is not 'all'
//       if (targetRole !== "all") {
//         usersRef = usersRef.where("role", "==", targetRole);
//       }

//       const usersSnap = await usersRef.get();
//       const emails = usersSnap.docs
//           .map((doc) => doc.data().email)
//           .filter(Boolean); // remove undefined emails

//       if (emails.length === 0) return null;

//       const msg = {
//         to: emails,
//         from: "noreply@alumniconnect.com", // your verified sender
//         subject: announcement.subject,
//         text: announcement.body,
//         html: `<p>${announcement.body}</p>`,
//       };

//       try {
//         await sgMail.sendMultiple(msg);
//         console.log(`Announcement emails sent to ${targetRole} users`);
//       } catch (err) {
//         console.error("Error sending announcement emails:", err);
//       }
//     });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Configuration, OpenAIApi } = require("openai");

admin.initializeApp();
const db = admin.firestore();

const configuration = new Configuration({
  apiKey: functions.config().openai.key,
});
const openai = new OpenAIApi(configuration);

exports.chatbot = functions.https.onRequest(async (req, res) => {
  try {
    const { message } = req.body;

    // 🔹 Fetch relevant data from Firestore
    const eventsSnap = await db.collection("events").get();
    const events = eventsSnap.docs.map((d) => d.data());

    const fundraisingSnap = await db.collection("fundraising").get();
    const fundraising = fundraisingSnap.docs.map((d) => d.data());

    const internshipsSnap = await db.collection("internships").get();
    const internships = internshipsSnap.docs.map((d) => d.data());

    // 🔹 Create knowledge base text
    let contextText = "Here is the alumni platform data:\n\n";

    if (events.length) {
      contextText += "Events:\n" + events.map(e => `- ${e.title}: ${e.date} at ${e.location}`).join("\n") + "\n\n";
    }

    if (fundraising.length) {
      contextText += "Fundraising:\n" + fundraising.map(f => `- ${f.campaignName}: ${f.amountRaised}/${f.goal}`).join("\n") + "\n\n";
    }

    if (internships.length) {
      contextText += "Internships:\n" + internships.map(i => `- ${i.title} at ${i.company} (posted by ${i.postedBy})`).join("\n") + "\n\n";
    }

    // 🔹 Send context + user question to OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are the AI Alumni Assistant. Answer ONLY using the provided alumni platform data." },
        { role: "system", content: contextText },
        { role: "user", content: message },
      ],
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
