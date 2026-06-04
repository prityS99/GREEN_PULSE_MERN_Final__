"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  Users,
  Search,
  Loader2,
  Mail,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Fingerprint,
  SlidersHorizontal,
} from "lucide-react";
import { adminService } from "@/services/api"; 

interface User {
  _id: string;        
  id?: string;       
  name: string;
  email: string;
  role: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // FETCH USERS
  useEffect(() => {
    loadSystemUsers();
  }, []);
const loadSystemUsers = async () => {
  try {
    setLoading(true);
    const res = await adminService.viewAllUsers();
    
    // Explicitly targeting your backend's "users" wrapper key
    if (res && Array.isArray(res.users)) {
      setUsers(res.users);
    } else if (res?.data && Array.isArray(res.data.users)) {
      // Handles it if your API client library (like Axios) wraps the response in .data
      setUsers(res.data.users);
    } else {
      setUsers([]);
    }
  } catch (error) {
    console.error("User fetch failed:", error);
    setUsers([]);
  } finally {
    setLoading(false);
  }
};

  // EXTRACT AVAILABLE ROLES FOR FILTER
  const userRoles = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return [
      ...new Set(
        users.map((user) => user?.role).filter(Boolean)
      ),
    ];
  }, [users]);

  // SEARCH AND FILTER LOGIC (With defensive handling for missing properties)
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    
    return users.filter((user) => {
      if (!user) return false;
      
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        (user.name && user.name.toLowerCase().includes(searchText)) ||
        (user.email && user.email.toLowerCase().includes(searchText)) ||
        (user.role && user.role.toLowerCase().includes(searchText)) ||
        (user._id && user._id.toLowerCase().includes(searchText));

      const matchesRole =
        !selectedRole ||
        user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, search, selectedRole]);

  // UPDATE USER ROLE DIRECTLY
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, { role: newRole });
      loadSystemUsers(); 
    } catch (error) {
      console.error("Role update failed:", error);
    }
  };

  // HANDLER: DELETE/BAN USER
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this user from the system?")) return;
    try {
      await adminService.deleteUser(userId);
      loadSystemUsers(); 
    } catch (error) {
      console.error("User deletion failed:", error);
    }
  };

  // ROLE BADGE UI RENDERER
  const renderRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold w-max">
            <ShieldCheck size={13} />
            Admin
          </div>
        );
      case "moderator":
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold w-max">
            <SlidersHorizontal size={13} />
            Moderator
          </div>
        );
      case "user":
      default:
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold w-max">
            <UserCheck size={13} />
            Regular User
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
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-10">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3">
            <Users className="text-emerald-400 w-10 h-10" />
            User Management
          </h1>
          <p className="text-gray-400 mt-2">
            Monitor system access, configure global user security access levels, and assign account roles.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative w-full lg:w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, role or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1e16] border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Role Filter Select Dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#0d1e16] border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-500 capitalize text-white"
          >
            <option value="">All Account Roles</option>
            {userRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredUsers.length === 0 ? (
        <div className="bg-[#0d1e16] border border-white/10 rounded-3xl p-10 text-center">
          <UserX className="mx-auto text-gray-500 w-14 h-14 mb-4" />
          <h2 className="text-2xl font-bold">No Users Found</h2>
          <p className="text-gray-400 mt-2">Try adapting your search parameters or filters.</p>
        </div>
      ) : (
        /* USERS DATA MATRIX GRID */
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
          {filteredUsers.map((user, i) => {
            const displayId = user._id || user.id || `fallback-id-${i}`;
            return (
              <motion.div
                key={displayId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1e16] flex flex-col justify-between"
              >
                {/* PROFILE BANNER / CARD TOP */}
                <div className="p-5 border-b border-white/5 bg-[#11241a]/40 relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar Mockup */}
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 text-lg uppercase shrink-0">
                        {user.name ? user.name.charAt(0) : "U"}
                      </div>
                      
                      <div className="overflow-hidden">
                        <h2 className="text-lg font-bold text-white truncate max-w-[160px]">
                          {user.name || "Unknown User"}
                        </h2>
                        <div className="mt-1">
                          {renderRoleBadge(user.role)}
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS BUTTON: BAN / DELETE */}
                    <button
                      onClick={() => handleDeleteUser(displayId)}
                      className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0"
                      title="Delete User Account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* USER DATA COMPARTMENTS */}
                <div className="p-5 space-y-4 flex-grow">
                  {/* EMAIL ELEMENT */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#13271d] border border-white/5">
                    <Mail size={16} className="text-emerald-400 shrink-0" />
                    <div className="overflow-hidden w-full">
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="text-sm text-gray-200 truncate select-all">{user.email || "No email available"}</p>
                    </div>
                  </div>

                  {/* ACCOUNT SYSTEM ID */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#13271d] border border-white/5">
                    <Fingerprint size={16} className="text-emerald-400 shrink-0" />
                    <div className="overflow-hidden w-full">
                      <p className="text-xs text-gray-500">Database Identifier</p>
                      <p className="text-xs text-gray-400 font-mono truncate select-all">{displayId}</p>
                    </div>
                  </div>

                  {/* ASSIGN NEW PERMISSION ROLE INTERACTION */}
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-gray-400 block mb-2">
                      Assign Account Access Level
                    </label>
                    <select
                      value={user.role || "user"}
                      onChange={(e) => handleRoleChange(displayId, e.target.value)}
                      className="w-full bg-[#13271d] border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 cursor-pointer capitalize text-white"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
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