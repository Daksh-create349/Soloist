import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertTriangle, Copy, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { OpportunityResponse } from "@/lib/api";

interface ProposalDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  opportunity: OpportunityResponse;
  initialDraft: string;
}

export function ProposalDrawer({ open, setOpen, opportunity, initialDraft }: ProposalDrawerProps) {
  const [tone, setTone] = useState<"professional" | "conversational">("professional");
  
  const handleCopy = () => {
    navigator.clipboard.writeText(initialDraft);
    toast.success("Proposal copied to clipboard");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-[560px] p-0 border-l border-border-tertiary bg-background-primary flex flex-col h-full right-0 overflow-y-auto no-scrollbar" data-lenis-prevent>
        <div className="p-8 border-b border-border-tertiary bg-white sticky top-0 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 text-solo-blue font-serif text-[24px] font-bold mb-2 tracking-tight">
            <Sparkles className="w-5 h-5" /> AI Proposal Draft
          </div>
          <p className="text-[13px] font-medium text-text-secondary">
            Customized for your niche profile and this specific role.
          </p>

          <div className="mt-6 bg-background-secondary p-4 rounded-[12px] border border-border-tertiary shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[14px] font-bold text-text-primary tracking-tight">{opportunity.title}</span>
              <span className="text-[14px] font-serif font-bold text-text-primary">{opportunity.budget}</span>
            </div>
            <div className="text-[12px] font-medium text-text-secondary">
              {opportunity.company} via {opportunity.source}
            </div>
          </div>
        </div>

        <div className="p-8 flex-1 flex flex-col gap-6 shrink-0 bg-white">
          <div className="flex-1 flex flex-col min-h-[300px]">
            <Textarea 
              value={initialDraft}
              readOnly
              className="resize-none flex-1 min-h-64 bg-background-secondary border-border-tertiary rounded-[12px] text-[14px] leading-relaxed p-5 text-text-primary shadow-sm focus-visible:ring-solo-blue/20 focus-visible:border-solo-blue font-medium"
            />
            
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-background-secondary p-1 rounded-full border border-border-tertiary">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTone("professional")}
                  className={`h-7 px-3 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${tone === "professional" ? "bg-white shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
                >
                  Professional {tone === "professional" && "✓"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTone("conversational")}
                  className={`h-7 px-3 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${tone === "conversational" ? "bg-white shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
                >
                  Conversational {tone === "conversational" && "✓"}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
                  Word count: {initialDraft.split(/\s+/).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-solo-teal/5 border border-solo-teal/20 rounded-[12px] p-5 shadow-sm">
            <h4 className="text-[13px] font-bold text-text-primary tracking-tight mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-solo-teal" /> Why this is a {opportunity.match_score}% match
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-solo-teal mt-0.5 shrink-0" />
                <span className="text-[13px] text-text-primary font-medium"><span className="font-bold">Skill match:</span> AI detected strong relevance to your past projects</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-solo-teal mt-0.5 shrink-0" />
                <span className="text-[13px] text-text-primary font-medium"><span className="font-bold">Rate match:</span> {opportunity.budget} aligns with your expectations</span>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-solo-amber mt-0.5 shrink-0" />
                <span className="text-[13px] text-text-primary font-medium"><span className="font-bold">Capacity:</span> Verify your weekly availability before sending</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border-tertiary bg-white sticky bottom-0 z-10 flex items-center justify-between shrink-0">
          <Button variant="ghost" onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary text-[13px] font-bold tracking-wide">
            Close
          </Button>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleCopy}
              className="border-border-tertiary text-text-primary bg-white hover:bg-background-secondary shadow-sm text-[13px] font-bold h-10 px-4 active:scale-95 transition-all"
            >
               <Copy className="w-4 h-4 mr-2 text-text-secondary" /> Copy
            </Button>
            <Button 
              onClick={() => {
                toast.success("Ready to send via " + opportunity.source);
                window.open("https://google.com/search?q=" + encodeURIComponent(opportunity.company), "_blank");
              }}
              className="bg-solo-blue hover:bg-solo-blue/90 text-white shadow-sm text-[13px] font-bold h-10 px-6 active:scale-95 transition-all"
            >
               Apply via {opportunity.source} <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
