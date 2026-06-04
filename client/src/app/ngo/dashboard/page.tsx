"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/Hooks/Redux/store";
import { toast } from "react-hot-toast";

import {
  Leaf,
  Building2,
  Users,
  Award,
  Trash2,
  Calendar,
  MapPin,
  PlusCircle,
  Loader2,
  Pencil,
  Mail,
  Phone,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";

import {
  ngoService,
  cleaningRequestsService,
  badgeService,
  certificateService,
} from "../../../services/api";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: string;
  volunteers: string[];
  ngoId?: string | { _id: string };
  createdBy?: string | { _id: string };
}

export default function NGODashboard() {
  const [loading, setLoading] = useState(true);
  const [ngo, setNgo] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [cleaningRequests, setCleaningRequests] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [error, setError] = useState("");

  const { user } = useSelector((state: RootState) => state.auth) as { user: any };

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        setError("");

        const [ngoResponse, cleaningResponse, badgeResponse, certificateResponse, campaignResponse] = await Promise.all([
          ngoService.getMyNgo(),
          cleaningRequestsService.getOwnCleaningRequests(),
          badgeService.viewBadges(),
          certificateService.viewCertificates(),
          ngoService.getOwnCampaigns(), 
        ]);

        const ngoData = ngoResponse?.data ?? ngoResponse ?? null;

        if (ngoData) {
          setNgo(ngoData);
          const currentNgoId = String(ngoData._id);
          const currentUserId = String(user._id);

          const rawCampaigns = campaignResponse?.data ?? campaignResponse ?? [];
          
          if (Array.isArray(rawCampaigns)) {
            const filteredCampaigns = rawCampaigns.filter((camp: any) => {
              if (!camp || !camp._id || !camp.title) return false;

              const campNgoId = camp.ngoId?._id
                ? String(camp.ngoId._id)
                : camp.ngoId
                  ? String(camp.ngoId)
                  : null;

              const campCreatorId = camp.createdBy?._id
                ? String(camp.createdBy._id)
                : camp.createdBy
                  ? String(camp.createdBy)
                  : null;

              const matchesNgo = campNgoId && campNgoId === currentNgoId;
              const matchesCreator = campCreatorId && campCreatorId === currentUserId;

              return matchesNgo || matchesCreator;
            });

            setCampaigns(filteredCampaigns);
          } else {
            setCampaigns([]);
          }

          /* CLEANING PIPELINE */
          const cleaningData = cleaningResponse?.data ?? cleaningResponse ?? [];
          setCleaningRequests(Array.isArray(cleaningData) ? cleaningData : []);

          /* BADGES ARCHIVE */
          const badgeData = badgeResponse?.data ?? badgeResponse ?? [];
          setBadges(Array.isArray(badgeData) ? badgeData : []);

          /* CERTIFICATES */
          const certificateData = certificateResponse?.data ?? certificateResponse ?? [];
          setCertificates(Array.isArray(certificateData) ? certificateData : []);
        } else {
          setNgo(null);
          setCampaigns([]);
          setCleaningRequests([]);
          setBadges([]);
          setCertificates([]);
        }

      } catch (err: any) {
        console.error("NGO Dashboard sync failure error:", err);
        setError(err?.response?.data?.message || "Failed to load fresh NGO workspace data.");
        toast.error("Failed to sync up-to-date dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-black to-emerald-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-14 h-14 animate-spin text-emerald-400" />
          <h2 className="text-2xl font-bold tracking-wide">Loading NGO Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div key={user?._id || "ngo-view"} className="min-h-screen bg-[#07130d] text-white">
      <header className="mt-20 border-b border-white/10 bg-gradient-to-r from-emerald-950 via-[#0b2015] to-black px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
              <Leaf className="text-emerald-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black">Green Pulse</h1>
              <p className="text-emerald-400 text-sm tracking-widest uppercase font-bold">NGO Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <h3 className="font-bold">{ngo?.ngoName || user?.name || "NGO"}</h3>
              <p className="text-sm text-gray-400">Environmental Organization</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400">
              {ngo?.ngoName?.substring(0, 2).toUpperCase() || user?.name?.substring(0, 2).toUpperCase() || "NG"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-5 py-4 rounded-2xl">
            {error}
          </div>
        )}

        {!ngo ? (
          <section className="rounded-[30px] border border-dashed border-emerald-500/30 bg-emerald-950/10 p-12 text-center flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Leaf className="text-emerald-400" size={32} />
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-wide">Setup Your NGO Workspace</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
              You haven't registered an environmental organization for this account yet.
              Initialize your profile to deploy local cleanup campaigns, assign volunteer badges, and track community impacts.
            </p>
            <Link href="/ngo/create-ngo">
              <button className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white px-8 py-4 rounded-2xl font-black tracking-wide shadow-lg transition-all duration-300 flex items-center gap-2">
                <PlusCircle size={18} />
                Initialize NGO Profile
              </button>
            </Link>
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-r from-emerald-950 via-[#0b2015] to-black">
            {ngo?.coverImage?.url && (
              <div className="absolute inset-0 opacity-20">
                <Image
                  src={ngo.coverImage.url}
                  alt="NGO Banner"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="relative p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                  <h2 className="text-5xl font-black">{ngo.ngoName || "NGO Name"}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-5">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                      <MapPin size={16} className="text-emerald-400" />
                      <span className="text-sm font-medium">
                        {ngo.location || `${ngo.city || ""}, ${ngo.country || ""}`}
                      </span>
                    </div>

                    {ngo.ngoType && (
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold capitalize">
                        {ngo.ngoType}
                      </div>
                    )}

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      <Users size={16} />
                      <span className="text-sm font-medium">
                        {(ngo?.members?.children || 0) +
                          (ngo?.members?.adults || 0) +
                          (ngo?.members?.elders || 0)}{" "}
                        Members
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 max-w-3xl">
                    <p className="text-gray-300 leading-relaxed text-[15px]">
                      {showFullAbout
                        ? ngo.about
                        : ngo.about?.slice(0, 220) + (ngo.about?.length > 220 ? "..." : "")}
                    </p>
                    {ngo.about?.length > 220 && (
                      <button
                        onClick={() => setShowFullAbout(!showFullAbout)}
                        className="mt-4 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300 text-sm font-bold"
                      >
                        {showFullAbout ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  <Link href={`/ngo/edit/${ngo._id}`}>
                    <button className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3">
                      <Pencil size={18} />
                      Edit Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Grid Dashboard Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0d1e16] border border-white/10 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-semibold">Campaigns</p>
                <h2 className="text-4xl font-black mt-2">{campaigns.length}</h2>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400">
                <Calendar />
              </div>
            </div>
          </div>

          <div className="bg-[#0d1e16] border border-white/10 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-semibold">Cleaning Requests</p>
                <h2 className="text-4xl font-black mt-2">{cleaningRequests.length}</h2>
              </div>
              <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-400">
                <Trash2 />
              </div>
            </div>
          </div>

          <div className="bg-[#0d1e16] border border-white/10 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-semibold">Badges</p>
                <h2 className="text-4xl font-black mt-2">{badges.length}</h2>
              </div>
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400">
                <Award />
              </div>
            </div>
          </div>

          <div className="bg-[#0d1e16] border border-white/10 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-semibold">Volunteers</p>
                <h2 className="text-4xl font-black mt-2">
                  {(ngo?.members?.children || 0) +
                    (ngo?.members?.adults || 0) +
                    (ngo?.members?.elders || 0)}
                </h2>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Users />
              </div>
            </div>
          </div>
        </section>

        {/* CAMPAIGNS CONTAINER */}
        <section className="bg-[#0d1e16] border border-white/10 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black">Campaigns</h2>
              <p className="text-gray-400 mt-2">Manage environmental activities</p>
            </div>
            {ngo && (
              <Link href="/ngo/create-campaign">
                <button className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white px-5 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-md">
                  <PlusCircle size={18} />
                  Create Campaign
                </button>
              </Link>
            )}
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
              <Calendar className="mx-auto text-gray-500 mb-4" size={50} />
              <h3 className="text-2xl font-bold">No Active Campaigns</h3>
              <p className="text-gray-400 mt-3">Start your first environmental mission or verify MongoDB data connectivity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((campaign) => {
                const status = (campaign?.status || "pending").toLowerCase();

                return (
                  <div
                    key={campaign._id}
                    className="border border-white/10 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 bg-black/20 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-2xl font-black line-clamp-2">{campaign.title}</h3>

                        {status === "pending" && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black tracking-wide uppercase shrink-0">
                            <Clock size={12} />
                            Pending Approval
                          </span>
                        )}

                        {status === "upcoming" && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-black tracking-wide uppercase shrink-0">
                            <Calendar size={12} />
                            Approved / Upcoming
                          </span>
                        )}

                        {status === "ongoing" && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wide uppercase shrink-0 animate-pulse">
                            <Leaf size={12} />
                            Live / Ongoing
                          </span>
                        )}

                        {status === "completed" && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-500/10 border border-white/10 text-gray-400 text-xs font-black tracking-wide uppercase shrink-0">
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        )}
                      </div>

                      <p className="text-gray-400 mt-2 text-sm leading-relaxed line-clamp-3">
                        {campaign.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-xs text-gray-400">
                      {campaign.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-emerald-500/70" />
                          <span className="truncate">{campaign.location}</span>
                        </div>
                      )}
                      {campaign.date && (
                        <div className="flex items-center gap-2 justify-end">
                          <Calendar size={14} className="text-emerald-500/70" />
                          <span>Target: {new Date(campaign.date).toLocaleDateString("en-GB")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CLEANING REQUESTS CONTAINER */}
        <section className="bg-[#0d1e16] border border-white/10 rounded-3xl p-8 shadow-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-black">Cleaning Requests</h2>
            <p className="text-gray-400 mt-2">Track current environmental disposal and restoration request pipelines</p>
          </div>

          {cleaningRequests.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
              <Trash2 className="mx-auto text-gray-500 mb-4" size={50} />
              <h3 className="text-2xl font-bold">No Requests Posted</h3>
              <p className="text-gray-400 mt-3">Your workspace has not issued or synced community requests yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cleaningRequests.map((request) => {
                const status = (request?.status || "pending").toLowerCase();
                const isAccepted = status === "accepted" || status === "approved";

                return (
                  <div
                    key={request._id}
                    className="flex flex-col justify-between border border-white/10 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 bg-black/20 relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-black line-clamp-2">
                          {request.title || "Waste Disposal Request"}
                        </h3>

                        {isAccepted ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wide uppercase shrink-0">
                            <CheckCircle2 size={12} />
                            Accepted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black tracking-wide uppercase shrink-0">
                            <Clock size={12} />
                            Pending
                          </span>
                        )}
                      </div>

                      {request.description && (
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                          {request.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-xs text-gray-400">
                      {request.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-emerald-500/70" />
                          <span className="truncate">{request.location}</span>
                        </div>
                      )}
                      {request.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-emerald-500/70" />
                          <span>Logged: {new Date(request.createdAt).toLocaleDateString("en-GB")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* NGO HEADQUARTERS DETAILS */}
        {ngo && (
          <section className="bg-[#0d1e16] border border-white/10 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Building2 className="text-emerald-400" />
              NGO Headquarters Overview
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-gray-300">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Registered Email</p>
                    <p className="text-white font-medium mt-1">
                      {ngo?.userId?.email || user?.email || "No verified email populated"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Contact Hotline</p>
                    <p className="text-white font-medium mt-1">{ngo?.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Registration ID / License</p>
                    <p className="text-white font-mono font-medium mt-1">{ngo?.registrationNumber || ngo?._id || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Workspace Genesis Date</p>
                    <p className="text-white font-medium mt-1">
                      {ngo?.createdAt ? new Date(ngo.createdAt).toLocaleDateString("en-GB") : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}