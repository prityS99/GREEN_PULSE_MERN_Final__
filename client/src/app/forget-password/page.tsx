"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:4002/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({
          type: "success",
          text: data.message || "A temporary auto-generated password has been sent to your email.",
        });
        setEmail(""); 
      } else {
        setMessage({
          type: "error",
          text: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Unable to connect to the server. Please check your internet connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Graphic Engine */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/pass.jpg" 
          alt="Green Pulse Portal View"
          fill
          priority
          className="object-cover object-center brightness-[0.25] scale-105 blur-md"
        />
      </div>

      {/* Ambient Light Orbs */}
      <div className="mt-30 absolute top-1/4 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md transform rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl lg:bg-slate-800/40 lg:border-slate-700/50 transition-all"
      >
        <div>
          {/* Brand Header Symbolism */}
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/20">
            <Mail className="w-10 h-10" />
          </div>
          <h2 className=" text-center text-3xl font-bold tracking-tight text-white mb-2">
            Green Pulse
          </h2>
          <p className="text-center text-slate-300 text-sm mb-6 font-medium leading-relaxed px-2">
            Forgot your password? No problem. Enter your email configuration below and we will send you a temporary passkey setup.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="relative rounded-xl shadow-sm">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3.5 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm backdrop-blur-sm transition-all"
              placeholder="Enter your email address"
            />
          </div>

          {/* Conditional Alert Handling Block */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 p-4 rounded-xl text-sm leading-relaxed border ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/20"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="break-words w-full">{message.text}</span>
            </motion.div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-[0.99] text-sm ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Processing Request...
                </span>
              ) : (
                "Send Temporary Password"
              )}
            </button>
          </div>
        </form>

        {/* Navigation Utilities */}
        <div className="text-center mt-6 pt-4 border-t border-white/5">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 font-semibold text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Login Portal
          </Link>
        </div>

        {/* Global Branding Subtext */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400/60 font-semibold tracking-wider">
            &copy; 2026 Green Pulse Foundation. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}