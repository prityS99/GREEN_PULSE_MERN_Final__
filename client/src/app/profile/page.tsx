"use client";

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
// Import your new updateProfile thunk from your slice file location
import { fetchProfile, updateProfile, clearErrors } from "../../Hooks/Redux/Slices/authSlice"; 
import { AppDispatch, RootState } from "../../Hooks/Redux/store";

// Icon components matching your active authentication systems
import { Eye, EyeOff, Loader2, Camera, User, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Redux State Access
  const { user, loading, error, successMessage } = useSelector((state: RootState) => state.auth);

  // 2. Component Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // File objects and temporary binary preview URLs stored locally
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localFeedback, setLocalFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAddress((user as any).address || "");
      if ((user as any).profileImage?.url) {
        setImagePreview((user as any).profileImage.url);
      }
    }
  }, [user]);

  useEffect(() => {
    dispatch(clearErrors());
    setLocalFeedback(null);
  }, [dispatch]);

  // 3. Handle Local Avatar Changes & Size Validation
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setLocalFeedback({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    setSelectedFile(file);
    // Create a temporary object URL to show the preview before submitting to server
    setImagePreview(URL.createObjectURL(file));
    setLocalFeedback(null);
  };

  // 4. Combined Profile Submission Form
  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalFeedback(null);
    dispatch(clearErrors());

    if (password && password !== confirmPassword) {
      setLocalFeedback({ type: "error", text: "Passwords do not match." });
      return;
    }

    // Initialize an empty FormData object
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("address", address);
    
    if (password) {
      formData.append("password", password);
    }

    // Append file binary under the same identifier name 'image' required by backend upload middleware
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    // Dispatch your centralized updateProfile thunk action payload
    const result = await dispatch(updateProfile(formData));

    if (updateProfile.fulfilled.match(result)) {
      setPassword("");
      setConfirmPassword("");
      setSelectedFile(null);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Background Graphic Engine */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/profile.avif" 
          alt="Green Pulse Portal View"
          fill
          priority
          className="object-cover object-center brightness-[0.25] scale-105 blur-md"
        />
      </div>

      {/* Ambient Light Orbs */}
      <div className="mt-10 absolute top-1/4 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* CENTER WORKSPACE CARD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-xl transform rounded-2xl border border-white/20 bg-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl lg:bg-slate-800/40 lg:border-slate-700/50 transition-all my-auto"
      >
        <div>
          {/* Brand Header Custom Symbolism */}
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/20">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white mb-1">
            Profile Settings
          </h2>
          <p className="text-center text-slate-300 text-sm mb-6 font-medium leading-relaxed">
            View or modify your personal platform configuration credentials.
          </p>
        </div>

        {/* Dynamic Image Avatar Uploader Module */}
        <div className="flex flex-col items-center justify-center space-y-3 mb-6 bg-slate-950/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <div 
            className="relative w-24 h-24 rounded-full border-2 border-white/20 overflow-hidden bg-slate-900 shadow-xl group cursor-pointer flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="User Avatar" className="w-full h-full object-cover transition-opacity group-hover:opacity-60" />
            ) : (
              <span className="text-slate-400 font-bold text-3xl">{name.charAt(0).toUpperCase() || "U"}</span>
            )}
            
            {/* Fade Camera icon overlay element */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">
            Role: {user?.role || "User"}
          </span>
          {/* Subtle note showing selection success to user */}
          {selectedFile && (
            <span className="text-[11px] text-emerald-400 font-medium">New photo selected! Save below to upload.</span>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>

        {/* System Error & Success Alerts Blocks matching exact authentication structures */}
        {(localFeedback || error || successMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 p-4 rounded-xl text-sm leading-relaxed border mb-5 ${
              (localFeedback?.type === "success" || successMessage)
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-300 border-rose-500/20"
            }`}
          >
            {(localFeedback?.type === "success" || successMessage) ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="break-words w-full">
              {localFeedback ? localFeedback.text : (successMessage || error)}
            </span>
          </motion.div>
        )}

        {/* Form Inputs */}
        <form className="space-y-4" onSubmit={handleProfileSubmit}>
          
          {/* FULL NAME */}
          <div className="space-y-1.5">
            <label htmlFor="fullname" className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Full Name</label>
            <input
              id="fullname"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm backdrop-blur-sm transition-all"
              placeholder="Your Full Name"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm backdrop-blur-sm transition-all"
              placeholder="email@example.com"
            />
          </div>

          {/* RESIDENTIAL ADDRESS */}
          <div className="space-y-1.5">
            <label htmlFor="address" className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Residential Address</label>
            <textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm backdrop-blur-sm transition-all resize-none"
              placeholder="Enter your street or location address..."
            />
          </div>

          {/* SECURITY DIVISION BAR */}
          <div className="pt-2 border-t border-dashed border-white/10 mt-2">
            <span className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Update Password</span>
            <p className="text-[11px] text-slate-400">Leave these clean fields blank if you do not wish to reset system keys.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NEW PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password (Optional)"
                className="block w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 pr-10 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm backdrop-blur-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* CONFIRM NEW PASSWORD */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="block w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 pr-10 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm backdrop-blur-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* CORE SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-[0.99] text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Saving Configuration Details...
                </span>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </div>
        </form>

        {/* Navigation back utilities */}
        <div className="text-center mt-6 pt-4 border-t border-white/5">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-semibold text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Central Dashboard
          </Link>
        </div>

        {/* Global Branding Subtext */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400/60 font-semibold tracking-wider">
            &copy; 2026 Green Pulse Foundation. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}