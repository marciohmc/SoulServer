import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import pg from "pg";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Brain Server Infrastructure
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database Connection (PostgreSQL)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.APP_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  // Gemini AI Initialization
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      name: "Brain", 
      env: process.env.APP_ENV || "development" 
    });
  });

  // Example Gemini Endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt } = z.object({ prompt: z.string() }).parse(req.body);
      
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      res.json({ response: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // Example Database Endpoint
  app.get("/api/data", async (req, res) => {
    try {
      const result = await pool.query("SELECT NOW()");
      res.json({ time: result.rows[0].now });
    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).json({ error: "Database connection failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Brain server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
