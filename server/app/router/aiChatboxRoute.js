const express = require("express");
const router = express.Router();
const AIController = require("../controllers/aiController"); // Adjust path based on your real app structure

// Direct mapping vectors to controller class method proxies
router.post("/chat", AIController.handleChatConversation);
router.post("/summarize-ngo", AIController.summarizeNGODescription);

module.exports = router;