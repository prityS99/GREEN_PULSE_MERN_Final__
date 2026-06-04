"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";

import { motion } from "framer-motion";
import { socket } from "@/lib/socket";
import { adminService } from "../../../services/api"; // Adjust path as needed

// Dynamic Icon Mapping helper for stats
const iconMap: Record<string, any> = {
  Users: Users,
  Building2: Building2,
  Trash2: Trash2,
  ShieldCheck: ShieldCheck, // Icon used for Cleaning Companies
};

interface StatItem {
  title: string;
  value: string | number;
  iconName: "Users" | "Building2" | "Trash2" | "ShieldCheck";
  growth: string;
}

interface ActivityItem {
  id: string | number;
  type: string;
  title: string;
  location: string;
  status: "Pending" | "Completed" | "Approved" | string;
  date: string;
}

interface NotificationItem {
  message: string;
  type?: string;
  timestamp?: string | number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  
  // Dynamic States
  const [stats, setStats] = useState<StatItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [impactScore, setImpactScore] = useState<number>(0);

  /* 🌿 INITIAL API FETCH & REAL-TIME WEBSOCKETS */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [response, globalActivities] = await Promise.all([
          adminService.getDashboardAnalytics(),
          adminService.viewGlobalActivities(),
        ]);

        // Safely extract the nested analytics data object
        const analytics = response?.analytics;

        setStats([
          { 
            title: "Total Users", 
            value: analytics?.totalUsers ?? 0, 
            iconName: "Users", 
            growth: "Live updating" 
          },
          { 
            title: "NGOs Registered", 
            value: analytics?.totalNgo ?? 0, 
            iconName: "Building2", 
            growth: "Live updating" 
          },
          { 
            title: "Cleaning Companies", 
            value: analytics?.totalCleaningCompanies ?? 0, // 🧼 Now explicitly binding your response field
            iconName: "ShieldCheck", 
            growth: "Live updating" 
          },
          { 
            title: "Cleaning Requests", 
            value: analytics?.totalApprovedCleaningRequests ?? 0, 
            iconName: "Trash2", 
            growth: "Live updating" 
          },
        ]);

        setImpactScore(analytics?.totalApprovedRewards > 0 ? 92 : 0);

        if (Array.isArray(globalActivities)) {
          const mappedActivities = globalActivities.map((act: any) => ({
            id: act.id || act._id,
            type: act.type || "System Event",
            title: act.title || "Activity Update",
            location: act.location || "Global Area",
            status: act.status || "Completed",
            date: act.date || new Date(act.createdAt).toLocaleDateString() || "Recent",
          }));
          setActivities(mappedActivities);
        }

      } catch (error) {
        console.error("Error populating admin control dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    /* 🌿 LIVE LISTENERS FOR REAL-TIME UPDATES */
    socket.on("admin:notification", (data: NotificationItem) => {
      setNotifications((prev) => [data, ...prev]);
    });

    // Handle incoming dynamic cleaning request events
    socket.on("admin:cleaning:new", (data: any) => {
      setNotifications((prev) => [
        { message: "New Cleaning Request Received", type: "info" },
        ...prev,
      ]);

      if (data) {
        setActivities((prev) => [
          {
            id: data.id || Date.now(),
            type: "Cleaning",
            title: data.title || "Waste Removal Request",
            location: data.location || "Pending Location",
            status: data.status || "Pending",
            date: data.date || "Just now",
          },
          ...prev,
        ]);
      }

      setStats((prevStats) =>
        prevStats.map((stat) =>
          stat.title === "Cleaning Requests"
            ? { ...stat, value: Number(stat.value) + 1, growth: "+1 incoming request" }
            : stat
        )
      );
    });

    return () => {
      socket.off("admin:notification");
      socket.off("admin:cleaning:new");
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-black to-emerald-900 text-white">
        <Loader2 className="w-14 h-14 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130d] text-white">

      {/* 🌿 HERO PANEL */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-emerald-950 via-[#0b2015] to-black">
        <div className="relative max-w-7xl mx-auto px-6 py-16">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black"
          >
            🌿 Eco Admin <span className="text-emerald-400">Control Center</span>
          </motion.h1>

          <p className="mt-6 text-gray-300 max-w-2xl">
            A living system that tracks NGOs, sanitation partners, cleaning missions, 
            and environmental parameters in real time.
          </p>

 

        </div>
      </section>

      {/* 📊 ANALYTICS STATS GRID */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((item, i) => {
            const Icon = iconMap[item.iconName] || Users;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d1e16] border border-white/10 rounded-3xl p-6"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{item.title}</p>
                    <h2 className="text-3xl font-black mt-2">
                      {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                    </h2>
                  </div>
                  <Icon className="text-emerald-400 w-8 h-8" />
                </div>
                <p className="text-emerald-400 text-sm mt-4">{item.growth}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 📋 GLOBAL CONTENT BOARD */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* 🌱 RECENT ACTIVITIES LIST */}
          <div className="lg:col-span-2 bg-[#0d1e16] border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No logged records found from global service.</p>
              ) : (
                activities.slice(0, 10).map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl bg-black/20 border border-white/10"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{a.title}</h3>
                        <p className="text-gray-400 text-sm">
                          {a.type} • {a.location}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          a.status === "Completed" || a.status === "Approved"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : a.status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          

          {/* 🌿 SIDEBAR PANELS */}
          <div className="space-y-6">
            <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-black mb-3">System Status</h2>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 />
                All Systems Operational
              </div>
            </div>

            <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-black mb-3">Impact Score</h2>
              <p className="text-3xl font-black text-emerald-400">{impactScore}%</p>
              <p className="text-gray-400 text-sm mt-2">Environmental efficiency rating</p>
            </div>
          </div>

        </div>
      </section>

      <footer className="text-center text-gray-500 py-8 border-t border-white/10">
        Built for a greener tomorrow 🌿
      </footer>

    </div>
  );
}