"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../Hooks/Redux/store"; 
import { motion } from "framer-motion";
import {
  Megaphone,
  MapPin,
  Calendar,
  Users,
  Loader2,
  ThumbsUp,
  CheckCircle,
} from "lucide-react";
import { viewAllCampaigns, approveCampaign } from "../../../Hooks/Redux/Slices/adminSlice"; 

export default function AdminCampaigns() {
  const dispatch = useDispatch<AppDispatch>();
  const { campaigns, loading } = useSelector((state: RootState) => state.admin);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(viewAllCampaigns());
  }, [dispatch]);

  const handleApprove = async (campaignId: string) => {
    try {
      setApprovingId(campaignId);
      await dispatch(approveCampaign(campaignId)).unwrap();
      // Instantly refetch list from server to bring down the freshly updated schema values
      dispatch(viewAllCampaigns());
    } catch (error) {
      console.error("Failed to execute admin approval stream:", error);
    } finally {
      setApprovingId(null);
    }
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-emerald-400 bg-[#07130d]">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130d] text-white p-6">
      <h1 className="text-3xl font-black mb-6 flex items-center gap-2">
        <Megaphone className="text-emerald-400" />
        Campaign Management
      </h1>

      {campaigns.length === 0 ? (
        <div className="bg-[#0d1e16] border border-white/5 rounded-3xl p-10 text-center text-gray-400 mt-6">
          No environmental protection campaigns found in registry.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c, i) => {
            // STRICT REDUX FILTER: A campaign is ONLY approved if the flag is explicitly boolean true or string "true"
            // If the property is missing/undefined in your MongoDB documents, this evaluates strictly to FALSE.
            const isApprovedState = c.isApprovedByAdmin === true || String(c.isApprovedByAdmin) === "true";
            
            const isCompletedState = c.status === "completed";
            const isOngoingState = c.status === "ongoing";

            // Hide the action button ONLY if it is truly approved by the admin, or is already completed/ongoing
            const shouldHideButton = isApprovedState || isCompletedState || isOngoingState;

            return (
              <motion.div 
                key={c._id || i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0d1e16] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
                  </div>

                  {c.ngoName && (
                    <p className="text-xs text-emerald-400/80 mt-1">Organized by {c.ngoName}</p>
                  )}

                  <p className="text-gray-400 text-sm mt-2 line-clamp-3">{c.description}</p>

                  <div className="mt-4 space-y-2 text-sm text-gray-300 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{c.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-400 shrink-0" />
                      <span>{c.date ? new Date(c.date).toDateString() : "No Date Provided"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-emerald-400 shrink-0" />
                      <span>{c.totalVolunteers ?? 0} Registered Volunteers</span>
                    </div>
                  </div>
                </div>

                {/* ACTION & STATUS FOOTER */}
                <div className="mt-6 flex items-center justify-between gap-2 border-t border-white/5 pt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      shouldHideButton
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {/* If it's not approved yet, visually enforce the badge to display "pending" */}
                    {!isApprovedState && c.status === "upcoming" ? "pending" : (c.status || "pending")}
                  </span>

                  {/* Operational Split Control */}
                  {shouldHideButton ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                      <CheckCircle size={14} />
                      {isCompletedState ? "Completed" : isOngoingState ? "Ongoing" : "Approved"}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApprove(c._id)}
                      disabled={approvingId === c._id}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs transition duration-200 cursor-pointer shadow-md shadow-emerald-500/5"
                    >
                      {approvingId === c._id ? (
                        <Loader2 className="animate-spin w-3.5 h-3.5" />
                      ) : (
                        <ThumbsUp size={14} />
                      )}
                      Approve Campaign
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}