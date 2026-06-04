"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../Hooks/Redux/store"; 
import { fetchAllCompanies, toggleCompanyApproval } from "../../../Hooks/Redux/Slices/adminSlice"; 
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  Award,
  Loader2,
  FileText,
  Clock,
} from "lucide-react";

// Explicitly matching your backend/Redux CleaningCompany schema type model
interface CleaningCompany {
  _id: string;
  companyName: string;
  ownerName?: string;
  about?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  licenseNumber?: string;
  workersCount?: number;
  experienceYears?: number;
  completedProjects?: number;
  isApproved: boolean;
  points?: number;
  coverImage?: { url: string };
}

export default function AdminCleaningCompanies() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Explicitly typing the useSelector state to match the strict type model
  const companies = useSelector((state: RootState) => state.admin.companies as CleaningCompany[]);
  const loading = useSelector((state: RootState) => state.admin.loading);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllCompanies());
  }, [dispatch]);

  // Handle Action: Toggle Approval state cleanly 
  const handleToggleApproval = async (companyId: string, currentApprovalStatus: boolean) => {
    if (!companyId) {
      console.error("Pipeline failure: companyId is missing or undefined.");
      return;
    }

    setUpdatingId(companyId);
    try {
      const nextApprovalState = !currentApprovalStatus;
      
      // Dispatch payload to Redux slice
      await dispatch(
        toggleCompanyApproval({ companyId: companyId, isApproved: nextApprovalState })
      ).unwrap();
    } catch (error) {
      console.error("Action handler pipeline failure sequence across service runtime:", error);
    } finally {
      setUpdatingId(null);
    }
  };

// ✅ Fixed line
const totalCompanies = companies.length;
  const pendingApprovals = companies.filter((c) => !c.isApproved).length;
  const totalGlobalProjects = companies.reduce((acc, c) => acc + (c.completedProjects || 0), 0);

  if (loading && companies.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-emerald-400 bg-[#07130d]">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130d] text-white p-6">
      
      {/* HEADER */}
      <h1 className="text-3xl font-black mb-6 flex items-center gap-2">
        <Building2 className="text-emerald-400" />
        Cleaning Company Management
      </h1>

      {/* STATS CARDS GRID */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0d1e16] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Total Companies</p>
            <h3 className="text-2xl font-black mt-0.5">{totalCompanies}</h3>
          </div>
        </div>

        <div className="bg-[#0d1e16] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-black mt-0.5">{pendingApprovals}</h3>
          </div>
        </div>

        <div className="bg-[#0d1e16] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Total Jobs Done</p>
            <h3 className="text-2xl font-black mt-0.5">{totalGlobalProjects}</h3>
          </div>
        </div>
      </div>

      {/* COMPANIES GRID */}
      {companies.length === 0 ? (
        <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-10 text-center">
          <Building2 className="mx-auto text-gray-500 w-14 h-14 mb-4" />
          <h2 className="text-2xl font-bold">No Cleaning Companies Registered</h2>
          <p className="text-gray-400 mt-2">Active records will propagate automatically upon user profile registration.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#0d1e16] border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {c.coverImage?.url ? (
                  <div className="h-32 w-full overflow-hidden relative">
                    <img src={c.coverImage.url} alt={c.companyName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1e16] to-transparent" />
                  </div>
                ) : (
                  <div className="h-4 bg-gradient-to-r from-emerald-900/20 to-transparent" />
                )}

                <div className="p-5 pt-3">
                  <h2 className="text-xl font-bold tracking-tight">{c.companyName}</h2>
                  
                  {c.ownerName && (
                    <p className="text-xs text-emerald-400/80 mt-0.5">Owned by {c.ownerName}</p>
                  )}
                  
                  <p className="text-gray-400 text-sm mt-2 line-clamp-3">{c.about || "No organizational breakdown summary available."}</p>

                  <div className="mt-4 space-y-2 text-sm text-gray-300 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">{c.address || "N/A"}, {c.city || ""}, {c.state || ""}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      <span>{c.phone || "No contact line info"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <span>LN: <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs">{c.licenseNumber || "Unspecified"}</code></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400 shrink-0" />
                      <span>{c.workersCount || 0} Active Staffers Members</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-gray-400 shrink-0" />
                      <span>{c.experienceYears || 0} Years Exp • {c.completedProjects || 0} Projects</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        c.isApproved
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {c.isApproved ? "Approved Account" : "Pending Verification"}
                    </span>
                    
                    {c.points !== undefined && c.points > 0 && (
                      <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold">
                        ★ {c.points} pts
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 mt-2">
                <button
                  onClick={() => handleToggleApproval(c._id, c.isApproved)}
                  disabled={updatingId === c._id}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    updatingId === c._id
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : c.isApproved
                      ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                      : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/10"
                  }`}
                >
                  {updatingId === c._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : c.isApproved ? (
                    <>
                      <XCircle size={16} /> Revoke Approval
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Approve Company
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}