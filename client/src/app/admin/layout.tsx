"use client";

import AdminSidebar from "@/Components/admin/AdminSidebar";
import AdminNavbar from "@/Components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07130d] text-white">

      {/* 🌿 SIDEBAR (FIXED) */}
      <AdminSidebar />

      {/* 🌿 MAIN AREA (OFFSET) */}
      <div className="ml-72 flex flex-col min-h-screen">

        {/* TOP NAV */}
        <AdminNavbar />

        {/* CONTENT */}
        <main className="p-6 pt-24">
          {children}
        </main>

      </div>
    </div>
  );
}