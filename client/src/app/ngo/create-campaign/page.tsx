"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/Hooks/Redux/store";
import { campaignService, ngoService } from "../../../services/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Leaf,
  MapPin,
  Calendar,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type CampaignFormInputs = {
  title: string;
  description: string;
  location: string;
  date: string;
  ngoId?: string;
  createdBy?: string;
};

export default function CampaignForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CampaignFormInputs>();

  const [loading, setLoading] = useState<boolean>(false);
  const [ngoLoading, setNgoLoading] = useState<boolean>(false);
  const [associatedNgo, setAssociatedNgo] = useState<any>(null);

  const { user } = useSelector((state: RootState) => state.auth as { user: any });

  useEffect(() => {
    const checkNgoWorkspace = async () => {
      if (!user?._id) return;
      try {
        setNgoLoading(true);
        const res = await ngoService.getMyNgo();
        if (res?.success && res?.data) {
          setAssociatedNgo(res.data);
        }
      } catch (err) {
        console.error("Error verifying NGO context for campaign:", err);
      } finally {
        setNgoLoading(false);
      }
    };

    checkNgoWorkspace();
  }, [user]);

  const onSubmit: SubmitHandler<CampaignFormInputs> = async (data) => {
    try {
      setLoading(true);

      const payload: CampaignFormInputs = {
        ...data,
        ngoId: associatedNgo?._id || undefined,
        createdBy: user?._id,
      };

      const res = await campaignService.createCampaign(payload);

      // 1. Dispatch success hot-toast notice 
      toast.success(res.message || "Campaign launched successfully! 🌿", {
        style: {
          background: '#0d1e16',
          color: '#34d399',
          border: '1px solid rgba(52, 211, 153, 0.2)',
        },
      });

      reset();

      router.push("/ngo/dashboard");

    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to deploy environmental campaign 🌱",
        {
          style: {
            background: '#1a0b0b',
            color: '#f87171',
            border: '1px solid rgba(248, 113, 113, 0.2)',
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07130d] text-white pt-28 pb-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-[#0d1e16] border border-white/10 rounded-[30px] overflow-hidden p-8 md:p-10">
         <div className="flex items-center justify-between mb-10">
                   <Link
                        href="/ngo/dashboard"
                        className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition"
                    >
                        <ArrowLeft size={18} />
                        Back To Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight">Create Your Campaign Form </h1>
                </div>
        {/* Modern Neon Glow Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0b2015] to-black p-8 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <Leaf className="text-emerald-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wide">Create Eco Campaign</h1>

              {ngoLoading ? (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                  <span className="text-xs text-emerald-400/60 animate-pulse">Syncing workspace profile...</span>
                </div>
              ) : (
                <p className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold mt-1">
                  {associatedNgo?.ngoName || "Green Pulse Workspace"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">

          {/* Campaign Title */}
          <div className="space-y-2">
            <label className="text-sm font-bold tracking-wide text-emerald-400/90 flex items-center gap-2">
              <FileText size={16} /> Campaign Title
            </label>
            <input
              {...register("title", { required: "A distinct campaign title is required" })}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all duration-300"
              placeholder="e.g., Riverside Clean-up Initiative"
            />
            {errors.title && (
              <p className="text-red-400 text-xs font-semibold flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold tracking-wide text-emerald-400/90">
              Mission Description
            </label>
            <textarea
              {...register("description", {
                required: "Please map out the objectives for this campaign",
              })}
              rows={5}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all duration-300 resize-none"
              placeholder="Outline schedules, volunteer requirements, and target goals..."
            />
            {errors.description && (
              <p className="text-red-400 text-xs font-semibold flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.description.message}
              </p>
            )}
          </div>

          {/* Grid Layout fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Location */}
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wide text-emerald-400/90 flex items-center gap-2">
                <MapPin size={16} /> Target Location
              </label>
              <input
                {...register("location", {
                  required: "Target operational site location is required",
                })}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all duration-300"
                placeholder="City or Field Coordinates"
              />
              {errors.location && (
                <p className="text-red-400 text-xs font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {errors.location.message}
                </p>
              )}
            </div>

            {/* Campaign Launch Date */}
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wide text-emerald-400/90 flex items-center gap-2">
                <Calendar size={16} /> Deployment Date
              </label>
              <input
                type="date"
                {...register("date", {
                  required: "Please set a target execution date",
                })}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white calendar-dark focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all duration-300"
              />
              {errors.date && (
                <p className="text-red-400 text-xs font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {errors.date.message}
                </p>
              )}
            </div>
          </div>

          {/* Core Dispatch Action Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 font-black tracking-wide text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Deploying Campaign Workspace...
              </>
            ) : (
              <>
                <Send size={18} />
                Deploy Campaign
              </>
            )}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .calendar-dark::-webkit-calendar-picker-indicator {
          filter: invert(1) sepia(1) saturate(5) hue-rotate(90deg);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}