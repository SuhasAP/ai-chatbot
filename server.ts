import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFallbackResponse(message: string) {
  const query = message.toLowerCase();

  if (query.includes("admission") || query.includes("apply") || query.includes("eligibility")) {
    return "For SNPSU admissions, you can apply at admission.snpsu.edu.in. The listed eligibility is 45% aggregate in 10+2/PUC. For confirmation, contact admissions@snpsu.edu.in or call 9900072632.";
  }

  if (query.includes("fee") || query.includes("fees")) {
    return "I don't have the latest fee table locally. Please contact SNPSU admissions at admissions@snpsu.edu.in or call 9900072632 for the current fee details.";
  }

  if (query.includes("course") || query.includes("program") || query.includes("engineering")) {
    return "SNPSU offers engineering degrees including CSE, AIML, AIDS, DS, ECE, and EEE at B.E and M.Tech levels.";
  }

  if (query.includes("scholarship")) {
    return "SNPSU lists scholarships for Merit, Sports, Defence, Rural, NCC, NSS, and Disability categories.";
  }

  if (query.includes("placement") || query.includes("recruiter")) {
    return "SNPSU placement information lists 200+ recruiters and 35 Fortune 500 companies.";
  }

  if (query.includes("hostel") || query.includes("facility") || query.includes("wifi") || query.includes("campus")) {
    return "SNPSU facilities include modern labs, separate hostels for boys and girls, and a Wi-Fi enabled campus.";
  }

  if (query.includes("snpsu") || query.includes("sapthagiri")) {
    return "Sapthagiri NPS University (SNPSU) is located in Bengaluru, Karnataka. You can ask me about admissions, courses, scholarships, placements, hostel facilities, or campus details.";
  }

  return "I can help with SNPSU admissions, courses, scholarships, placements, and facilities. For anything official or very specific, contact admissions@snpsu.edu.in or call 9900072632.";
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8080;
  const isProduction = process.env.NODE_ENV === "production" || process.env.npm_lifecycle_event === "start";

  app.use(express.json());

  // Initialize Gemini
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;

      // Inject University Context
      const systemPrompt = `You are SapthaBot, the official AI assistant for Sapthagiri NPS University (SNPSU) in Bengaluru. 
      Use the following context to answer student queries accurately. If you don't know the answer, suggest they contact admissions@snpsu.edu.in or call 9900072632.
      
      UNIVERSITY CONTEXT:
      - Name: Sapthagiri NPS University (SNPSU)
      - Location: Bengaluru, Karnataka
      - Engineering Degrees: CSE, AIML, AIDS, DS, ECE, EEE (B.E and M.Tech)
      - Admissions: Apply at admission.snpsu.edu.in. 45% aggregate in 10+2/PUC.
      - Scholarships: Merit, Sports, Defence, Rural, NCC, NSS, and Disability categories.
      - Placements: 200+ recruiters, 35 Fortune 500 companies.
      - Faculty Leaders: Dr. N.C. Mahendra Babu (Dean Engineering), Prof. Gurucharan Singh (CHRO).
      - Facilities: Modern labs, separate hostels for boys/girls, Wi-Fi campus.
      
      Be professional, helpful, and concise. Use a friendly "Human-like" tone.`;

      const recentHistory = Array.isArray(history)
        ? history
            .map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.content}`)
            .join("\n")
        : "";

      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `${systemPrompt}\n\nRecent conversation:\n${recentHistory}\n\nUser: ${message}`,
        config: {
          maxOutputTokens: 500,
        },
      });

      res.json({ text: response.text || "" });
    } catch (error) {
      console.error("AI Error:", error);
      res.json({ text: getFallbackResponse(req.body?.message || "") });
    }
  });

  // Mock API for Events
  app.get("/api/events", (req, res) => {
    res.json([
      { id: 1, title: "Lakshya 2026 Sports Meet", date: "April 2026", type: "Sports" },
      { id: 2, title: "Aurafesta Cultural Fest", date: "May 9-10, 2026", type: "Cultural" },
      { id: 3, title: "International Conference 2026", date: "June 15, 2026", type: "Academic" },
      { id: 4, title: "Hackathon: Innovation 2026", date: "July 2, 2026", type: "Tech" }
    ]);
  });

  // Vite middleware for development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
