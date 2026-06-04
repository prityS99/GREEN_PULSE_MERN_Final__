"use client";

import {
  Leaf,
  Users,
  Building2,
  ClipboardList,
  BadgeCheck,
  Megaphone,
  HandHeart,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "NGOs", href: "/admin/ngos", icon: Building2 },
    { name: "Cleaning Companies", href: "/admin/cleaning-company", icon: ClipboardList },
    { name: "Campaigns", href: "/admin/campaigns", icon: Megaphone },
    { name: "Cleaning Requests", href: "/admin/cleaning-requests", icon: HandHeart },
    // { name: "Approvals", href: "/admin/approvals", icon: BadgeCheck },
    { name: "Govt Rewards", href: "/admin/rewards", icon: ShieldCheck },
    { name: "Users", href: "/admin/user", icon: Users },
    { name: "Impact Analytics", href: "/admin/analytics", icon: TrendingUp },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-[#06140e] via-[#0b1f16] to-black border-r border-white/10 p-6 text-white">

      {/* 🌿 HEADER */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
          <Leaf className="text-white" />
        </div>

        <div>
          <h1 className="text-xl font-black">Eco Admin</h1>
          <p className="text-xs text-emerald-300 tracking-widest">
            CONTROL PANEL
          </p>
        </div>
      </div>

      {/* 🌿 NAVIGATION */}
      <nav className="space-y-2">

        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={i}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}

      </nav>

 
    </aside>
  );
}