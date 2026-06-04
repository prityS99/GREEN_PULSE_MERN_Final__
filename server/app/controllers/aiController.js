const AIService = require("../services/ai/aiService");

class AIController {

  async handleChatConversation(req, res) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Prompt request message body string is required.",
        });
      }

      const reply = await AIService.generateChatReply(message);

      return res.status(200).json({
        success: true,
        message: "AI response sequence built successfully.",
        reply,
      });
    } catch (error) {
      console.error("AI Controller runtime crash context:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal processing exception within AI subsystem.",
      });
    }
  }

  /**
   * Dedicated 50-word fast summarization endpoint
   * POST /api/ai/summarize-ngo
   */
  async summarizeNGODescription(req, res) {
    try {
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({
          success: false,
          message: "Description text parameter is required",
        });
      }

      if (description.length < 50) {
        return res.status(400).json({
          success: false,
          message: "Description string matrix is too brief to evaluate accurately (Min 50 chars).",
        });
      }

      const summary = await AIService.summarizeNGO(description);

      return res.status(200).json({
        success: true,
        message: "Summary generated successfully",
        summary,
      });
    } catch (error) {
      console.error("AI Summary Controller exception:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed running algorithmic summation over description payload.",
      });
    }
  }
}


module.exports = new AIController();