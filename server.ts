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

  // Database Initialization
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        prompt TEXT,
        response TEXT,
        rating INTEGER,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Feedback table ready");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }

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

  // Feedback Endpoint
  app.post("/api/feedback", async (req, res) => {
    try {
      const { prompt, response, rating, comment } = z.object({
        prompt: z.string(),
        response: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }).parse(req.body);

      await pool.query(
        "INSERT INTO feedback (prompt, response, rating, comment) VALUES ($1, $2, $3, $4)",
        [prompt, response, rating, comment]
      );

      res.json({ status: "success", message: "Feedback received" });
    } catch (error) {
      console.error("Feedback Error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
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
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    
    // Ensure static files that are not found don't return index.html
    app.get("/soulserver-bg.jpg", (req, res) => {
      res.sendFile(path.join(distPath, "soulserver-bg.jpg"), (err) => {
        if (err) res.status(404).end();
      });
    });

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
