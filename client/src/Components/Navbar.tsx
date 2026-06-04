"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../Hooks/Redux/Slices/authSlice";
import api from "@/lib/axios";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch<any>();
  const router = useRouter(); 

  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const role = user?.role?.toLowerCase() || "";

  const mainNavItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "NGOs", path: "/ngo" },
    { name: "Contact Us", path: "/contact" },
    { name: "Profile", path: "/profile" },
  ];

  /* =========================================================
      DYNAMIC SIDEBAR LINKS BASED ON USER ROLE
  ========================================================= */
  const getRoleMenuItems = () => {
    if (role === "ngo") {
      return [
        { name: "Campaigns", path: "/campaigns" },
        { name: "Volunteer Requests", path: "/volunteer-requests" },
        { name: "NGO Partners", path: "/ngo" },
        { name: "Tree Plantation", path: "/tree-plantation" },
        { name: "Animal Shelter", path: "/animal-shelter" },
      ];
    }
    
    if (role === "cleaning-company" || role === "cleaning_company") {
      return [
        { name: "Cleaning Companies", path: "/app/cleaning-company" },
        { name: "Active Assignments", path: "/cleaning-company/assignments" },
        { name: "Service Requests", path: "/cleaning-company/requests" },
      ];
    }

    // Default: Aside panel navigation links for regular/global dashboard users
    return [
      { name: "Overview", path: "/dashboard" },
      { name: "My Activities", path: "/dashboard/activities" },
      { name: "Settings", path: "/dashboard/settings" },
    ];
  };

  const menuItems = getRoleMenuItems();

  /* =========================================================
      DYNAMIC DASHBOARD ROUTE DETERMINATION
  ========================================================= */
  const getDashboardPath = (): string => {
    if (role === "ngo") {
      return "/ngo/dashboard";
    }
    if (role === "cleaning-company" || role === "cleaning_company") {
      return "/cleaning-company/dashboard";
    }
    // Target route for your global user dashboard
    return "/dashboard"; 
  };

  const dashboardPath = getDashboardPath();

  /* =========================================================
      LOGOUT ROUTINE WITH REDIRECT
  ========================================================= */
  const handleLogout = async () => {
    setIsOpen(false);

    try {
      await api.post("/logout");
    } catch (err) {
      console.log("Logout API failed:", err);
    }

    dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-green-700/20"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[80px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-50">
          <div className="bg-green-500 p-2 rounded-2xl">
            <Leaf className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Green Pulse</h1>
            <p className="text-xs text-green-300 tracking-wider">SAVE • CLEAN • PROTECT</p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-8">
          {mainNavItems.map((item, i) => (
            <motion.div whileHover={{ y: -2 }} key={i}>
              <Link
                href={item.path}
                className="text-gray-200 hover:text-green-300 transition-all duration-300 font-medium"
              >
                {item.name}
              </Link>
            </motion.div>
          ))}

          {/* Conditional Desktop Link Generation for all logged in users */}
          {isAuthenticated && (
            <motion.div whileHover={{ y: -2 }}>
              <Link
                href={dashboardPath}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-all duration-300 border-l border-green-800/60 pl-6"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            </motion.div>
          )}
        </nav>

        {/* Desktop Action Links */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-white bg-green-950/40 border border-green-800/40 px-4 py-2 rounded-full text-sm">
                <UserIcon size={16} className="text-green-400" />
                <span className="font-medium max-w-[120px] truncate">{user?.name || "User"}</span>
              </div>
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
              <Link
                href="/login"
                className="border border-green-400/40 px-5 py-2 rounded-full text-white hover:bg-green-500/20 transition-all text-sm font-medium text-center"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-all shadow-lg shadow-green-500/20 text-white text-sm text-center"
              >
                Join Mission
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white hover:text-green-400 transition-colors relative z-50 p-2"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-x-0 top-0 bg-black/95 backdrop-blur-2xl border-b border-green-700/20 pt-[95px] pb-10 px-6 overflow-y-auto lg:hidden z-40"
          >
            <div className="flex flex-col gap-8 max-w-md mx-auto pb-8">

              <nav className="flex flex-col gap-4 text-center">
                {mainNavItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className="text-xl font-medium text-gray-200 hover:text-green-300 block py-1.5 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Conditional Mobile Main Dashboard Link */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: mainNavItems.length * 0.04 }}
                  >
                    <Link
                      href={dashboardPath}
                      onClick={() => setIsOpen(false)}
                      className="text-xl font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2 py-2 mt-2"
                    >
                      <LayoutDashboard size={20} />
                      Go to Dashboard
                    </Link>
                  </motion.div>
                )}
              </nav>

              {/* Responsive Submenu Wrapper (Now works for Global users too) */}
              {isAuthenticated && menuItems.length > 0 && (
                <>
                  <div className="border-t border-green-800/40 my-2 flex items-center justify-center gap-2 pt-4">
                    <LayoutDashboard size={14} className="text-green-400" />
                    <span className="text-xs uppercase font-bold tracking-widest text-green-400">
                      {role ? role.replace("-", " ") : "Global"} Dashboard Panels
                    </span>
                  </div>

                  <nav className="flex flex-col gap-2 text-center">
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: (mainNavItems.length + 1 + index) * 0.04 }}
                      >
                        <Link 
                          href={item.path} 
                          onClick={() => setIsOpen(false)}
                          className="text-base text-gray-300 hover:text-green-400 transition-colors block py-1"
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </>
              )}

              <div className="flex flex-col gap-3 mt-4 w-full">
                {isAuthenticated ? (
                  <>
                    <div className="text-center text-gray-400 text-sm py-1 border-b border-green-900/20">
                      Logged in as <span className="text-white font-semibold">{user?.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 border border-red-500/40 py-3 rounded-full text-red-200 font-medium hover:bg-red-500/10 transition-all block w-full text-center"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="border border-green-400/40 py-3 rounded-full text-white text-center font-medium hover:bg-green-500/10 transition-all block w-full"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 py-3 rounded-full font-bold text-center text-white shadow-lg shadow-green-500/20 block w-full"
                    >
                      Join Mission
                    </Link>
                  </>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}