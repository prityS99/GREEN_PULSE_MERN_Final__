"use client";

import { useState } from "react";
import { Mail, User, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";
import { contactService } from "../../services/api";

// Import Framer Motion and the Variants type
import { motion, Variants } from "framer-motion";

// --- Animation Variants ---

// This container staggers the entrance of the header and form.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2, // Small initial delay
      staggerChildren: 0.15, // Delay between child animations
    },
  },
};

// Item variant for header components (slides up)
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

// Form variant (slides up with different parameters for contrast)
const formVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
};

// Subtle animation on the Send button hover
const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await contactService.sendMessage(formData);

      if (!response.success) {
        throw new Error(response.message || "Failed to send message");
      }

      toast.success(response.message || "Message sent successfully 🌿");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // Replaced standard <section> with motion.section
    <motion.section
      className="min-h-screen bg-gradient-to-b from-green-950 via-black to-green-950 py-20 px-6"
      initial="hidden" // Sets initial state for all variants inside
      animate="visible" // Starts the 'visible' state animation sequence
      variants={containerVariants} // Main orchestrator
    >
      <div className="max-w-4xl mx-auto">
        {/* Header - Replaced <div> with motion.div for animation */}
        <motion.div className="text-center mb-14" variants={itemVariants}>
          <h1 className="text-5xl font-bold text-white mb-5">
            Contact Green Pulse
          </h1>

          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Whether you're a citizen, NGO, officer, or volunteer, your voice
            matters.
          </p>
        </motion.div>

        {/* Form Container - Replaced <div> with motion.div */}
        <motion.div
          className="bg-white/5 backdrop-blur-lg border border-green-500/20 rounded-3xl p-8 md:p-12 shadow-2xl"
          variants={formVariants} // Applied the slightly heavier animation
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="text-green-300 mb-2 block">Full Name</label>

              <div className="relative">
                <User className="absolute left-4 top-4 text-gray-400" />

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/40 border border-green-700/30 rounded-xl py-3 pl-12 text-white focus:border-green-500 transition-colors duration-200"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-green-300 mb-2 block">Email Address</label>

              <div className="relative">
                <Mail className="absolute left-4 top-4 text-gray-400" />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/40 border border-green-700/30 rounded-xl py-3 pl-12 text-white focus:border-green-500 transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Subject */}
            <input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Subject"
              className="w-full bg-black/40 border border-green-700/30 rounded-xl py-3 px-4 text-white focus:border-green-500 transition-colors duration-200"
            />

            {/* Message */}
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-gray-400" />

              <textarea
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Write your message..."
                className="w-full bg-black/40 border border-green-700/30 rounded-xl py-3 pl-12 text-white resize-none focus:border-green-500 transition-colors duration-200"
              />
            </div>

            {/* Button - Replaced <button> with motion.button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl disabled:opacity-70"
              // Add simple interaction animation
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  {/* Added a subtle loading animation */}
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send size={20} />
                  Send Message
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.section>
  );
}