"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, Target, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getOpportunities, OpportunityResponse, draftProposal, getProfile, UserConfigResponse } from "@/lib/api";
import { toast } from "sonner";
import { ProposalDrawer } from "./ProposalDrawer";

export function OpportunityRadar() {
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDraftingId, setIsDraftingId] = useState<number | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<OpportunityResponse | null>(null);
  const [proposalDrawerOpen, setProposalDrawerOpen] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [profile, setProfile] = useState<UserConfigResponse | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [opps, prof] = await Promise.all([getOpportunities(), getProfile()]);
        setOpportunities(opps);
        setProfile(prof);
      } catch (error) {
        console.error("Failed to fetch radar data", error);
        toast.error("Could not load radar data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDraftProposal = async (opp: OpportunityResponse) => {
    try {
      setIsDraftingId(opp.id);
      toast.info(`AI is analyzing ${opp.company}'s requirements...`);
      
      const response = await draftProposal({
        job_title: opp.title,
        company: opp.company,
        platform: opp.source,
        rate: opp.budget || "",
        description: opp.description || "",
      });
      
      setGeneratedDraft(response.body);
      setSelectedOpp(opp);
      setProposalDrawerOpen(true);
      toast.success("AI Proposal drafted successfully!");
    } catch (error) {
      console.error("Failed to draft proposal", error);
      toast.error("AI drafting failed. Please try again.");
    } finally {
      setIsDraftingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[280px] mb-12 flex flex-col items-center justify-center text-text-tertiary glass rounded-[16px] border border-border-tertiary">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-solo-blue opacity-50" />
        <span className="text-[14px] font-medium tracking-wide">Scanning for new opportunities...</span>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-[24px] font-bold text-text-primary flex items-center gap-3">
          <Target className="w-6 h-6 text-solo-blue" /> Top {profile?.niche || "Agency"} Opportunities
        </h2>
        <button className="text-[13px] font-bold uppercase tracking-widest text-text-tertiary hover:text-solo-blue transition-colors flex items-center gap-1 group">
          View all 
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-6">
          {opportunities.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: "easeOut" }}
              className="glass bg-background-primary/40 rounded-[16px] p-6 border border-border-tertiary hover:border-solo-blue/30 transition-all group w-[380px] shrink-0 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded-full ${opp.badge_color}/10 border border-${opp.badge_color}/20 flex items-center`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${opp.badge_text}`}>
                    {opp.match_score}% Match
                  </span>
                </div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary bg-background-secondary px-2 py-1 rounded-md">
                  {opp.source}
                </div>
              </div>

              <h3 className="font-serif text-[18px] font-bold text-text-primary whitespace-normal leading-snug mb-3 group-hover:text-solo-blue transition-colors">
                {opp.title}
              </h3>
              
              <div className="text-[13px] font-medium text-text-secondary mb-1">
                {opp.budget}
              </div>
              <div className="text-[12px] text-text-tertiary mb-6">
                Posted {opp.posted_at}
              </div>

              <div className="mt-auto flex gap-3">
                <Button 
                  disabled={isDraftingId === opp.id}
                  onClick={() => handleDraftProposal(opp)}
                  className="flex-1 bg-transparent hover:bg-solo-blue/5 text-solo-blue border border-solo-blue/30 rounded-[8px] h-9 text-[13px] font-bold tracking-wide transition-all hover:scale-[1.02]"
                >
                  {isDraftingId === opp.id ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Drafting...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5 mr-2" /> Draft Proposal</>
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 border border-border-tertiary rounded-[8px] text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-all">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>

      {selectedOpp && (
        <ProposalDrawer 
          open={proposalDrawerOpen}
          setOpen={setProposalDrawerOpen}
          opportunity={selectedOpp}
          initialDraft={generatedDraft}
        />
      )}
    </div>
  );
}
