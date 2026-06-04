
"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../Hooks/Redux/store";
import { signupUser, clearErrors } from "../../Hooks/Redux/Slices/authSlice";

import { Eye, EyeOff, Loader2 } from "lucide-react";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "ngo" | "cleaning_company" | "govt_officer" | "user";
}

const Signup: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearErrors());
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const email = formData.email;

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      const timer = setTimeout(() => {
        router.push(
          `/verify-email/pending?email=${encodeURIComponent(email)}`
        );
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, router, formData.email]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearErrors());

    dispatch(
      signupUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
    );
  };

  return (
    <div className="relative grid mt-4 min-h-screen w-full grid-cols-1 lg:grid-cols-2 bg-slate-900 overflow-hidden">

      {/* LEFT IMAGE */}
      <div className="hidden lg:block relative bg-slate-950">
        <img
          src="/signup.jpg"
          alt="Signup"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-emerald-950/30" />

        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="text-3xl font-bold">Join Green Pulse</h2>
          <p className="text-sm mt-2 text-emerald-100">
            Create your account and start contributing to a cleaner world.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-white/20">

          <h2 className="text-3xl font-bold text-white text-center">
            Create Account
          </h2>

          <p className="text-center text-sm text-slate-300 mt-2 mb-6">
            Join and make an impact
          </p>

          {(successMessage || error) && (
            <div
              className={`mb-4 text-sm p-3 rounded-lg text-center ${
                successMessage
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {successMessage || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-white/20"
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-white/20"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-white/20 pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ROLE */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white border border-white/20"
            >
              <option value="user">User</option>
              <option value="ngo">NGO</option>
              <option value="cleaning_company">Cleaning Company</option>
              <option value="govt_officer">Government Officer</option>
              <option value="admin">Admin</option>
            </select>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Creating...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-300 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;