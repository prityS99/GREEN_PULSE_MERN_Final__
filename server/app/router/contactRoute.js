
const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/ContactController");

router.post("/send", ContactController.sendMessage);

module.exports = router;