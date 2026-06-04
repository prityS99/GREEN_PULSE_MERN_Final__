"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    Building2,
    Leaf,
    Users,
    FileCheck,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Loader2,
    BadgeCheck,
    MapPin,
    Calendar,
} from "lucide-react";

import { adminService, ngoService } from "../../../services/api";

type TabType =
    | "ngos"
    | "companies"
    | "campaigns"
    | "requests"
    | "certificates";

export default function ApprovalsPage() {
    const [tab, setTab] = useState<TabType>("ngos");
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    const [ngos, setNgos] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [certs, setCerts] = useState<any[]>([]);

    // POPULATE ALL DATA CHANNELS ON COMPONENT MOUNT
    async function fetchAllApprovalsData() {
        try {
            setLoading(true);

            // Trigger data fetches concurrently to maximize layout streaming performance
            const [ngoRes, companyRes, campaignRes, activitiesRes] = await Promise.all([
                ngoService.getAllNgo(),
                adminService.viewAllCompanies(),
                adminService.getAllCampaigns(),
                adminService.viewGlobalActivities(), // Outgoing registry channel for requests metrics
            ]);

            setNgos(ngoRes?.data || ngoRes?.ngos || ngoRes || []);
            setCompanies(companyRes?.companies || companyRes?.data || companyRes || []);
            setCampaigns(campaignRes?.data || campaignRes?.campaigns || campaignRes || []);
            setRequests(activitiesRes?.cleaningRequests || activitiesRes?.data || activitiesRes || []);
            setCerts([]); // Place for supplemental government compliance certifications registry
        } catch (err) {
            console.error("Centralized dashboard approval pipelines aggregation failure:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAllApprovalsData();
    }, []);

    // MAIN PIPELINE APPROVAL DISPATCH HANDLER
    async function approve(type: TabType, id: string) {
        setActionId(id);
        try {
            // 🌿 NGO APPROVAL
            if (type === "ngos") {
                await adminService.approveNgo(id);
                setNgos((prev) =>
                    prev.map((n) => (n._id === id ? { ...n, isApproved: true } : n))
                );
            }

            // 🏢 CLEANING COMPANIES APPROVAL
            if (type === "companies") {
                // FIXED: Integrated our standard boolean toggle configuration cleanly here
                await adminService.toggleCompanyApproval(id, true);
                setCompanies((prev) =>
                    prev.map((c) => (c._id === id ? { ...c, isApproved: true } : c))
                );
            }

            // 📢 CAMPAIGNS APPROVAL
            if (type === "campaigns") {
                await adminService.approveCampaign(id);
                setCampaigns((prev) =>
                    prev.map((c) => (c._id === id ? { ...c, status: "approved" } : c))
                );
            }

            // 📋 CLEANING REQUESTS APPROVAL
            if (type === "requests") {
                await adminService.approveCleaningRequest(id);
                setRequests((prev) =>
                    prev.map((r) => (r._id === id ? { ...r, status: "approved" } : r))
                );
            }

            // 🎓 GOVT COMPLIANCE CERTIFICATES APPROVAL
            if (type === "certificates") {
                await adminService.approveCertificate(id);
                setCerts((prev) =>
                    prev.map((c) => (c._id === id ? { ...c, isApproved: true } : c))
                );
            }
        } catch (err) {
            console.error(`Approval workflow pipeline failure on tab action execution [${type}]:`, err);
        } finally {
            setActionId(null);
        }
    }

    const tabs = [
        { key: "ngos", label: "NGOs", icon: Leaf },
        { key: "companies", label: "Cleaning Companies", icon: Building2 },
        { key: "campaigns", label: "Campaigns", icon: Users },
        { key: "requests", label: "Cleaning Requests", icon: ClipboardList },
        { key: "certificates", label: "Govt Certificates", icon: FileCheck },
    ];

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-emerald-400 bg-[#07130d]">
                <Loader2 className="animate-spin w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#07130d] text-white p-6">
            
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-emerald-400" />
                <h1 className="text-3xl font-black">Central Operations Board</h1>
            </div>

            {/* NAVIGATION TABS SECTION BAR */}
            <div className="flex flex-wrap gap-3 mb-8">
                {tabs.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key as TabType)}
                            className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold border cursor-pointer transition-all duration-150
                                ${tab === t.key
                                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/5"
                                    : "border-white/5 bg-[#0d1e16]/40 text-gray-400 hover:text-white"
                                }`}
                        >
                            <Icon size={14} />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* ITERATION GRID LAYOUT VIEWS CONTROLLER */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. NGOS RENDER INTERFACE PANEL */}
                {tab === "ngos" && (ngos.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">No NGOs awaiting registry checks.</div>
                ) : (
                    ngos.map((ngo) => (
                        <motion.div
                            key={ngo._id}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[#0d1e16] border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:border-emerald-400/20 flex flex-col justify-between"
                        >
                            <div>
                                <div className="relative h-40 w-full overflow-hidden">
                                    <img
                                        src={ngo.coverImage || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac"}
                                        alt={ngo.ngoName}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1e16] to-transparent" />
                                    <div className="absolute bottom-3 left-4">
                                        <h2 className="text-xl font-bold text-white tracking-tight">{ngo.ngoName}</h2>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 min-h-[60px]">
                                        {ngo.about || "No supplemental details available."}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-300">
                                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl truncate">
                                            <span className="text-gray-500 block">Location</span>
                                            <strong>{ngo.city || "N/A"}</strong>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 p-2 rounded-xl truncate">
                                            <span className="text-gray-500 block">Members Count</span>
                                            <strong>{ngo.ngoMembers || 0} Activists</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 pt-0">
                                {ngo.isApproved ? (
                                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                                        <CheckCircle2 size={15} /> Validated Profile
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => approve("ngos", ngo._id)}
                                        disabled={actionId !== null}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition-all cursor-pointer shadow-md shadow-emerald-500/5"
                                    >
                                        {actionId === ngo._id ? <Loader2 size={15} className="animate-spin" /> : <BadgeCheck size={15} />}
                                        Approve Profile
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                ))}

                {/* 2. CLEANING COMPANIES INTERFACE PANEL */}
                {tab === "companies" && (companies.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">No organizational provider accounts logged.</div>
                ) : (
                    companies.map((c) => (
                        <motion.div
                            key={c._id}
                            whileHover={{ y: -4 }}
                            className="bg-[#0d1e16] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
                        >
                            <div>
                                {/* FIXED: Realigned payload rendering keys to match c.companyName structure */}
                                <h2 className="text-xl font-bold tracking-tight mb-2">{c.companyName || "Service Operator"}</h2>
                                <p className="text-gray-400 text-sm line-clamp-3 mb-4">{c.about || "No descriptions attached."}</p>
                                <div className="space-y-1 text-xs text-gray-300 mb-4 border-t border-white/5 pt-3">
                                    <div>HQ Location: <strong className="text-white">{c.city || "N/A"}, {c.state || ""}</strong></div>
                                    <div>Operational Capacity: <strong className="text-white">{c.workersCount || 0} Staffers</strong></div>
                                </div>
                            </div>
                            <div>
                                {c.isApproved ? (
                                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                                        <CheckCircle2 size={14} /> Active Operator
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => approve("companies", c._id)}
                                        disabled={actionId !== null}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wide transition duration-150 cursor-pointer"
                                    >
                                        {actionId === c._id ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Approve Operations"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                ))}

                {/* 3. CAMPAIGNS INTERFACE PANEL */}
                {tab === "campaigns" && (campaigns.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">No open mission files found.</div>
                ) : (
                    campaigns.map((camp) => (
                        <motion.div
                            key={camp._id}
                            whileHover={{ y: -4 }}
                            className="bg-[#0d1e16] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
                        >
                            <div>
                                <h2 className="text-xl font-bold tracking-tight mb-2">{camp.title}</h2>
                                <p className="text-gray-400 text-sm line-clamp-3 mb-4">{camp.description}</p>
                                <div className="space-y-1 text-xs text-gray-300 mb-4 border-t border-white/5 pt-3">
                                    <div className="flex items-center gap-1"><MapPin size={12} className="text-emerald-400" /> {camp.location}</div>
                                    {/* FIXED: Re-mapped directly to totalVolunteers counter variable calculation key */}
                                    <div className="flex items-center gap-1"><Users size={12} className="text-emerald-400" /> {camp.totalVolunteers ?? 0} Volunteers engaged</div>
                                </div>
                            </div>
                            <div>
                                {camp.status === "approved" || camp.status === "completed" ? (
                                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                                        <CheckCircle2 size={14} /> Dispatch Authorized
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => approve("campaigns", camp._id)}
                                        disabled={actionId !== null}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wide transition duration-150 cursor-pointer"
                                    >
                                        {actionId === camp._id ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Approve Launch"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                ))}

                {/* 4. CLEANING REQUESTS INTERFACE PANEL */}
                {tab === "requests" && (requests.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">No field requests pending dispatcher triage.</div>
                ) : (
                    requests.map((r) => (
                        <motion.div
                            key={r._id}
                            whileHover={{ y: -4 }}
                            className="bg-[#0d1e16] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
                        >
                            <div>
                                <h2 className="text-xl font-bold tracking-tight mb-1">{r.title || "Waste Remediation Call"}</h2>
                                {r.userId?.name && <span className="text-xs text-emerald-400/80">Submitted by: {r.userId.name}</span>}
                                <p className="text-gray-400 text-sm line-clamp-3 my-3">{r.description || "No supplemental descriptions specified."}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-300 border-t border-white/5 pt-3 mb-4">
                                    <MapPin size={12} className="text-emerald-400" /> <span className="truncate">{r.location || "N/A"}</span>
                                </div>
                            </div>
                            <div>
                                {r.status === "approved" || r.status === "completed" || r.status === "accepted" ? (
                                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                                        <CheckCircle2 size={14} /> Request Approved
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => approve("requests", r._id)}
                                        disabled={actionId !== null}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wide transition duration-150 cursor-pointer"
                                    >
                                        {actionId === r._id ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Approve Mission"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                ))}

                {/* 5. CERTIFICATES INTERFACE PANEL */}
                {tab === "certificates" && (certs.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">No validation certificates filed for validation yet.</div>
                ) : (
                    certs.map((cert) => (
                        <motion.div
                            key={cert._id}
                            whileHover={{ y: -4 }}
                            className="bg-[#0d1e16] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
                        >
                            <div>
                                <h2 className="text-xl font-bold tracking-tight mb-2">Govt Compliance Document</h2>
                                <p className="text-gray-400 text-xs mb-4">ID Reference hash: <code>{cert._id}</code></p>
                            </div>
                            <div>
                                {cert.isApproved ? (
                                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-green-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                                        <CheckCircle2 size={14} /> Signed & Verified
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => approve("certificates", cert._id)}
                                        disabled={actionId !== null}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wide transition duration-150 cursor-pointer"
                                    >
                                        {actionId === cert._id ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Sign Certificate"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                ))}

            </div>
        </div>
    );
}