const axios = require("axios");

async function generateTasks(data) {
  const systemPrompt = `
You are a senior product manager and engineering lead.
You must return strictly valid JSON.
Do not include explanations.
Do not wrap response in markdown.
`;

  const userPrompt = `
Based on the following feature idea:

Goal: ${data.goal}
Users: ${data.users}
Constraints: ${data.constraints}
Template Type: ${data.template}

Generate:

1. userStories (array of strings)
2. engineeringTasks:
   - frontend (array)
   - backend (array)
   - database (array)
   - testing (array)
3. risks (array of strings)

Return strictly in this JSON format:

{
  "userStories": [],
  "engineeringTasks": {
    "frontend": [],
    "backend": [],
    "database": [],
    "testing": []
  },
  "risks": []
}
`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",

        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.error("LLM Error:", error.response?.data || error.message);
    throw new Error("LLM generation failed");
  }
}

module.exports = { generateTasks };
