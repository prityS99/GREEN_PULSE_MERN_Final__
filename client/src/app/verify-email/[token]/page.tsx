"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../Hooks/Redux/store"; 
import { verifyEmail, clearErrors } from "../../../Hooks/Redux/Slices/authSlice"; 
import { Mail, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams(); 

  const token = params.token; 
  const email = searchParams.get("email");

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  const hasCalled = useRef(false);

  useEffect(() => {
    dispatch(clearErrors());

    if (token && token !== "pending" && !hasCalled.current) {
      hasCalled.current = true;
      dispatch(verifyEmail(token as string)); 
    }

    return () => {
      dispatch(clearErrors());
    };
  }, [token, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const redirectTimer = setTimeout(() => {
        router.push("/login");
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [successMessage, router]);

  const isWaitingForEmailClick = (!token || token === "pending") && email;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0">
        <Image
          src="/login.avif" 
          alt="Green Pulse Portal View"
          fill
          priority
          className="object-cover object-center brightness-[0.25] scale-105 blur-md"
        />
      </div>

      <div className="absolute top-1/4 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md transform rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl lg:bg-slate-800/40 lg:border-slate-700/50 text-center transition-all"
      >
        
        {/* CASE 1: WAITING FOR USER TO CLICK INBOX LINK */}
        {isWaitingForEmailClick && !loading && !successMessage && !error && (
          <div className="animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/20">
              <Mail className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Check Your Email</h2>
            <p className="text-slate-200 text-sm mb-6 font-medium leading-relaxed">
              We sent a validation link securely to:<br/>
              <span className="text-emerald-400 font-bold block mt-1 break-words px-2">{decodeURIComponent(email || "")}</span>
            </p>
            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] leading-normal">
                Click the activation button inside that delivery to verify your platform access
              </p>
            </div>
          </div>
        )}

        {/* CASE 2: LOADING */}
        {loading && token !== "pending" && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="animate-spin text-emerald-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white tracking-tight">Verifying Credentials...</h2>
            <p className="text-slate-300 text-sm mt-2 font-medium">Validating security signatures</p>
          </div>
        )}

        {/* CASE 3: VERIFICATION SUCCESSFUL */}
        {!loading && successMessage && (
          <div className="animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="text-3xl font-bold text-emerald-400 tracking-tight mb-2">Account Verified!</h2>
            <p className="text-slate-200 text-sm font-medium px-4 mb-2 leading-relaxed">
              {successMessage || "Your profile structure is activated. Welcome to Green Pulse!"}
            </p>
            <p className="text-xs text-slate-400 font-medium mb-6 animate-pulse">
              Redirecting you to the login screen automatically...
            </p>
            <button 
              onClick={() => router.push("/login")} 
              className="group flex items-center gap-2 mx-auto bg-white/5 border border-white/10 text-emerald-400 font-bold hover:bg-white/10 px-5 py-2.5 rounded-full transition-all text-sm"
            >
              Go to Login Panel <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* CASE 4: ERROR */}
        {!loading && error && token !== "pending" && (
          <div className="animate-in shake duration-300">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
              <XCircle size={44} />
            </div>
            <h2 className="text-3xl font-bold text-rose-400 tracking-tight mb-2">Validation Blocked</h2>
            <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-6 mx-2 text-center break-words">
              {error}
            </p>
            <button 
              onClick={() => router.push("/signup")} 
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-[0.99]"
            >
              Back to Sign Up
            </button>
          </div>
        )}

        {/* CATCH ALL FALLBACK */}
        {!email && (!token || token === "pending") && !loading && !successMessage && !error && (
          <div>
            <div className="w-20 h-20 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={44} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Invalid Link Parameters</h2>
            <p className="text-slate-300 text-sm mb-6 px-4">Verification reference variables are missing. Please sign up to re-trigger execution tracking.</p>
            <Link href="/signup" className="block w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm">
              Create New Account
            </Link>
          </div>
        )}

        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <p className="text-xs text-slate-400/60 font-semibold tracking-wider">
            &copy; 2026 Green Pulse Foundation. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function UnifiedVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-400" size={32} />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}