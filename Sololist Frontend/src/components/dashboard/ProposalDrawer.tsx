/**
 * ProposalDrawer — self-contained sheet that generates and shows an AI proposal.
 * Fixed: Now manages its own open state and accepts children as its trigger,
 * matching how OpportunityFeed.tsx wraps it around a button.
 */
"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, TriangleAlert, Copy, ExternalLink, Sparkles, Loader2, ChevronRight, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { draftProposal, getProfile, UserConfigResponse, OpportunityResponse } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface ProposalDrawerProps {
  opportunity: OpportunityResponse;
  children: React.ReactElement; // must be a single element for Base UI "render"
}

export function ProposalDrawer({ opportunity, children }: ProposalDrawerProps) {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<"professional" | "conversational">("professional");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserConfigResponse | null>(null);

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

  const handleOpen = async () => {
    setOpen(true);
    if (draft) return; // already fetched
    try {
      setIsLoading(true);
      const result = await draftProposal({
        job_title: opportunity.title,
        company: opportunity.company,
        platform: opportunity.platform,
        rate: opportunity.budget,
        description: opportunity.description,
        tone,
      });
      setDraft(result.body);
    } catch (e) {
      console.error(e);
      const userName = profile?.name || "Daksh Shrivastav";
      const niche = profile?.niche || "specialist";
      setDraft(
        `Hi ${opportunity.company} team,\n\nI came across your posting for "${opportunity.title}" and it's a strong match for my expertise as a ${niche}.\n\nI specialize in delivering high-quality results in this domain and have helped similar clients achieve their goals. I'm available to start immediately.\n\nRate: ${opportunity.budget}\n\nHappy to share relevant case studies — looking forward to connecting.\n\nBest,\n${userName}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    toast.success("Proposal copied to clipboard");
  };

  return (
    <>
      <span onClick={handleOpen} className="contents transition-all active:scale-[0.98]">
        {children}
      </span>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          className="w-full sm:max-w-[640px] p-0 border-l border-white/20 bg-white/70 backdrop-blur-3xl shadow-2xl flex flex-col h-full right-0 overflow-hidden no-scrollbar"
        >
          {/* HEADER */}
          <div className="p-10 border-b border-white/20 bg-white/40 sticky top-0 z-10 shrink-0">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 text-solo-blue font-serif text-[32px] font-bold mb-2 tracking-tight">
                <Wand2 className="w-7 h-7" /> AI Proposal Engine
              </div>
              <p className="text-[14px] font-medium text-text-secondary">
                Calibrating tone and expertise for <span className="text-text-primary font-bold">{opportunity.company}</span>.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-8 bg-white/80 p-6 rounded-[20px] border border-border-tertiary shadow-sm flex flex-col gap-1"
            >
              <div className="flex justify-between items-start">
                <span className="text-[16px] font-bold text-text-primary tracking-tight">
                  {opportunity.title}
                </span>
                <span className="text-[18px] font-serif font-bold text-solo-blue">
                  {opportunity.budget}
                </span>
              </div>
              <div className="text-[12px] font-bold uppercase tracking-widest text-text-tertiary">
                {opportunity.company} • {opportunity.platform}
              </div>
            </motion.div>
          </div>

          {/* BODY */}
          <div className="p-10 flex-1 flex flex-col gap-8 shrink-0 overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                <div className="relative">
                  <Loader2 className="w-10 h-10 animate-spin text-solo-blue" />
                  <Sparkles className="w-4 h-4 text-solo-coral absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-tertiary animate-pulse">
                  Analyzing Project Brief...
                </span>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col gap-6"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-solo-blue/20 to-solo-teal/20 rounded-[22px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="relative resize-none w-full min-h-[320px] bg-white border-border-tertiary rounded-[20px] text-[15px] leading-relaxed p-6 text-text-primary shadow-sm focus-visible:ring-solo-blue/20 focus-visible:border-solo-blue font-medium transition-all"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-background-secondary p-1.5 rounded-full border border-border-tertiary">
                    {(["professional", "conversational"] as const).map((t) => (
                      <Button
                        key={t}
                        variant="ghost"
                        size="sm"
                        onClick={() => setTone(t)}
                        className={`h-8 px-5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${
                          tone === t
                            ? "bg-white shadow-md text-solo-blue"
                            : "text-text-tertiary hover:text-text-primary"
                        }`}
                      >
                        {t} {tone === t && "✓"}
                      </Button>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
                    {draft.split(/\s+/).filter(Boolean).length} tokens consumed
                  </span>
                </div>
              </motion.div>
            )}

            {/* STRATEGIC INSIGHTS */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-solo-teal/5 border border-solo-teal/10 rounded-[20px] p-6 shadow-sm"
            >
              <h4 className="text-[12px] font-bold text-text-primary tracking-[0.1em] uppercase mb-5 flex items-center gap-2">
                Strategic Match Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-solo-teal/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-solo-teal" />
                  </div>
                  <span className="text-[13px] text-text-secondary font-medium leading-snug">
                    <span className="font-bold text-text-primary">High Relevance:</span> matches your {profile?.niche || "niche"} skillset.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-solo-blue/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-solo-blue" />
                  </div>
                  <span className="text-[13px] text-text-secondary font-medium leading-snug">
                    <span className="font-bold text-text-primary">AI Confidence:</span> {opportunity.match_score}% match for budget/scope.
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FOOTER */}
          <div className="p-8 border-t border-white/20 bg-white/40 sticky bottom-0 z-10 flex items-center justify-between shrink-0">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-text-tertiary hover:text-text-primary text-[14px] font-bold"
            >
              Discard Draft
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={isLoading}
                className="border-border-tertiary text-text-primary bg-white/80 hover:bg-white shadow-sm text-[14px] font-bold h-12 px-6 rounded-full transition-all whitespace-nowrap"
              >
                <Copy className="w-4 h-4 mr-2 opacity-60" /> Copy
              </Button>
              <Button
                onClick={() => {
                  toast.success("Ready to submit proposal via " + opportunity.platform);
                  if (opportunity.url) {
                    window.open(opportunity.url, "_blank");
                  }
                }}
                className="bg-solo-blue hover:bg-solo-blue/90 text-white shadow-xl shadow-solo-blue/20 text-[14px] font-bold h-12 px-8 rounded-full transition-all hover:scale-[1.02] flex items-center gap-2 group whitespace-nowrap"
              >
                Submit Proposal <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
