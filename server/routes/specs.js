const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { generateTasks } = require("../services/llmService");

router.post("/generate", async (req, res) => {
  const { goal, users, constraints, template } = req.body;

  if (!goal || !users) {
    return res.status(400).json({ error: "Goal and users are required" });
  }

  try {
    const rawOutput = await generateTasks(req.body);

    let parsedOutput;

    try {
      parsedOutput = JSON.parse(rawOutput);
    } catch (err) {
      return res.status(500).json({ error: "Invalid JSON from LLM" });
    }

    db.run(
      `INSERT INTO specs (goal, users, constraints, template, output)
       VALUES (?, ?, ?, ?, ?)`,
      [goal, users, constraints, template, JSON.stringify(parsedOutput)]
    );

    res.json(parsedOutput);

  } catch (error) {
    res.status(500).json({ error: "Generation failed" });
  }
});

router.get("/recent", (req, res) => {
  db.all(
    `SELECT * FROM specs ORDER BY created_at DESC LIMIT 5`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });

      const formatted = rows.map(row => ({
        ...row,
        output: JSON.parse(row.output)
      }));

      res.json(formatted);
    }
  );
});

module.exports = router;
