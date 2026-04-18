"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProposalDrawer } from "./ProposalDrawer";
import { ChevronDown, Bookmark, EyeOff, Loader2 } from "lucide-react";
import { getOpportunities, OpportunityResponse } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Track saved/hidden state client-side since backend has no per-user status
type LocalStatus = "new" | "saved" | "applied" | "hidden";
type LocalOpp = OpportunityResponse & { localStatus: LocalStatus };

export function OpportunityFeed() {
  const [opportunities, setOpportunities] = useState<LocalOpp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"All" | "Top Matches" | "Saved" | "Applied">("All");
  const [activePlatform, setActivePlatform] = useState<string>("All");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const data = await getOpportunities();
        setOpportunities(data.map(o => ({ ...o, localStatus: "new" as LocalStatus })));
      } catch (e) {
        console.error("Failed to load opportunities", e);
        toast.error("Could not load opportunities — backend may be offline.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  const filteredItems = useMemo(() => {
    return opportunities.filter(item => {
      if (item.localStatus === "hidden") return false;
      const matchesTab = activeTab === "All" ||
        (activeTab === "Top Matches" && item.match_score >= 90) ||
        (activeTab === "Saved" && item.localStatus === "saved") ||
        (activeTab === "Applied" && item.localStatus === "applied");
      const matchesPlatform = activePlatform === "All" || item.platform === activePlatform;
      return matchesTab && matchesPlatform;
    });
  }, [opportunities, activeTab, activePlatform]);

  const handleSave = (id: number) => {
    setOpportunities(prev => prev.map(o =>
      o.id === id ? { ...o, localStatus: (o.localStatus === "saved" ? "new" : "saved") as LocalStatus } : o
    ));
    const isSaved = opportunities.find(o => o.id === id)?.localStatus === "saved";
    toast.info(isSaved ? "Removed from saved" : "Opportunity saved to your radar!");
  };

  const handleHide = (id: number) => {
    setOpportunities(prev => prev.map(o =>
      o.id === id ? { ...o, localStatus: "hidden" as LocalStatus } : o
    ));
    toast.success("Opportunity hidden");
  };

  if (isLoading) return (
    <div className="flex flex-col gap-4">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-[16px] border border-border-tertiary shadow-sm p-6 space-y-4">
          <div className="flex justify-between"><Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-20" /></div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-48" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* FILTER BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-border-tertiary pb-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 text-[13px] font-bold uppercase tracking-widest text-text-secondary pr-4">
          {["All", "Top Matches", "Saved", "Applied"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 shrink-0 transition-all ${activeTab === tab ? "text-solo-blue border-b-2 border-solo-blue" : "hover:text-text-primary border-b-2 border-transparent"}`}
            >
              {tab} ({
                tab === "All" ? opportunities.filter(o => o.localStatus !== "hidden").length :
                tab === "Top Matches" ? opportunities.filter(o => o.match_score >= 90 && o.localStatus !== "hidden").length :
                tab === "Saved" ? opportunities.filter(o => o.localStatus === "saved").length :
                opportunities.filter(o => o.localStatus === "applied").length
              })
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="text-[12px] font-bold text-text-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            Sort: Best Match <ChevronDown className="w-3.5 h-3.5" />
          </button>
          
          <div className="w-[1px] h-4 bg-border-tertiary hidden sm:block" />
          
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {["All", "Upwork", "LinkedIn", "Reddit", "Indie Hackers"].map((platform) => (
              <Badge 
                key={platform}
                onClick={() => setActivePlatform(platform)}
                variant="outline" 
                className={`rounded-full text-[10px] uppercase tracking-widest px-3 cursor-pointer transition-all ${
                  activePlatform === platform 
                    ? "bg-text-primary text-white border-transparent" 
                    : "bg-white text-text-secondary hover:text-text-primary border-border-tertiary"
                }`}
              >
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* FEED */}
      <div className="flex flex-col gap-4 min-min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-[16px] border ${item.match_score >= 95 ? "border-solo-blue/20" : "border-border-tertiary"} shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300`}
              >
                {item.match_score >= 95 && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-solo-blue" />}
                <div className={`p-6 ${item.match_score >= 95 ? "pl-8" : ""}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={`${item.platform === 'Upwork' ? 'bg-blue-500' : item.platform === 'LinkedIn' ? 'bg-indigo-500' : item.platform === 'Reddit' ? 'bg-orange-500' : 'bg-amber-500'} text-white rounded-full text-[10px] font-bold uppercase tracking-widest px-2.5 shadow-sm`}>
                        {item.platform}
                      </Badge>
                      <span className="text-[14px] font-bold text-text-primary">{item.title}</span>
                    </div>
                    <Badge className={`bg-solo-teal/10 text-solo-teal border border-solo-teal/20 rounded-full text-[11px] font-bold uppercase tracking-widest px-2.5 shadow-sm shrink-0`}>
                      {item.match_score}% Match
                    </Badge>
                  </div>
                  
                  <div className="text-[12px] font-semibold text-text-tertiary mb-3 flex items-center gap-1.5">
                    <span className="text-text-secondary">{item.company}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>

                  <p className="text-[13px] text-text-secondary font-medium leading-relaxed mb-4 max-w-3xl line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <Badge variant="outline" className="text-text-primary font-bold border-border-tertiary bg-background-secondary text-[11px] uppercase tracking-wider rounded-[6px]">
                      {item.budget ?? item.rate ?? "Rate TBD"}
                    </Badge>
                    <Badge variant="outline" className="text-text-primary font-bold border-border-tertiary bg-background-secondary text-[11px] uppercase tracking-wider rounded-[6px]">
                      {item.platform ?? item.source}
                    </Badge>
                    <Badge variant="outline" className="text-text-primary font-bold border-border-tertiary bg-background-secondary text-[11px] uppercase tracking-wider rounded-[6px]">
                      Remote
                    </Badge>
                  </div>

                  <hr className="border-border-tertiary mb-4" />

                  <div className="flex items-center gap-3">
                    <ProposalDrawer opportunity={item}>
                       <Button className="bg-solo-blue hover:bg-solo-blue/90 text-white shadow-sm text-[12px] font-bold h-9 active:scale-95 transition-all">
                         Draft Proposal
                       </Button>
                    </ProposalDrawer>
                    <Button
                      onClick={() => handleSave(item.id)}
                      variant="ghost"
                      className={`border border-border-tertiary bg-white shadow-sm h-9 text-[12px] font-bold active:scale-95 transition-all ${item.localStatus === 'saved' ? 'text-solo-blue border-solo-blue/30 bg-solo-blue/5' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${item.localStatus === 'saved' ? 'fill-solo-blue' : ''}`} /> {item.localStatus === 'saved' ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      onClick={() => handleHide(item.id)}
                      variant="ghost"
                      className="text-text-tertiary hover:text-text-secondary h-9 px-3 text-[12px] font-bold ml-auto active:scale-95 transition-all"
                    >
                      <EyeOff className="w-3.5 h-3.5 mr-1.5" /> Hide
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-background-secondary/50 rounded-[20px] border border-dashed border-border-tertiary">
               <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                  <ChevronDown className="w-6 h-6 text-text-tertiary rotate-180" />
               </div>
               <h3 className="text-[16px] font-serif font-bold text-text-primary">No opportunities found</h3>
               <p className="text-[13px] font-medium text-text-tertiary mt-1">Try adjusting your platform filters or tabs.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
