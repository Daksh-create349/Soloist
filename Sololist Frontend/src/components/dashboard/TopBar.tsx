"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getProfile, UserConfigResponse } from "@/lib/api";
import { toast } from "sonner";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function TopBar() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserConfigResponse | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }
    loadProfile();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
    >
      <div>
        <p className="text-solo-blue text-[11px] font-bold uppercase tracking-[0.2em] mb-2">
          {profile?.agency_name || "Soloist"} Command Center
        </p>
        <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-text-primary mb-1 tracking-[-0.02em]">
          Good morning, {profile?.name.split(' ')[0] || "Operator"} <span className="inline-block origin-bottom hover:animate-wave">👋</span>
        </h1>
        <p className="text-text-secondary text-[15px] flex items-center gap-2">
           You have <span className="font-semibold text-solo-blue underline underline-offset-4 decoration-solo-blue/30">3 new opportunities</span> matching your <span className="font-medium text-text-primary">{profile?.niche || "freelance"}</span> profile.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => toast.info(`Current Focus: ${profile?.niche || "General"}`)}
          className="relative w-11 h-11 flex items-center justify-center rounded-full bg-background-secondary border border-border-tertiary hover:border-border-secondary transition-all hover:shadow-sm active:scale-95"
        >
          <Bell className="w-5 h-5 text-text-secondary" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-solo-coral rounded-full shadow-[0_0_8px_rgba(216,90,48,0.6)]" />
        </button>
        
        <Button 
          onClick={() => router.push("/dashboard/clients?new=true")}
          className="bg-solo-blue hover:bg-solo-blue/90 text-white rounded-full h-11 px-6 text-[14px] font-bold shadow-lg shadow-solo-blue/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Client
        </Button>
      </div>
    </motion.div>
  );
}
