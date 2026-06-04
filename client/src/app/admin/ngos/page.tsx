"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import {
  Building2,
  MapPin,
  Award,
  FileCheck,
  Users,
  Leaf,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  ShieldCheck,
  Sparkles,
  Search,
  Crown,
  Star,
} from "lucide-react";
import { badgeService, adminService } from "@/services/api"; 

interface Badge {
  _id: string;
  badgeName: "Good" | "Excellent" | "Elite";
  badgeColor?: string;
}

interface NGO {
  _id: string;
  ngoName: string;
  about: string;
  city: string;
  country: string;
  address: string;

  coverImage?: {
    url?: string;
  };

  badges?: Badge[];

  rewards?: any[];
  certificates?: any[];
  campaignsJoined?: any[];
  cleaningRequests?: any[];

  inaugurationDate?: string;

  members?: {
    children?: number;
    adults?: number;
    elders?: number;
  };

  ngoType?: string[];

  isApproved?: boolean;

  createdAt?: string;
}

export default function AdminNGOs() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // FETCH NGOs
  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      const res = await adminService.getAllNgos();
      setNgos(res.data || []);
    } catch (error) {
      console.error("NGO fetch failed:", error);
      toast.error("Failed to load global NGO metrics data.");
      setNgos([]);
    } finally {
      setLoading(false);
    }
  };

  const ngoTypes = useMemo(() => {
    return [
      ...new Set(
        ngos.flatMap((ngo) => ngo.ngoType || [])
      ),
    ];
  }, [ngos]);

  // SEARCH FILTER
  const filteredNGOs = useMemo(() => {
    return ngos.filter((ngo) => {
      const searchText = search.toLowerCase().trim();

      const ngoTypeMatch = ngo.ngoType?.some((type) =>
        type.toLowerCase().includes(searchText)
      );

      const badgeMatch = ngo.badges?.some((badge) =>
        badge.badgeName?.toLowerCase().includes(searchText)
      );

      const matchesSearch =
        ngo.ngoName?.toLowerCase().includes(searchText) ||
        ngo.city?.toLowerCase().includes(searchText) ||
        ngo.country?.toLowerCase().includes(searchText) ||
        ngo.about?.toLowerCase().includes(searchText) ||
        ngoTypeMatch ||
        badgeMatch;

      const matchesType =
        !selectedType ||
        ngo.ngoType?.includes(selectedType);

      return matchesSearch && matchesType;
    });
  }, [ngos, search, selectedType]);

  // UPDATE BADGE
  const handleBadgeChange = async (
    ngoId: string,
    badgeName: "Good" | "Excellent" | "Elite"
  ) => {
    const loadingToast = toast.loading("Assigning badge ecosystem metrics...");
    try {
      await badgeService.updateNgoBadge(ngoId, {
        badgeName,
      });
      toast.success(`Badge updated successfully to ${badgeName}!`, { id: loadingToast });
      fetchNGOs(); 
    } catch (error) {
      console.error("Badge assignment failed:", error);
      toast.error("Failed to update badge allocation properties.", { id: loadingToast });
    }
  };

  // HANDLER: APPROVE / RE-APPROVE NGO DIRECTLY FROM DASHBOARD CARD
  const handleApproveNgo = async (ngoId: string, ngoName: string, isAlreadyApproved: boolean) => {
    // Elegant promise-based confirmation stream using react-hot-toast
    toast((t) => (
      <div className="flex flex-col gap-2 text-sm">
        <p className="font-medium text-gray-900">
          {isAlreadyApproved 
            ? `Are you sure you want to re-approve ${ngoName}?` 
            : `Approve streaming pipeline credentials for ${ngoName}?`}
        </p>
        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const processingToast = toast.loading(`Processing approval for ${ngoName}...`);
              try {
                await adminService.approveNgo(ngoId);
                toast.success(`${ngoName} has been fully approved!`, { id: processingToast });
                fetchNGOs();
              } catch (error) {
                console.error("NGO Approval process failed:", error);
                toast.error("Failed to securely complete authorization.", { id: processingToast });
              }
            }}
            className="px-2.5 py-1 text-xs bg-emerald-600 text-white font-medium hover:bg-emerald-700 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    ), { duration: 5000, position: "top-center" });
  };

  // BADGE UI
  const renderBadge = (badge?: string) => {
    switch (badge?.toLowerCase()) {
      case "good":
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold">
            <Star size={13} />
            Good NGO
          </div>
        );

      case "excellent":
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Star size={13} />
            Excellent NGO
          </div>
        );

      case "elite":
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-xs font-semibold">
            <Crown size={13} />
            Elite NGO
          </div>
        );

      default:
        return (
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
            No Badge
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07130d] flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130d] text-white p-6">
      {/* Toast provider instantiation wrapper setup */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-10">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3">
            <Building2 className="text-emerald-400 w-10 h-10" />
            NGO Management
          </h1>

          <p className="text-gray-400 mt-2">
            Manage NGO approvals, campaigns, rewards, and badge systems.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative w-full lg:w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

            <input
              type="text"
              placeholder="Search NGO, badge, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1e16] border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          {/* NGO Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#0d1e16] border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All NGO Types</option>

            {ngoTypes.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredNGOs.length === 0 ? (
        <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-10 text-center">
          <Building2 className="mx-auto text-gray-500 w-14 h-14 mb-4" />
          <h2 className="text-2xl font-bold">No NGOs Found</h2>
          <p className="text-gray-400 mt-2">Try another search keyword.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
          {filteredNGOs.map((ngo, i) => {
            const totalMembers =
              (ngo.members?.children || 0) +
              (ngo.members?.adults || 0) +
              (ngo.members?.elders || 0);

            const currentBadge = ngo.badges?.[0]?.badgeName;

            return (
              <motion.div
                key={ngo._id || i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1e16]"
              >
                {/* COVER IMAGE */}
                <div className="relative h-52">
                  <Image
                    src={
                      ngo.coverImage?.url ||
                      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                    }
                    alt={ngo.ngoName}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  {/* APPROVAL STATUS BUTTON INTERACTION */}
                  <div className="absolute top-4 right-4">
                    {ngo.isApproved ? (
                      <button 
                        onClick={() => handleApproveNgo(ngo._id, ngo.ngoName, true)}
                        className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors backdrop-blur-md border border-emerald-400/30 px-3 py-1 rounded-full text-xs text-emerald-300 cursor-pointer font-medium"
                        title="Click to Re-Approve NGO"
                      >
                        <CheckCircle2 size={14} />
                        Approved (Click to Re-approve)
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApproveNgo(ngo._id, ngo.ngoName, false)}
                        className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/40 transition-colors backdrop-blur-md border border-yellow-400/30 px-3 py-1 rounded-full text-xs text-yellow-300 cursor-pointer font-medium"
                        title="Click to Approve NGO"
                      >
                        <XCircle size={14} />
                        Pending Approval
                      </button>
                    )}
                  </div>

                  {/* NGO HEADER INFO */}
                  <div className="absolute bottom-4 left-4">
                    <h2 className="text-2xl font-black flex items-center gap-2">
                      <Leaf className="text-emerald-400" />
                      {ngo.ngoName}
                    </h2>

                    <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                      <MapPin size={14} />
                      {ngo.city}, {ngo.country}
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  {/* ABOUT */}
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {ngo.about || "No description available."}
                  </p>

                  {/* NGO TYPES */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ngo.ngoType?.map((type, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 capitalize"
                      >
                        {type.replace("_", " ")}
                      </span>
                    ))}
                  </div>

                  {/* BADGE SYSTEM */}
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold mb-3 text-gray-300">
                      NGO Badge
                    </h3>

                    <div className="flex items-center gap-3 flex-wrap">
                      {renderBadge(currentBadge)}

                      <select
                        value={currentBadge || ""}
                        onChange={(e) =>
                          handleBadgeChange(
                            ngo._id,
                            e.target.value as "Good" | "Excellent" | "Elite"
                          )
                        }
                        className="bg-[#13271d] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="">Select Badge</option>
                        <option value="Good">Good</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Elite">Elite</option>
                      </select>
                    </div>
                  </div>

                  {/* STATS MATRIX */}
                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-[#13271d] rounded-2xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Users size={14} />
                        Members
                      </div>
                      <h3 className="text-xl font-bold mt-1">{totalMembers}</h3>
                    </div>

                    <div className="bg-[#13271d] rounded-2xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Sparkles size={14} />
                        Campaigns
                      </div>
                      <h3 className="text-xl font-bold mt-1">
                        {ngo.campaignsJoined?.length || 0}
                      </h3>
                    </div>

                    <div className="bg-[#13271d] rounded-2xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Award size={14} />
                        Rewards
                      </div>
                      <h3 className="text-xl font-bold mt-1">
                        {ngo.rewards?.length || 0}
                      </h3>
                    </div>

                    <div className="bg-[#13271d] rounded-2xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <FileCheck size={14} />
                        Certificates
                      </div>
                      <h3 className="text-xl font-bold mt-1">
                        {ngo.certificates?.length || 0}
                      </h3>
                    </div>
                  </div>

                  {/* EXTRA DETAILS */}
                  <div className="mt-5 space-y-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      Cleaning Requests:
                      <span className="font-semibold text-white">
                        {ngo.cleaningRequests?.length || 0}
                      </span>
                    </div>

                    {ngo.inaugurationDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-emerald-400" />
                        Since{" "}
                        {new Date(ngo.inaugurationDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* ADDRESS BOX */}
                  <div className="mt-5 p-3 rounded-2xl bg-[#13271d] border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-sm text-gray-300">
                      {ngo.address || "No address provided"}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}