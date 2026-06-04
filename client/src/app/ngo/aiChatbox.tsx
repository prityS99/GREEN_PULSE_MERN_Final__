"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  WandSparkles,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { aiService } from "@/services/aiConfig";

interface AIBoxProps {
  ngoDescription?: string;
}

export default function AIChatbox({ ngoDescription = "" }: AIBoxProps) {
  const [description, setDescription] = useState<string>(ngoDescription);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- HOT TOAST STATE ---------- //
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  // Automatically clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ---------------- GENERATE SUMMARY ---------------- //
  const handleGenerateSummary = async () => {
    if (!description.trim()) {
      setError("Please provide an NGO description first.");
      showToast("Description cannot be empty!", "error");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSummary("");

      const response = await aiService.summarizeNGO(description);

      if (response && response.summary) {
        setSummary(response.summary);
        showToast("Summary generated successfully!", "success");
      } else if (response && response.message) {
        // Safe check: filter out old message if it slips through from backend
        const cleanMsg = response.message.includes("AI profile overview parsed!")
          ? "Failed to process context query structure."
          : response.message;
        
        setError(cleanMsg);
        showToast(cleanMsg, "error");
      } else {
        setError("An unexpected error occurred.");
        showToast("Generation failed", "error");
      }
    } catch (err: any) {
      console.error("AI Summary Error:", err);
      const errorMsg = err.message || "Failed to reach the AI service.";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- COPY ---------------- //
  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    showToast("Copied to clipboard!", "success");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative bg-white/90 backdrop-blur-xl border border-green-100 rounded-[32px] shadow-xl overflow-hidden">
      
      {/* HOT TOAST NOTIFICATION BENCH */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl border text-sm font-semibold transition-all ${
              toast.type === "success"
                ? "bg-emerald-500 border-emerald-400 text-white"
                : toast.type === "error"
                ? "bg-red-500 border-red-400 text-white"
                : "bg-gray-800 border-gray-700 text-white"
            }`}
          >
            {toast.type === "error" && <AlertCircle size={16} />}
            {toast.type === "success" && <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Sparkles size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI NGO Assistant</h2>
            <p className="text-green-100 mt-1">
              Convert long NGO descriptions into a clean 50-word summary.
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">
        {/* TEXTAREA */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            NGO Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder="Paste NGO description here..."
            className="w-full rounded-3xl border border-green-100 bg-green-50/50 px-5 py-4 outline-none focus:ring-2 focus:ring-green-500 resize-none text-gray-700"
          />
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <WandSparkles size={20} />
              Generate AI Summary
            </>
          )}
        </button>

        {/* RESULT */}
        {summary && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              {/* Changed Header Title Here */}
              <h3 className="text-xl font-bold text-gray-900">Updated Short Summary</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-xl font-semibold transition-all"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={18} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-3xl p-6">
              <p className="text-gray-700 leading-8">{summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}