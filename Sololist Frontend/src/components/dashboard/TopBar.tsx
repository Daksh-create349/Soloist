import { useState, useEffect } from "react";
import { getProfile, UserConfigResponse } from "@/lib/api";

export function TopBar() {
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
        <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-text-primary mb-1 tracking-[-0.02em]">
          Good morning, {profile?.name.split(' ')[0] || "Operator"} <span className="inline-block origin-bottom hover:animate-wave">👋</span>
        </h1>
        <p className="text-text-secondary text-[15px] flex items-center gap-2">
          Managing <span className="font-semibold text-solo-blue underline underline-offset-4 decoration-solo-blue/30">{profile?.agency_name || "Soloist"}</span> • <span className="font-medium text-text-primary">3 new opportunities today</span>
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
