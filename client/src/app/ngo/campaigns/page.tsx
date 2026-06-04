"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { campaignService } from "../../../services/api"; 
import { 
  MapPin, 
  Calendar, 
  Users, 
  Building, 
  ArrowRight, 
  Loader2, 
  Leaf,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion"; // Fixed: Added missing motion import

// Interfaces matched to your system blueprint
export type CampaignStatus = "active" | "completed" | "upcoming";

export interface Campaign {
  _id: string;
  title: string;
  description: string;
  ngoId: string;
  location: string;
  date: string;
  status: CampaignStatus;
  createdBy: string;
  ngoName?: string;
  ngoLogo?: string;
  totalVolunteers?: number;
  volunteers?: string[];
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic API Fetch Execution
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await campaignService.getAllCampaigns();
        const data = Array.isArray(response) ? response : response?.data || [];
        setCampaigns(data);
      } catch (err: any) {
        console.error("Error fetching marketplace campaigns:", err);
        setError(err?.response?.data?.message || "Failed to sync active eco-workspaces. 🌱");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleJoinClick = (campaignId: string) => {
    router.push(`/volunteer-request?campaignId=${campaignId}`);
  };

  const getStatusBadgeStyles = (status: CampaignStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "upcoming":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-white/5 text-gray-400 border-white/10";
      default:
        return "bg-white/5 text-gray-400 border-white/10";
    }
  };

  // 1. Neon Ecosystem Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#07130d] text-white">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <p className="text-emerald-400/80 uppercase tracking-widest font-bold text-xs animate-pulse">
          Syncing Dynamic Eco Campaigns...
        </p>
      </div>
    );
  }

  // 2. Neon Ecosystem Connection Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#07130d] px-4">
        <div className="w-full max-w-md bg-[#0d1e16] border border-red-500/20 p-8 rounded-[30px] text-center shadow-2xl">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 w-fit mx-auto mb-4">
            <AlertCircle className="text-red-400" size={24} />
          </div>
          <p className="text-red-400 font-semibold mb-4 text-sm tracking-wide">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130d] text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button Container */}
        <div className="flex justify-start mb-6">
          <Link href="/">
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200 font-medium text-sm bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/20 px-4 py-2 rounded-xl"
            >
              <ArrowLeft size={16} />
              Back to Home
            </motion.button>
          </Link>
        </div>

        {/* Modern Neon Glow Header Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit mx-auto mb-4">
            <Leaf className="text-emerald-400 animate-pulse" size={26} />
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Active Eco Campaigns
          </h1>
          <p className="mt-4 text-sm text-emerald-400/60 uppercase tracking-widest font-bold max-w-2xl mx-auto">
            Discover community workgroups, connect with verified NGOs, and claim deployment operations.
          </p>
        </div>

        {/* Dynamic Context Empty Check Wrapper */}
        {campaigns.length === 0 ? (
          <div className="w-full max-w-xl mx-auto text-center py-16 bg-[#0d1e16] border border-white/10 rounded-[30px] shadow-2xl">
            <Building className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold tracking-wide text-white mb-2">No Active Operations Found</h3>
            <p className="text-emerald-400/60 text-sm px-8 leading-relaxed max-w-md mx-auto">
              There are currently no active workspace initiatives deployed to the public registry. Check back shortly.
            </p>
          </div>
        ) : (
          /* Responsive Adaptive Dashboard Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <div 
                key={campaign._id} 
                className="flex flex-col bg-[#0d1e16] rounded-[30px] border border-white/10 hover:border-emerald-500/30 shadow-2xl hover:shadow-emerald-950/40 transition-all duration-300 overflow-hidden group"
              >
                {/* Custom Nested Top Meta Header Block */}
                <div className="p-6 pb-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {campaign.ngoLogo ? (
                      <img 
                        src={campaign.ngoLogo} 
                        alt={campaign.ngoName || "NGO Workspace Logo"} 
                        className="w-10 h-10 rounded-xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Building className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors duration-300">
                        {campaign.ngoName || "Green Pulse Hub"}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-emerald-400/40 font-mono">
                        REF: {campaign.ngoId?.substring(0, 8) || "UNKNOWN"}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusBadgeStyles(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>

                {/* Core Context Display Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-white mb-3 line-clamp-2 leading-snug">
                      {campaign.title}
                    </h2>
                    
                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>

                  <div>
                    {/* Synchronized Custom Metadata Flex-Group */}
                    <div className="space-y-3 text-sm text-gray-300 mb-6 bg-black/40 border border-white/5 p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-emerald-400/70 flex-shrink-0" />
                        <span className="truncate text-xs font-medium tracking-wide">{campaign.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-emerald-400/70 flex-shrink-0" />
                        <span className="text-xs font-medium tracking-wide">
                          {campaign.date ? new Date(campaign.date).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Open Schedule"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-emerald-400/70 flex-shrink-0" />
                        <span className="text-xs font-medium tracking-wide">
                          <strong className="text-emerald-400 font-bold">{campaign.totalVolunteers || 0}</strong> Targeted Positions 
                          {campaign.volunteers && ` (${campaign.volunteers.length} Active)`}
                        </span>
                      </div>
                    </div>

                    {/* Submit Dispatch Action Button */}
                    <button
                      onClick={() => handleJoinClick(campaign._id)}
                      disabled={campaign.status === "completed"}
                      className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all duration-300 shadow-md ${
                        campaign.status === "completed"
                          ? "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white active:scale-[0.98] hover:shadow-emerald-950/50"
                      }`}
                    >
                      <span>{campaign.status === "completed" ? "Operation Terminated" : "Join Campaign Workspace"}</span>
                      {campaign.status !== "completed" && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}