"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bookmark, Target, Sparkles, Loader2, Radar as RadarIcon, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getOpportunities, OpportunityResponse, draftProposal, getProfile, UserConfigResponse } from "@/lib/api";
import { toast } from "sonner";
import { ProposalDrawer } from "./ProposalDrawer";
import { Skeleton } from "@/components/ui/skeleton";

export function OpportunityRadar() {
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScouting, setIsScouting] = useState(false);
  const [profile, setProfile] = useState<UserConfigResponse | null>(null);
  const prevNiche = useRef<string | null>(null);

  const loadData = async (showScouting = false) => {
    if (showScouting) setIsScouting(true);
    try {
      const [opps, prof] = await Promise.all([getOpportunities(), getProfile()]);
      setOpportunities(opps);
      setProfile(prof);
      
      // If niche changed in the background, we might need a second fetch in a bit 
      // since the background task is async.
      if (prevNiche.current && prevNiche.current !== prof.niche) {
         toast.info(`Soloist AI is scouting for ${prof.niche} opportunities...`);
         setTimeout(async () => {
            const freshOpps = await getOpportunities();
            setOpportunities(freshOpps);
            setIsScouting(false);
         }, 3000);
      }
      prevNiche.current = prof.niche;
    } catch (error) {
      console.error("Failed to fetch radar data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Simple polling to catch background scouting results
    const interval = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !isScouting) return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass bg-white/40 backdrop-blur-xl rounded-[24px] p-7 border border-white/20 w-[400px] shrink-0">
             <div className="flex justify-between mb-5">
               <Skeleton className="h-6 w-24 rounded-full" />
               <Skeleton className="h-6 w-16" />
             </div>
             <div className="space-y-4">
               <Skeleton className="h-7 w-full" />
               <div className="flex gap-3">
                 <Skeleton className="h-5 w-20" />
                 <Skeleton className="h-5 w-32" />
               </div>
               <Skeleton className="h-14 w-full" />
               <div className="flex gap-3 pt-4">
                 <Skeleton className="h-11 flex-1 rounded-full" />
                 <Skeleton className="h-11 flex-1 rounded-full" />
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mb-12 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-[26px] font-bold text-text-primary flex items-center gap-3 tracking-tight">
          <div className="relative">
            <Target className="w-7 h-7 text-solo-blue" />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-solo-blue/20 rounded-full"
            />
          </div>
          {profile?.niche || "Freelance"} Gig Radar
        </h2>
        <div className="flex items-center gap-6">
           {isScouting && (
             <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-solo-blue animate-pulse">
               <RadarIcon className="w-3.5 h-3.5 animate-spin" /> Scouting Gigs...
             </div>
           )}
           <button className="text-[13px] font-bold uppercase tracking-widest text-text-tertiary hover:text-solo-blue transition-colors flex items-center gap-2 group">
             Radar Config
             <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
           </button>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-6">
        <div className="flex w-max space-x-6 px-1">
          <AnimatePresence mode="popLayout">
            {opportunities.map((opp, index) => (
              <motion.div
                key={opp.id}
                layout
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.05,
                  ease: [0.23, 1, 0.32, 1] 
                }}
                className="glass bg-white/40 backdrop-blur-xl rounded-[24px] p-7 border border-white/20 hover:border-solo-blue/40 hover:shadow-2xl hover:shadow-solo-blue/5 transition-all group w-[400px] shrink-0 flex flex-col relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-solo-blue/5 to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex flex-col gap-2">
                    <div className={cn(
                      "px-3 py-1 rounded-full flex items-center shadow-sm w-fit bg-opacity-10 border border-opacity-20",
                      opp.badge_color === "bg-solo-coral" ? "bg-solo-coral border-solo-coral" :
                      opp.badge_color === "bg-solo-teal" ? "bg-solo-teal border-solo-teal" :
                      opp.badge_color === "bg-solo-blue" ? "bg-solo-blue border-solo-blue" :
                      "bg-solo-indigo border-solo-indigo"
                    )}>
                      <Sparkles className={cn("w-3 h-3 mr-1.5", opp.badge_text)} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", opp.badge_text)}>
                        {opp.match_score}% Strategic Fit
                      </span>
                    </div>
                    {opp.verified && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-solo-blue/5 border border-solo-blue/10 rounded-full w-fit">
                        <CheckCircle2 className="w-3 h-3 text-solo-blue" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-solo-blue/80">Source Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.15em] text-text-tertiary bg-white/80 px-3 py-1.5 rounded-lg border border-border-tertiary/50 backdrop-blur-md">
                    {opp.source}
                  </div>
                </div>

                <div className="mb-auto relative z-10">
                  <h3 className="font-serif text-[20px] font-bold text-text-primary whitespace-normal leading-tight mb-3 group-hover:text-solo-blue transition-colors tracking-tight">
                    {opp.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[15px] font-serif font-bold text-text-primary">
                      {opp.budget}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-text-tertiary/40" />
                    <span className="text-[12px] font-bold text-text-tertiary uppercase tracking-widest">
                       Project Posted {opp.posted_at}
                    </span>
                  </div>

                  <p className="text-[13px] text-text-secondary whitespace-normal line-clamp-2 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {opp.description}
                  </p>
                </div>

                <div className="mt-8 flex gap-3 relative z-10">
                  <ProposalDrawer opportunity={opp}>
                    <Button 
                      className="flex-1 bg-white text-solo-blue border border-solo-blue/20 rounded-full h-11 text-[13px] font-extrabold tracking-wide transition-all hover:bg-solo-blue hover:text-white shadow-sm"
                    >
                      Draft Proposal
                    </Button>
                  </ProposalDrawer>

                  <Button 
                    onClick={() => opp.url && window.open(opp.url, "_blank")}
                    className="flex-1 bg-solo-blue text-white rounded-full h-11 text-[13px] font-extrabold tracking-wide transition-all hover:scale-[1.02] shadow-lg shadow-solo-blue/20"
                  >
                     Submit Bid <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>

                  <Button variant="ghost" size="icon" className="h-11 w-11 border border-border-tertiary rounded-full text-text-secondary hover:bg-white hover:text-solo-blue transition-all">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
