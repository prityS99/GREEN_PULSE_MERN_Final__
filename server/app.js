require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
// const helmet = require("helmet");
const session=require('express-session')
const cookieParser=require('cookie-parser')
const swaggerJsDoc = require('swagger-jsdoc');
const flash = require('connect-flash');
const swaggerUi = require('swagger-ui-express');
const SwaggerOptions = require('./swagger.json');
const logger  = require('./app/utils/logger');
const swaggerDocument = swaggerJsDoc(SwaggerOptions);
const { GoogleGenAI } = require("@google/genai");
const http = require('http');
const cors = require('cors')


// DB
const DatabaseConnection = require("./app/config/dbcon");
DatabaseConnection();

app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true,               
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// DEFINE JSON //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(helmet());


// static
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CREATE HTTP SERVER //
const server = http.createServer(app);

// SOCKET //
const { initSocket } = require("./app/sockets/socket");
initSocket(server);




// CONNECT FLASH //
app.use(flash());

app.get('/api/notifications', (req, res) => {
  // req.flash() pulls the messages out of the session and empties it
  const successMessages = req.flash('success');
  const errorMessages = req.flash('error');
  
  res.json({
    success: successMessages.length > 0 ? successMessages : null,
    error: errorMessages.length > 0 ? errorMessages : null
  });
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/ai/summarize-ngo", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: "No description payload provided." 
      });
    }

    // Call the free Gemini-2.5-flash model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an operational data assistant. Summarize the following NGO description into a highly engaging, professional executive summary that is strictly under 50 words: "${description}"`,
    });

    const summaryText = response.text || "Summary compilation returned blank.";

    return res.status(200).json({
      success: true,
      summary: summaryText.trim()
    });

  } catch (error) {
    console.error("Gemini API Pipeline Fault:", error);
    return res.status(500).json({
      success: false,
      message: "Free AI Engine failed to process context query structure."
    });
  }
});

// ROUTES //
app.use(require('./app/router/index'))  


const port = 4002;

server.listen(port, () => {
  console.log("Server running on port", port);
});