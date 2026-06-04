"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../Hooks/Redux/store";
import { loginUser, clearErrors } from "../../Hooks/Redux/Slices/authSlice";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";

const Login: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, successMessage, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    dispatch(clearErrors());
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);


  useEffect(() => {
    if (isAuthenticated || successMessage) {
      setFormData({ email: "", password: "" });

      const timer = setTimeout(() => {

        if (typeof window !== "undefined") {
          const customRedirect = sessionStorage.getItem("redirectAfterLogin");
          if (customRedirect) {
            sessionStorage.removeItem("redirectAfterLogin");
            router.push(customRedirect);
            return;
          }
        }
        const role = user?.role;

        switch (role) {
          case "ngo":
            router.push("/ngo/dashboard");
            break;
          case "cleaning_company":
            router.push("/cleaning-company/dashboard");
            break;
          case "admin":
            router.push("/admin/dashboard");
            break;
          case "govtOfficer":
            router.push("/govtOfficer/dashboard");
            break;
          default:
            router.push("/");
            break;
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, successMessage, user, router]);


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearErrors());
    dispatch(loginUser(formData));
  };

  return (
    <div className="relative grid min-h-screen w-full grid-cols-1 lg:grid-cols-2 bg-slate-900 overflow-hidden">

      {/* GLOBAL MOBILE & TABLET BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 lg:hidden">
        <Image
          src="/login.avif"
          alt="Green Pulse Background View"
          fill
          priority
          className="object-cover object-center brightness-[0.35]"
        />
      </div>

      {/* LEFT SIDE: Side Image Panel (Visible on Desktop screens only) */}
      <div className="hidden lg:block relative z-10 overflow-hidden bg-slate-950">
        <Image
          src="/login.avif"
          alt="Green Pulse Portal View"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-emerald-950/20 backdrop-brightness-[0.75] backdrop-contrast-[1.05]" />

        <div className="absolute bottom-12 left-12 z-20 max-w-md text-white">
          <h3 className="text-3xl font-black tracking-tight drop-shadow-md">Green Pulse</h3>
          <p className="mt-2 text-sm text-emerald-100/90 font-medium drop-shadow-sm leading-6">
            Monitor ecological campaigns, map cleaning activities, and track micro-contributions around the clock.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Form Container */}
      <div className="relative z-10 flex items-center justify-center px-4 py-12 lg:bg-none">

        {/* Form Glass Card */}
        <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl lg:bg-slate-800/40 lg:border-slate-700/50 transition-all">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
            <p className="mt-2 text-sm text-slate-200 lg:text-slate-300 font-medium">
              Log in to manage your GreenPulse metrics
            </p>
          </div>

          {/* Upgraded Redux Feedback Banner Hook */}
          {(successMessage || error) && (
            <div
              className={`mb-5 rounded-lg p-3 text-center text-sm font-semibold border transition-all ${successMessage
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                }`}
            >
              {successMessage || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="eco@greenpulse.com"
                className="w-full rounded-xl border border-white/20 bg-slate-900/40 lg:bg-slate-900/50 lg:border-slate-700 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-slate-900/70 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-bold text-slate-200">Password</label>
                <Link href="/forget-password" className="text-xs font-semibold text-emerald-400 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/20 bg-slate-900/40 lg:bg-slate-900/50 lg:border-slate-700 px-4 py-3 pr-12 text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-slate-900/70 focus:ring-1 focus:ring-emerald-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-emerald-400 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full transform rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 font-bold text-white shadow-md transition duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  <span>Authenticating...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Navigation Toggle */}
          <p className="mt-6 text-center text-sm text-slate-200 lg:text-slate-300 font-medium">
            New to the movement?{" "}
            <Link href="/signup" className="font-bold text-emerald-400 hover:underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;