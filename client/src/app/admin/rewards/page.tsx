"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Building2,
  Search,
  Loader2,
  Award,
  AlertCircle,
} from "lucide-react";

import { ngoService } from "../../../services/api";

interface NgoItem {
  _id: string;
  ngoName: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  ngoType?: string[]; // Note: this is an array of strings in your JSON
  location?: string;  // If you map city to location
  city?: string;
  members?: {
    children: number;
    adults: number;
    elders: number;
  };
  campaignsJoined?: any[];
  badges?: Array<{
    badgeName: string;
    badgeColor?: string;
  }>;
}

export default function AdminGovtRewards() {
  const [ngos, setNgos] = useState<NgoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadNgos() {
    try {
      setLoading(true);
      
      // Updated from getAllNgos() to getAllNgo() based on your service type definition
      const res = await ngoService.getAllNgo();
      
      const data = res?.ngos || res?.data || [];
      setNgos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load NGOs from slice", error);
      setNgos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNgos();
  }, []);

const filteredNgos = ngos.filter((ngo) =>
  [
    ngo.ngoName,
    ngo.userId?.email,            // Fixed: reading from nested userId object
    ngo.city,                     // Fixed: matching city string instead of location
    ngo.ngoType?.join(" "),       // Fixed: combining type array items into a string
    ngo.badges?.[0]?.badgeName,   // Fixed: reading badgeName from the first array item
  ]
    .join(" ")
    .toLowerCase()
    .includes(search.toLowerCase())
);

  const totalNgos = ngos.length;
//  Updated code
const rewardedNgos = ngos.filter((n) => n.badges && n.badges.length > 0).length;

  const handleAddReward = (ngo: NgoItem) => {
    console.log("Add Reward To:", ngo);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07130d] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130d] text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Gift className="text-yellow-400 w-8 h-8" />
        <h1 className="text-3xl font-black">
          Government Rewards Management
        </h1>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <div className="bg-[#0d1e16] rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10">
            <Building2 className="text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total NGOs</p>
            <h3 className="text-3xl font-black">{totalNgos}</h3>
          </div>
        </div>

        <div className="bg-[#0d1e16] rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-500/10">
            <Award className="text-yellow-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Rewarded NGOs</p>
            <h3 className="text-3xl font-black">{rewardedNgos}</h3>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-3 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search NGO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0d1e16] border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500"
        />
      </div>

      {/* Grid Content / Empty State */}
      {filteredNgos.length === 0 ? (
        <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-500" size={50} />
          <h2 className="text-2xl font-bold">No NGOs Found</h2>
          <p className="text-gray-400 mt-2">No NGO matches your search.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNgos.map((ngo, index) => (
            <motion.div
              key={ngo._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#0d1e16] border border-white/10 rounded-3xl p-5"
            >
           <div className="space-y-3">
  <h2 className="text-xl font-bold truncate">{ngo.ngoName}</h2>
  {/* 1. Fixed Email Path */}
  <p className="text-sm text-gray-400 truncate">{ngo.userId?.email || "No Email"}</p>

  <div className="space-y-1 pt-2 border-t border-white/5">
    {/* 2. Fixed Location Path (Using city field from JSON) */}
    <p className="text-sm">
      <span className="text-gray-400">Location:</span> {ngo.city || "N/A"}
    </p>

    {/* 3. Fixed Type Path (Joining the string array) */}
    <p className="text-sm">
      <span className="text-gray-400">Type:</span> {ngo.ngoType?.join(", ") || "N/A"}
    </p>

    {/* 4. Fixed Badge Display */}
  {/* Current Badge Display */}
<div className="flex items-center gap-2 text-sm">
  <span className="text-gray-400">Current Badge:</span>{" "}
  {ngo.badges && ngo.badges.length > 0 ? (
    <span 
      className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
      style={{ 
        // Use the backend color for a subtle background tint
        backgroundColor: `${ngo.badges[0].badgeColor || "#059669"}20`, // Added '20' at the end for 12% opacity
        // Force the text to be a bright color or match the border tint
        color: ngo.badges[0].badgeColor === "#000000" ? "#fbbf24" : ngo.badges[0].badgeColor || "#fbbf24",
        border: `1px solid ${ngo.badges[0].badgeColor || "#fbbf24"}40`
      }}
    >
      {ngo.badges[0].badgeName}
    </span>
  ) : (
    <span className="text-gray-500 italic text-xs">None</span>
  )}
</div>
    {/* 5. Fixed Campaigns Path (Checking array length) */}
    <p className="text-sm">
      <span className="text-gray-400">Campaigns:</span> {ngo.campaignsJoined?.length || 0}
    </p>

    {/* 6. Fixed Volunteers / Members Display */}
    <p className="text-sm">
      <span className="text-gray-400">Total Members:</span>{" "}
      {ngo.members ? (ngo.members.children + ngo.members.adults + ngo.members.elders) : 0}
    </p>
  </div>

  <button
    onClick={() => handleAddReward(ngo)}
    className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition-colors"
  >
    Add Reward
  </button>
</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}