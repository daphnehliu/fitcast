const express = require("express");
const axios = require("axios");
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json()); // Add this to parse JSON requests


const WEATHER_API_KEY = "f076a815a1cbbdb3f228968604fdcc7a"; // Replace with your actual API key


// ✅ Weather Proxy Endpoint
app.get("/weather", async (req, res) => {
 try {
   const response = await axios.get(
     `https://api.openweathermap.org/data/2.5/weather?q=Palo%20Alto&appid=${WEATHER_API_KEY}&units=imperial`
   );
   res.json(response.data);
 } catch (error) {
   console.error("Error fetching weather:", error.message);
   res.status(500).json({ error: "Failed to fetch weather data" });
 }
});


// ✅ OpenAI Proxy Endpoint
app.post("/openai", async (req, res) => {
 try {
   const response = await axios.post(
     "https://api.openai.com/v1/chat/completions",
     req.body,
     {
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer YOUR_OPENAI_API_KEY`, // Replace with your real key
       },
     }
   );
   res.json(response.data);
 } catch (error) {
   console.error("Error fetching OpenAI response:", error.message);
   res.status(500).json({ error: "Failed to fetch OpenAI response" });
 }
});


// ✅ Start the Proxy Server
app.listen(3000, () => console.log("Proxy running on port 3000"));


