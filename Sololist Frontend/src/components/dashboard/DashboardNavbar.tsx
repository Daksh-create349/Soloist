"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Zap, Target, DollarSign, Bell } from "lucide-react";
import { NotificationSheet } from "./NotificationSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getProfile, UserConfigResponse } from "@/lib/api";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Client Hub", href: "/dashboard/clients", icon: Users },
  { name: "Ops Autopilot", href: "/dashboard/autopilot", icon: Zap },
  { name: "Opportunity Radar", href: "/dashboard/radar", icon: Target },
  { name: "Revenue", href: "/dashboard/revenue", icon: DollarSign },
];

export function DashboardNavbar() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [profile, setProfile] = useState<UserConfigResponse | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchProfile();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 h-[72px] bg-white/80 backdrop-blur-3xl border-b border-border-tertiary shadow-sm z-50 flex items-center justify-between px-6 md:px-12">
      <div className="flex items-center gap-12">
        {/* LOGO */}
        <Link href="/dashboard" className="font-serif text-[22px] font-bold tracking-tight text-text-primary hover:opacity-80 transition-opacity flex items-center gap-1">
          {profile?.agency_name || "Soloist"}<span className="text-solo-blue">.</span>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 rounded-full text-[13px] font-bold tracking-wide flex items-center gap-2 transition-all duration-300 ${
                  isActive 
                    ? "text-solo-blue" 
                    : "text-text-secondary hover:text-text-primary hover:bg-black/5"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "opacity-100" : "opacity-70"}`} />
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-solo-blue/10 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 text-text-secondary hover:text-text-primary transition-all active:scale-90"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-solo-coral rounded-full border-2 border-white" />
          </button>
          
          <NotificationSheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
          
          <div className="w-[1px] h-6 bg-border-tertiary" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[13px] font-bold text-text-primary">{profile?.name || "Operator"}</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-solo-blue">{profile?.agency_name || "Solo Pro"}</span>
            </div>
            <Avatar className="w-9 h-9 border-2 border-white shadow-sm ring-2 ring-solo-blue/20 transition-all hover:ring-solo-blue cursor-pointer active:scale-95">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${profile?.name}`} />
              <AvatarFallback className="bg-solo-blue text-white text-[12px] font-bold">
                {profile?.name ? profile.name.split(' ').map(n=>n[0]).join('') : "OP"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
}
