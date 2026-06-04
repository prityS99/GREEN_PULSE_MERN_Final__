const Contact = require("../models/Contact");
const { sendContactUsEmail } = require("../services/mail/emailService");

class ContactController {
  async sendMessage(req, res) {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Save in DB
      const contact = await Contact.create({
        name,
        email,
        subject,
        message,
      });

      // Send email using YOUR TEMPLATE FUNCTION
      await sendContactUsEmail({
        name,
        email,
        subject,
        message,
      });

      return res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: contact,
      });

    } catch (error) {
      console.error("Contact Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to send message",
      });
    }
  }
}

module.exports = new ContactController();