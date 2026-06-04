"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/Hooks/Redux/store";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  Building2,
  Award,
  Trash2,
  Calendar,
  MapPin,
  PlusCircle,
  Loader2,
  Pencil,
  ShieldCheck,
  Mail,
  Phone,
  Layers,
  CheckCircle2,
  Check,
  XCircle,
  AlertCircle
} from "lucide-react";

import { cleaningCompanyService } from "../../../services/api";
import type { CleaningRequest, TeamMember } from "../../../Typescript/type";
import { socket } from "@/lib/socket";

export default function CleaningCompanyDashboard() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth) as { user: any };

  /* =========================================================
      OPTIMIZED FETCH DASHBOARD DATA WITH MEMOIZATION
  ========================================================= */
  const loadDashboard = useCallback(async () => {
    if (!user?._id) return;

    try {
      setError("");

      // OPTIMIZATION: Clean execution variables dispatched purely in parallel
      const profilePromise = cleaningCompanyService.getOwnCompanyProfile
        ? cleaningCompanyService.getOwnCompanyProfile()
        : cleaningCompanyService.getSingleCompany(user._id);

      const requestsPromise = cleaningCompanyService.getCompanyCleaningRequests
        ? cleaningCompanyService.getCompanyCleaningRequests()
        : Promise.resolve({ data: [] });

      const [companyRes, requestsRes] = await Promise.all([profilePromise, requestsPromise]);

      const companyData = companyRes?.data ?? companyRes ?? null;

      if (companyData) {
        setCompany(companyData);
        setTeam(companyData?.teamMembers ?? []);
        const requestsData = requestsRes?.data ?? requestsRes ?? [];
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      } else {
        setCompany(null);
        setRequests([]);
        setTeam([]);
      }
    } catch (err: any) {
      console.error("Dashboard load failed:", err);
      setError(err?.response?.data?.message || "Failed to load corporate operations dashboard.");
      toast.error("Failed to sync dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Handle initialization and context changes cleanly
  useEffect(() => {
    if (user?._id) {
      loadDashboard();
    }
  }, [user?._id, loadDashboard]);

  /* =========================================================
      SOCKET EVENT SUBSCRIPTIONS
  ========================================================= */
  useEffect(() => {
    // 1. Debug logger to capture EVERYTHING coming from the server
    const handleAnySocketEvent = (eventName: string, ...args: any[]) => {
      console.log(`📡 [Socket Global Debug] Received Event: "${eventName}" with data:`, args);
    };

    socket.onAny(handleAnySocketEvent);

    const handleIncomingTask = (data: any) => {
      console.log("🔔 Target Match Intercepted!", data);
      loadDashboard();
      toast.success("A new approved sanitation route has been added to your pipeline!");
    };

    socket.on("cleaning:approved", handleIncomingTask);
    socket.on("cleaning-request:approved", handleIncomingTask);

    return () => {
      socket.offAny(handleAnySocketEvent);
      socket.off("cleaning:approved", handleIncomingTask);
      socket.off("cleaning-request:approved", handleIncomingTask);
    };
  }, [loadDashboard]);
  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActioningId(requestId);
      await cleaningCompanyService.acceptCleaningRequest(requestId);
      toast.success("Sanitation ticket accepted successfully!");
      await loadDashboard();
    } catch (err: any) {
      console.error("Accept operation failed:", err);
      toast.error(err?.response?.data?.message || "Could not accept tracking route.");
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setActioningId(requestId);
      if (cleaningCompanyService.rejectCleaningRequest) {
        await cleaningCompanyService.rejectCleaningRequest(requestId);
      }
      toast.success("Sanitation ticket updated to rejected status.");
      await loadDashboard();
    } catch (err: any) {
      console.error("Reject operation failed:", err);
      toast.error(err?.response?.data?.message || "Could not decline routing context.");
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07130d] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-14 h-14 animate-spin text-emerald-400" />
          <h2 className="text-2xl font-bold tracking-wide animate-pulse">
            Loading Operations Dashboard...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div key={user?._id || "company-view"} className="min-h-screen bg-[#07130d] text-white">
      {/* HEADER */}
      <header className="mt-20 border-b border-white/10 bg-gradient-to-r from-emerald-950 via-[#0b2015] to-black px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
              <Briefcase className="text-emerald-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Green Pulse</h1>
              <p className="text-emerald-400 text-sm tracking-widest uppercase font-bold">
                Logistics Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <h3 className="font-bold">{company?.companyName || user?.name || "Industrial Agent"}</h3>
              <p className="text-sm text-gray-400">Waste Management & Cleaning</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400">
              {company?.companyName?.substring(0, 2).toUpperCase() || user?.name?.substring(0, 2).toUpperCase() || "CO"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-5 py-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* WORKSPACE PROTECTION LAYER */}
        {!company ? (
          <section className="rounded-[30px] border border-dashed border-emerald-500/30 bg-emerald-950/10 p-12 text-center flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Briefcase className="text-emerald-400" size={32} />
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-wide">
              Setup Your Corporate Workspace
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
              You haven't registered an environmental cleaning or waste management company for this account yet.
            </p>
            <Link href="/cleaning-company/create-company">
              <button className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white px-8 py-4 rounded-2xl font-black tracking-wide shadow-lg transition-all duration-300 flex items-center gap-2">
                <PlusCircle size={18} />
                Initialize Corporate Profile
              </button>
            </Link>
          </section>
        ) : (
          /* HERO BANNER */
          <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-r from-emerald-950 via-[#0b2015] to-black">
            {company?.coverImage?.url && (
              <div className="absolute inset-0 opacity-20">
                <Image
                  src={company.coverImage.url}
                  alt="Corporate Banner"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="relative p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-5xl font-black tracking-tight">
                      {company.companyName || "Company Name"}
                    </h2>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${company?.isApproved
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                      {company?.isApproved ? "Verified Agent" : "Approval Pending"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-5">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                      <MapPin size={16} className="text-emerald-400" />
                      <span className="text-sm font-medium">
                        {company.city ? `${company.city}, ${company.state || ""}` : "Location Config Pending"}
                      </span>
                    </div>

                    {company.licenseNumber && (
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold uppercase tracking-wide">
                        Lic: {company.licenseNumber}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 max-w-3xl">
                    <p className="text-gray-300 leading-relaxed text-[15px]">
                      {showFullAbout
                        ? company.about
                        : company.about?.slice(0, 220) +
                        (company.about?.length > 220 ? "..." : "")}
                    </p>

                    {company.about?.length > 220 && (
                      <button
                        onClick={() => setShowFullAbout(!showFullAbout)}
                        className="mt-4 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300 text-sm font-bold"
                      >
                        {showFullAbout ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full lg:w-auto min-w-[200px]">
                  <Link href={`/cleaning-company/edit/${company._id}`}>
                    <button className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-950/50">
                      <Pencil size={18} />
                      Edit Profile
                    </button>
                  </Link>

                  <Link href="/cleaning-company/create-company">
                    <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3">
                      <PlusCircle size={18} />
                      Add Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PERFORMANCE METRICS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0d1e16] border border-white/10 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-semibold">Active Crews</p>
                <h2 className="text-4xl font-black mt-2">{company?.workersCount ?? 0}</h2>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Layers />
              </div>
            </div>
          </div>

          <div className="bg-[#0d1e16] border border-white/10 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-semibold">Live Requests</p>
                <h2 className="text-4xl font-black mt-2">{requests.length}</h2>
              </div>
              <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Trash2 />
              </div>
            </div>
          </div>

          <div className="bg-[#0d1e16] border border-white/10 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-semibold">Operations Done</p>
                <h2 className="text-4xl font-black mt-2">{company?.completedProjects ?? 0}</h2>
              </div>
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CheckCircle2 />
              </div>
            </div>
          </div>

          <div className="bg-[#0d1e16] border border-white/10 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-semibold">Eco Points</p>
                <h2 className="text-4xl font-black mt-2">{company?.points ?? 0}</h2>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award />
              </div>
            </div>
          </div>
        </section>

        {/* LIVE DISPATCH PIPELINE */}
        <section className="bg-[#0d1e16] border border-white/10 rounded-3xl p-8 shadow-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight">Live Cleaning Pipeline</h2>
            <p className="text-gray-400 mt-2">Process and deploy localized ecological sanitations</p>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
              <Calendar className="mx-auto text-gray-500 mb-4" size={50} />
              <h3 className="text-2xl font-bold">No Operations Dispatched</h3>
              <p className="text-gray-400 mt-3">Your agency currently maps zero active sanitation assignments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((req) => {
                const isProcessing = actioningId === req._id;
                const currentStatus = req.status?.toLowerCase();

                return (
                  <div
                    key={req._id}
                    className="border border-white/10 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 bg-black/20 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">
                            Task Designation
                          </span>
                          <h3 className="text-2xl font-black mt-1">
                            {req.wasteType ? (Array.isArray(req.wasteType) ? req.wasteType.join(", ") : req.wasteType) : "Sanitation Duty"}
                          </h3>
                        </div>
                        <span className={`text-xs font-bold px-4 py-2 rounded-full capitalize border ${currentStatus === "accepted" || currentStatus === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : currentStatus === "rejected" || currentStatus === "declined"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                          {req.status}
                        </span>
                      </div>

                      {req.description && (
                        <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                          {req.description}
                        </p>
                      )}

                      <div className="mt-6 space-y-3 text-sm text-gray-400 border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={15} className="text-gray-500" />
                          <span className="truncate">{req.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/5">
                      <button
                        disabled={!!actioningId || currentStatus === "accepted" || currentStatus === "completed"}
                        onClick={() => handleAcceptRequest(req._id)}
                        className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm shadow-md transition-all"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                        {currentStatus === "accepted" ? "Accepted" : currentStatus === "completed" ? "Completed" : "Accept Task"}
                      </button>

                      <button
                        disabled={!!actioningId || currentStatus === "accepted" || currentStatus === "completed" || currentStatus === "rejected"}
                        onClick={() => handleRejectRequest(req._id)}
                        className="flex-1 min-w-[120px] bg-red-500/10 hover:bg-red-500/20 disabled:opacity-30 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm border border-red-500/20 transition-all"
                      >
                        <XCircle size={16} />
                        {currentStatus === "rejected" ? "Declined" : "Decline"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* HEADQUARTERS DETAILS */}
        <section className="bg-[#0d1e16] border border-white/10 p-8 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <Building2 className="text-emerald-400" />
            Corporate Headquarters Overview
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-gray-300">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Verification Routing Email</p>
                  <p className="text-white font-medium mt-1">
                    {company?.userId?.email || user?.email || "No verified user email populated"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Hotline Terminal Connection</p>
                  <p className="text-white font-medium mt-1">{company?.phone || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">HQ Corporate Address</p>
                  <p className="text-white font-medium mt-1">
                    {company?.address ? `${company.address}, ${company?.city || ""}, ${company?.state || ""}` : "Address Pending"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Government License Key</p>
                  <p className="text-white font-mono font-medium mt-1">{company?.licenseNumber || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">System Genesis Date</p>
                  <p className="text-white font-medium mt-1">
                    {company?.createdAt ? new Date(company.createdAt).toLocaleDateString("en-GB") : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
