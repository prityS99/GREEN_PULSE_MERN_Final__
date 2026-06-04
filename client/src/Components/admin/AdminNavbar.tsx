"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Bell,
  Building2,
  ClipboardList,
  Megaphone,
  HandHeart,
  BadgeCheck,
  ShieldCheck,
  Users,
  TrendingUp,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../Hooks/Redux/Slices/authSlice";
import { socket } from "@/lib/socket";
import api from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

 
  const dispatch = useDispatch<any>();
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  const mainNavItems = [
    { name: "Home", path: "/" },
    { name: "NGOs", path: "/ngo" },
    { name: "Campaigns", path: "/campaigns" },
    { name: "Cleaning", path: "/cleaning" },
  ];

  const adminNavItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "NGOs", href: "/admin/ngos", icon: Building2 },
  {
    name: "Cleaning Companies",
    href: "/admin/cleaning-companies",
    icon: ClipboardList,
  },
  { name: "Campaigns", href: "/admin/campaigns", icon: Megaphone },
  {
    name: "Cleaning Requests",
    href: "/admin/cleaning-requests",
    icon: HandHeart,
  },
  { name: "Approvals", href: "/admin/approvals", icon: BadgeCheck },
  { name: "Govt Rewards", href: "/admin/rewards", icon: ShieldCheck },
  { name: "Users", href: "/admin/users", icon: Users },
  {
    name: "Impact Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
  },
];
  const dashboardItems = [
    "Cleaning Requests",
    "Campaigns",
    "NGOs",
    "Users",
    "Volunteers",
    "Rewards",
  ];

  /* 🌿 SOCKET NOTIFICATIONS */
  useEffect(() => {
    socket.on("admin:notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    socket.on("admin:campaign:new", (data) => {
      setNotifications((prev) => [
        { message: "New campaign created", type: "info" },
        ...prev,
      ]);
    });

    socket.on("admin:cleaning:new", (data) => {
      setNotifications((prev) => [
        { message: "New cleaning request", type: "info" },
        ...prev,
      ]);
    });

    return () => {
      socket.off("admin:notification");
      socket.off("admin:campaign:new");
      socket.off("admin:cleaning:new");
    };
  }, []);

  /* 🚪 LOGOUT */
  const handleLogout = async () => {
    setIsOpen(false);

    try {
      await api.post("/logout");
    } catch (err) {
      console.log(err);
    }

    dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-green-700/20"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[80px] flex items-center justify-between">

        {/* 🌿 LOGO */}
        <Link href="/admin" className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-2xl shadow-lg shadow-green-500/30">
            <Leaf className="text-white" size={24} />
          </div>

          <div>
            <h1 className="text-xl font-black text-white">
              Eco Admin Panel
            </h1>
            <p className="text-xs text-green-300 tracking-widest">
              SAVE • TRACK • PROTECT
            </p>
          </div>
        </Link>

        {/* 🌍 DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-8">
          {mainNavItems.map((item, i) => (
            <motion.div whileHover={{ y: -2 }} key={i}>
              <Link
                href={item.path}
                className="text-gray-200 hover:text-green-300 transition"
              >
                {item.name}
              </Link>
            </motion.div>
          ))}

          {isAuthenticated && (
            <Link
              href="/admin/dashboard"
              className="text-emerald-400 font-semibold flex items-center gap-2 border-l border-green-700/50 pl-6"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          )}
        </nav>

        {/* 🔔 RIGHT SIDE */}
        <div className="hidden lg:flex items-center gap-4">

          {/* 🔔 NOTIFICATIONS */}
          <div className="relative cursor-pointer">
            <Bell className="text-emerald-300" />
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>

          {/* 🌿 AUTH SECTION */}
          {isAuthenticated ? (
            <>
              {/* USER INFO */}
              <div className="flex items-center gap-2 text-white bg-green-950/40 border border-green-800/40 px-4 py-2 rounded-full text-sm">
                <UserIcon size={16} className="text-emerald-400" />
                <span className="font-medium max-w-[120px] truncate">
                  {user?.name || "Admin"}
                </span>
              </div>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 border border-red-500/40 px-5 py-2 rounded-full text-red-200 hover:bg-red-500/20 transition-all text-sm font-medium"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* LOGIN */}
              <Link
                href="/login"
                className="border border-emerald-400/40 px-5 py-2 rounded-full text-white hover:bg-emerald-500/10 transition-all text-sm font-medium"
              >
                Login
              </Link>

              {/* OPTIONAL: ADMIN SIGNUP (if needed) */}
              <Link
                href="/signup"
                className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-2 rounded-full text-white font-semibold hover:scale-105 transition-all"
              >
                Join Mission
              </Link>
            </>
          )}

        </div>
        {/* 🍔 MOBILE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 📱 MOBILE MENU (kept same style, simplified) */}
 {/* MOBILE MENU */}
<AnimatePresence>
  {isOpen && (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen w-[300px] bg-gradient-to-b from-[#06140e] via-[#0b1f16] to-black border-r border-white/10 z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl">
              <Leaf size={22} className="text-white" />
            </div>

            <div>
              <h2 className="font-black text-white">
                Eco Admin
              </h2>

              <p className="text-xs tracking-widest text-emerald-300">
                CONTROL PANEL
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-red-400 transition"
          >
            <X size={28} />
          </button>
        </div>

        {/* User */}
        {isAuthenticated && (
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <UserIcon
                size={18}
                className="text-emerald-400"
              />

              <div>
                <p className="text-white font-semibold text-sm">
                  {user?.name}
                </p>

                <p className="text-xs text-gray-400">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="p-4">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 px-2">
            Website
          </h3>

          <div className="space-y-2">
            {mainNavItems.map((item, i) => (
              <Link
                key={i}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Admin Navigation */}
        {isAuthenticated && (
          <div className="p-4 border-t border-white/10">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 px-2">
              Administration
            </h3>

            <div className="space-y-2">
              {adminNavItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${
                      pathname === item.href
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Logout */}
        {isAuthenticated && (
          <div className="p-4 mt-auto border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </motion.div>
    </>
  )}
</AnimatePresence>
    </motion.header>
  );
}