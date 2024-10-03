const express = require("express");
const { CohereClient } = require("cohere-ai");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Initialize the Cohere client with your API token from environment variable
const client = new CohereClient({ token: process.env.COHERE_API_TOKEN });

// Define an endpoint for receiving diary entries and returning movie recommendations
app.post("/recommend-movies", async (req, res) => {
  const { diaryEntry } = req.body;

  if (!diaryEntry) {
    return res.status(400).json({ error: "Diary entry is required." });
  }

  try {
    // Call the Cohere API with the diary entry to get recommendations
    const response = await client.chat({
      message: diaryEntry,
      model: "command-r-08-2024",
      preamble:
        "You are an AI-assistant chatbot designed to provide personalized movie recommendations by analyzing the emotional tone, themes, and content of user diary entries. The diary entry can be either a single entry or a collection of multiple entries. Based on this analysis, suggest movies that match the overall sentiment, themes, or moods found in the diary.",
    });

    // The recommendations are directly in the 'text' field of the response
    const recommendations = response.text;

    if (recommendations) {
      res.json({ recommendations });
    } else {
      res.status(500).json({ error: "No recommendations found." });
    }
  } catch (error) {
    console.error("Error with Cohere API:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});