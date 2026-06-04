"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/Hooks/Redux/store";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  MapPin,
  Send,
  Loader2,
  Heart,
  ShieldAlert
} from "lucide-react";
import { volunteerService } from "../../services/api"; 

// ❌ REMOVED: import { Router } from "next/router"; 
// This line was causing the conflicting lowercase/uppercase declaration error!

interface IVolunteerRequestInput {
  name: string;
  age: number;
  phone: string;
  address: string;
}

export default function VolunteerRequestFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth) as { user: any };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IVolunteerRequestInput>({
    defaultValues: {
      name: user?.name || "",
      age: undefined,
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (user?.name) {
      setValue("name", user.name);
    }
  }, [user, setValue]);

  /* =========================================================
      SUBMIT HANDLER
  ========================================================= */
  const onSubmit: SubmitHandler<IVolunteerRequestInput> = async (data) => {
    if (!campaignId) {
      toast.error("Missing valid environmental mission target ID parameter Context.");
      return;
    }

    const toastId = toast.loading("Submitting your volunteer registration parameters...");
    try {
      setIsSubmitting(true);

      const payload = {
        name: data.name,
        age: Number(data.age),
        phone: data.phone,
        address: data.address,
      };

      const result = await volunteerService.applyForCampaign(campaignId, payload);

      if (result.success) {
        toast.success("Ecosystem Application Lodged Successfully! NGO Notified.", { id: toastId });
        
        // Redirects directly to the user home page layout dashboard after 1.5s
        setTimeout(() => {
          router.push("/"); // 🌟 Updated from "/ngo/dashboard" to "/"
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to post authorization attributes.");
      }
    } catch (error: any) {
      console.error("Volunteer dispatch anomaly detected:", error);
      const serverErrorMessage = error.response?.data?.message || error.message || "Ecosystem interface runtime error.";
      toast.error(serverErrorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07130d] text-white py-14 px-4 mt-10">
      <div className="max-w-4xl mx-auto">
        
        {/* NAVIGATION LAYER */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition font-bold text-sm"
          >
            <ArrowLeft size={16} /> Back to Missions Overview
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Heart size={12} className="animate-pulse fill-emerald-400" /> Volunteer Application
          </div>
        </div>

        {/* HERO BANNER SECTION */}
        <div className="relative overflow-hidden rounded-[35px] border border-white/10 bg-gradient-to-r from-emerald-950 via-[#0d1f16] to-black p-10 mb-10">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-4xl font-black tracking-tight leading-tight max-w-2xl">
            Join Environmental Mission
          </h1>
          <p className="text-gray-300 mt-3 text-sm max-w-2xl leading-relaxed">
            Please register your active verification tracking records. This operational metadata profile allows host NGOs to configure security profiles, deploy logistics assets, and safely assign field roles.
          </p>
        </div>

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* APPLICANT LEGAL NAME */}
          <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-6 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("name", { required: "Legal profile name mapping required" })}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 outline-none focus:border-emerald-500 text-white font-medium transition-all"
                placeholder="Enter your first and last name..."
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
            {errors.name && (
              <p className="text-rose-400 text-xs font-bold mt-1 px-1">{errors.name.message}</p>
            )}
          </div>

          {/* AGE & PHONE TILES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AGE INPUT */}
            <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-6 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                Current Age <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register("age", { 
                    required: "Age validation bounds parameter required",
                    min: { value: 15, message: "Field applicants must be 15 years or older" },
                    max: { value: 90, message: "Please input valid numerical boundaries" }
                  })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 outline-none focus:border-emerald-500 text-white font-medium transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Minimum age 15..."
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              </div>
              {errors.age && (
                <p className="text-rose-400 text-xs font-bold mt-1 px-1">{errors.age.message}</p>
              )}
            </div>

            {/* TELEPHONE TERMINAL */}
            <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-6 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                Hotline Connection Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  {...register("phone", { 
                    required: "Contact interface line parameter required",
                    pattern: { value: /^[0-9]{10}$/, message: "Please enter a valid 10-digit smartphone sequence" }
                  })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 outline-none focus:border-emerald-500 text-white font-medium transition-all"
                  placeholder="Enter 10-digit mobile number..."
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              </div>
              {errors.phone && (
                <p className="text-rose-400 text-xs font-bold mt-1 px-1">{errors.phone.message}</p>
              )}
            </div>

          </div>

          {/* PHYSICAL ADDRESS INPUT */}
          <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-6 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Residential Postal Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("address", { required: "Physical localization context required" })}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 outline-none focus:border-emerald-500 text-white font-medium transition-all"
                placeholder="Street name, City, State, ZIP code markers..."
              />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
            {errors.address && (
              <p className="text-rose-400 text-xs font-bold mt-1 px-1">{errors.address.message}</p>
            )}
          </div>

          {/* SYSTEM DISPATCH ACTION TRIGGER */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 py-5 rounded-2xl font-black text-md uppercase tracking-wider text-white shadow-xl hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin text-white" size={20} />
                Lodging Core Request...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Volunteer Application
              </>
            )}
          </button>

        </form>

        {/* COMPLIANCE DISCLOSURE FOOTER */}
        <div className="mt-6 flex items-start gap-2 text-xs text-gray-400/80 bg-black/10 border border-white/5 rounded-2xl p-4">
          <ShieldAlert size={16} className="text-emerald-500/60 mt-0.5 flex-shrink-0" />
          <p>
            By submitting this configuration sequence layout data, you provide consent to share your structural registration data fields directly with the host NGO organizing the ecological clean campaign mission.
          </p>
        </div>

      </div>
    </div>
  );
}