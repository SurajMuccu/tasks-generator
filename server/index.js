require("dotenv").config();
const specsRoutes = require("./routes/specs");

const db = require("./db/database");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/specs", specsRoutes);


const axios = require("axios");

app.get("/status", async (req, res) => {
  let dbStatus = "ok";
  let llmStatus = "ok";

  // Check DB
  await new Promise((resolve) => {
    db.get("SELECT 1", [], (err) => {
      if (err) dbStatus = "error";
      resolve();
    });
  });

  // Check LLM (lightweight test call)
  try {
    await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Ping" }],
        max_tokens: 1
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    llmStatus = "error";
  }

  res.json({
    backend: "ok",
    database: dbStatus,
    llm: llmStatus
  });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
