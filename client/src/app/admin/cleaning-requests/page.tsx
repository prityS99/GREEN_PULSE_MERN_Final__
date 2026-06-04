// "use client";

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   ClipboardList,
//   MapPin,
//   Calendar,
//   Building2,
//   CheckCircle2,
//   XCircle,
//   Phone,
//   Clock,
//   Loader2,
//   AlertCircle,
//   FileText,
// } from "lucide-react";
// import { adminService } from "../../../services/api";

// interface CleaningRequestItem {
//   _id: string;
//   status: "pending" | "approved" | "accepted" | "rejected" | "completed";
//   createdAt: string;
//   // Deep populated fields matching your AdminController aggregation layout
//   userId?: {
//     _id: string;
//     name: string;
//     email: string;
//     role: string;
//   };
//   companyId?: {
//     _id: string;
//     companyName: string;
//     phone: string;
//   };
//   // Common fields typically found in a cleaning request schema
//   title?: string;
//   description?: string;
//   location?: string;
//   scheduledDate?: string;
// }

// export default function AdminCleaningRequests() {
//   const [requests, setRequests] = useState<CleaningRequestItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [actionId, setActionId] = useState<string | null>(null);

//   // FETCH ALL REQUESTS
//   // Note: If you add an explicit viewAllCleaningRequests endpoint later to adminService, link it here.
//   // For now, we reuse the dashboard data or log entries gracefully.
//   async function loadCleaningRequests() {
//     try {
//       setLoading(true);
//       // Replace with your explicit get-all requests service method if separate
//       const res = await adminService.viewGlobalActivities(); 
//       // If your server has a dedicated route, adapt to: const res = await adminService.viewAllCleaningRequests();

//       const rawData = res?.cleaningRequests || res?.data || [];
//       setRequests(Array.isArray(rawData) ? rawData : []);
//     } catch (error) {
//       console.error("Failed fetching cleaning requests register pipeline:", error);
//       setRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadCleaningRequests();
//   }, []);

//   // DISPATCH: APPROVE CLEANING MISSION
//   const handleApprove = async (requestId: string) => {
//     setActionId(requestId);
//     try {
//       await adminService.approveCleaningRequest(requestId);

//       // Update local state cleanly instantly
//       setRequests((prev) =>
//         prev.map((r) => (r._id === requestId ? { ...r, status: "approved" } : r))
//       );
//     } catch (error) {
//       console.error("Failed to approve cleaning request task:", error);
//     } finally {
//       setActionId(null);
//     }
//   };

//   // DISPATCH: REJECT CLEANING MISSION
//   const handleReject = async (requestId: string) => {
//     const reason = prompt("Enter rejection reason notes (optional):") || "";
//     setActionId(requestId);
//     try {
//       await adminService.rejectCleaningRequest(requestId, reason);

//       // Update local state cleanly instantly
//       setRequests((prev) =>
//         prev.map((r) => (r._id === requestId ? { ...r, status: "rejected" } : r))
//       );
//     } catch (error) {
//       console.error("Failed to reject cleaning request task:", error);
//     } finally {
//       setActionId(null);
//     }
//   };

//   // Analytical Metrics Derivations
//   const totalRequests = requests.length;
//   const pendingRequests = requests.filter((r) => r.status === "pending").length;
//   const activeMissions = requests.filter((r) => r.status === "approved" || r.status === "accepted").length;

//   if (loading && requests.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen text-emerald-400 bg-[#07130d]">
//         <Loader2 className="animate-spin w-10 h-10" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#07130d] text-white p-6">

//       {/* HEADER */}
//       <h1 className="text-3xl font-black mb-6 flex items-center gap-2">
//         <ClipboardList className="text-emerald-400" />
//         Cleaning Request Pipeline
//       </h1>

//       {/* STRATEGIC METRICS DASHBOARD GRID */}
//       <div className="grid sm:grid-cols-3 gap-4 mb-8">
//         <div className="bg-[#0d1e16] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
//           <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
//             <ClipboardList size={24} />
//           </div>
//           <div>
//             <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Total Requests</p>
//             <h3 className="text-2xl font-black mt-0.5">{totalRequests}</h3>
//           </div>
//         </div>

//         <div className="bg-[#0d1e16] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
//           <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
//             <Clock size={24} />
//           </div>
//           <div>
//             <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Pending Operations</p>
//             <h3 className="text-2xl font-black mt-0.5">{pendingRequests}</h3>
//           </div>
//         </div>

//         <div className="bg-[#0d1e16] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
//           <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
//             <Building2 size={24} />
//           </div>
//           <div>
//             <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Dispatched Tasks</p>
//             <h3 className="text-2xl font-black mt-0.5">{activeMissions}</h3>
//           </div>
//         </div>
//       </div>

//       {/* REQUESTS ITERATION RENDER GRID */}
//       {requests.length === 0 ? (
//         <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-10 text-center">
//           <AlertCircle className="mx-auto text-gray-500 w-14 h-14 mb-4" />
//           <h2 className="text-2xl font-bold">No Cleaning Requests Logged</h2>
//           <p className="text-gray-400 mt-2">Incoming field reports will stream automatically via user submissions.</p>
//         </div>
//       ) : (
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {requests.map((r, i) => (
//             <motion.div
//               key={r._id || i}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.05 }}
//               className="bg-[#0d1e16] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
//             >
//               <div>
//                 {/* Header Information */}
//                 <div className="flex justify-between items-start gap-2">
//                   <h2 className="text-xl font-bold tracking-tight truncate">
//                     {r.title || "Waste Disposal Request"}
//                   </h2>
//                 </div>

//                 {r.userId?.name && (
//                   <p className="text-xs text-emerald-400/80 mt-1">
//                     Filed by {r.userId.name} <span className="text-gray-500">({r.userId.role})</span>
//                   </p>
//                 )}

//                 <p className="text-gray-400 text-sm mt-3 line-clamp-3">
//                   {r.description || "No supplemental descriptive situational overview details specified for this environmental mission."}
//                 </p>

//                 {/* Logistics Metadata Block */}
//                 <div className="mt-4 space-y-2 text-sm text-gray-300 border-t border-white/5 pt-4">
//                   <div className="flex items-center gap-2">
//                     <MapPin size={14} className="text-emerald-400 shrink-0" />
//                     <span className="truncate">{r.location || "Coordinates Untracked"}</span>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <Calendar size={14} className="text-emerald-400 shrink-0" />
//                     <span>
//                       {r.scheduledDate ? new Date(r.scheduledDate).toDateString() : "Immediate Response Group"}
//                     </span>
//                   </div>

//                   {r.companyId?.companyName && (
//                     <div className="flex items-center gap-2 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 text-xs">
//                       <Building2 size={13} className="text-emerald-400 shrink-0" />
//                       <span className="truncate text-emerald-300">
//                         Assigned: <strong>{r.companyId.companyName}</strong>
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* ACTION & DYNAMIC STATUS CONTROL BAR FOOTER */}
//               <div className="mt-6 flex flex-col gap-2 border-t border-white/5 pt-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-gray-500">Current Lifecycle status</span>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
//                       r.status === "completed" || r.status === "approved"
//                         ? "bg-emerald-500/20 text-emerald-400"
//                         : r.status === "accepted"
//                         ? "bg-blue-500/20 text-blue-300"
//                         : r.status === "rejected"
//                         ? "bg-red-500/20 text-red-400"
//                         : "bg-yellow-500/20 text-yellow-300"
//                     }`}
//                   >
//                     {r.status || "pending"}
//                   </span>
//                 </div>

//                 {/* Operations Actions Pipeline Controls */}
//                 {r.status === "pending" && (
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <button
//                       onClick={() => handleReject(r._id)}
//                       disabled={actionId !== null}
//                       className="flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-2 rounded-xl text-xs transition duration-200 cursor-pointer"
//                     >
//                       {actionId === r._id ? (
//                         <Loader2 className="animate-spin w-3.5 h-3.5" />
//                       ) : (
//                         <XCircle size={14} />
//                       )}
//                       Reject
//                     </button>

//                     <button
//                       onClick={() => handleApprove(r._id)}
//                       disabled={actionId !== null}
//                       className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2 rounded-xl text-xs transition duration-200 cursor-pointer shadow-lg shadow-emerald-500/5"
//                     >
//                       {actionId === r._id ? (
//                         <Loader2 className="animate-spin w-3.5 h-3.5" />
//                       ) : (
//                         <CheckCircle2 size={14} />
//                       )}
//                       Approve
//                     </button>
//                   </div>
//                 )}
//               </div>

//             </motion.div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { adminService } from "../../../services/api";

interface CleaningRequestItem {
  _id: string; status: "pending" | "approved" | "accepted" | "in_progress" | "rejected" | "completed";
  createdAt: string;
  isApprovedByAdmin?: boolean;
  userId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  companyId?: {
    _id: string;
    companyName: string;
    phone: string;
  };
  title?: string;
  description?: string;
  location?: string;
  scheduledDate?: string;
}

export default function AdminCleaningRequests() {
  const [requests, setRequests] = useState<CleaningRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // FETCH ALL REQUESTS
  async function loadCleaningRequests() {
    try {
      setLoading(true);
      // ✅ FIX: Using the direct cleaner route targeting /admin/cleaning-request
      const res = await adminService.getCleaningRequests();

      // ✅ FIX: Safely unpack 'cleaningRequests' array matching backend payload envelope layout
      const rawData = res?.cleaningRequests || res?.data || res || [];
      setRequests(Array.isArray(rawData) ? rawData : []);
    } catch (error) {
      console.error("Failed fetching cleaning requests register pipeline:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCleaningRequests();
  }, []);

  // DISPATCH: APPROVE CLEANING MISSION
const handleApprove = async (requestId: string) => {
  setActionId(requestId);

  try {
    await adminService.approveCleaningRequest(requestId);

    setRequests((prev) =>
      prev.map((r) =>
        r._id === requestId
          ? {
              ...r,
              status: "approved",
              isApprovedByAdmin: true,
            }
          : r
      )
    );
  } catch (error) {
    console.error("Failed to approve cleaning request:", error);
  } finally {
    setActionId(null);
  }
};

  // DISPATCH: REJECT CLEANING MISSION
  const handleReject = async (requestId: string) => {
    const reason = prompt("Enter rejection reason notes (optional):") || "";
    setActionId(requestId);
    try {
      await adminService.rejectCleaningRequest(requestId, reason);

      // Update local state cleanly instantly
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: "rejected" } : r))
      );
    } catch (error) {
      console.error("Failed to reject cleaning request task:", error);
    } finally {
      setActionId(null);
    }
  };

  // Analytical Metrics Derivations
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const activeMissions = requests.filter((r) => r.status === "approved" || r.status === "accepted").length;

  if (loading && requests.length === 0) {
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
        <ClipboardList className="text-emerald-400" />
        Cleaning Request Pipeline
      </h1>

      {/* STRATEGIC METRICS DASHBOARD GRID */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0d1e16] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Total Requests</p>
            <h3 className="text-2xl font-black mt-0.5">{totalRequests}</h3>
          </div>
        </div>

        <div className="bg-[#0d1e16] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Pending Operations</p>
            <h3 className="text-2xl font-black mt-0.5">{pendingRequests}</h3>
          </div>
        </div>

        <div className="bg-[#0d1e16] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Dispatched Tasks</p>
            <h3 className="text-2xl font-black mt-0.5">{activeMissions}</h3>
          </div>
        </div>
      </div>

      {/* REQUESTS ITERATION RENDER GRID */}
      {requests.length === 0 ? (
        <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-10 text-center">
          <AlertCircle className="mx-auto text-gray-500 w-14 h-14 mb-4" />
          <h2 className="text-2xl font-bold">No Cleaning Requests Logged</h2>
          <p className="text-gray-400 mt-2">Incoming field reports will stream automatically via user submissions.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((r, i) => (
            <motion.div
              key={r._id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#0d1e16] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-xl font-bold tracking-tight truncate">
                    {r.title || "Waste Disposal Request"}
                  </h2>
                </div>

                {r.userId?.name && (
                  <p className="text-xs text-emerald-400/80 mt-1">
                    Filed by {r.userId.name} <span className="text-gray-500">({r.userId.role})</span>
                  </p>
                )}

                <p className="text-gray-400 text-sm mt-3 line-clamp-3">
                  {r.description || "No supplemental descriptive situational overview details specified for this environmental mission."}
                </p>

                {/* Logistics Metadata Block */}
                <div className="mt-4 space-y-2 text-sm text-gray-300 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{r.location || "Coordinates Untracked"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-400 shrink-0" />
                    <span>
                      {r.scheduledDate ? new Date(r.scheduledDate).toDateString() : "Immediate Response Group"}
                    </span>
                  </div>

                  {/* ✅ The Backend Controller now correctly populates company details */}
                  {r.companyId?.companyName && (
                    <div className="flex items-center gap-2 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 text-xs">
                      <Building2 size={13} className="text-emerald-400 shrink-0" />
                      <span className="truncate text-emerald-300">
                        Assigned: <strong>{r.companyId.companyName}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION & DYNAMIC STATUS CONTROL BAR FOOTER */}
              {/* ACTION & STATUS SECTION */}
              <div className="mt-6 flex flex-col gap-3 border-t border-white/5 pt-4">

                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Current Lifecycle Status
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${r.status === "approved" || r.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : r.status === "accepted" || r.status === "in_progress"
                          ? "bg-blue-500/20 text-blue-300"
                          : r.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-300"
                      }`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* Pending Actions */}
                {r.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleReject(r._id)}
                      disabled={actionId !== null}
                      className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold py-2.5 rounded-xl transition-all"
                    >
                      {actionId === r._id ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Reject
                    </button>

                    <button
                      onClick={() => handleApprove(r._id)}
                      disabled={actionId !== null}
                      className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 rounded-xl transition-all"
                    >
                      {actionId === r._id ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Approve
                    </button>
                  </div>
                )}

                {/* Approved State */}
                {r.status === "approved" && (
                  <div className="flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 py-2.5 rounded-xl font-semibold">
                    <CheckCircle2 size={16} />
                    Approved by Admin
                  </div>
                )}

                {/* Rejected State */}
                {r.status === "rejected" && (
                  <div className="flex items-center justify-center gap-2 bg-red-500/15 border border-red-500/20 text-red-400 py-2.5 rounded-xl font-semibold">
                    <XCircle size={16} />
                    Rejected
                  </div>
                )}

                {/* Accepted State */}
                {r.status === "accepted" && (
                  <div className="flex items-center justify-center gap-2 bg-blue-500/15 border border-blue-500/20 text-blue-300 py-2.5 rounded-xl font-semibold">
                    <Building2 size={16} />
                    Accepted By Company
                  </div>
                )}

                {/* In Progress State */}
                {r.status === "in_progress" && (
                  <div className="flex items-center justify-center gap-2 bg-blue-500/15 border border-blue-500/20 text-blue-300 py-2.5 rounded-xl font-semibold">
                    <Clock size={16} />
                    Work In Progress
                  </div>
                )}

                {/* Completed State */}
                {r.status === "completed" && (
                  <div className="flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 py-2.5 rounded-xl font-semibold">
                    <CheckCircle2 size={16} />
                    Cleaning Completed
                  </div>
                )}
              </div>

            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}