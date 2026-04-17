"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCcw } from "lucide-react";
import { draftEmail, getProfile, UserConfigResponse } from "@/lib/api";
import { toast } from "sonner";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  context?: string;
  tone?: string;
}

export function EmailPreviewModal({ isOpen, onOpenChange, context = "", tone = "professional" }: EmailPreviewModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
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

  const fetchDraft = async () => {
    try {
      setIsLoading(true);
      const data = await draftEmail({
        client_name: "Client",
        client_email: "",
        project: "current project",
        tone: tone,
        context: context,
      });
      
      setSubject(data.subject);
      setBody(data.body);
    } catch (e) {
      console.error(e);
      toast.error("Failed to draft email");
      
      // Dynamic fallback
      const firstName = profile?.name?.split(' ')[0] || "Daksh";
      const niche = profile?.niche || "specialist";
      setSubject(`Quick update on our ${context || 'project'}`);
      setBody(`Hi there,\n\nI hope your week is going well! I'm reaching out as a ${niche} to give you a quick update on the project.\n\nLet me know if you have any questions.\n\nBest,\n${firstName}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDraft();
    }
  }, [isOpen, tone, context]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 overflow-hidden border-border-tertiary bg-white shadow-2xl">
        <DialogHeader className="p-8 pb-4 border-b border-border-tertiary">
          <div className="flex items-center gap-2 text-solo-blue font-serif text-[24px] font-bold tracking-tight">
            <Sparkles className="w-5 h-5" /> AI-Drafted Email Preview
          </div>
          <DialogDescription className="text-[13px] font-medium text-text-secondary">
            Generated based on your tone settings and client context.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 bg-background-secondary/30">
          {/* EMAIL CARD */}
          <div className="bg-white rounded-[16px] border border-border-tertiary shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border-tertiary bg-background-secondary/20">
              <div className="flex gap-4 mb-2">
                <span className="text-[12px] font-bold uppercase tracking-widest text-text-tertiary w-16">To:</span>
                <span className="text-[13px] font-bold text-text-primary">sarah@stripe.com</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[12px] font-bold uppercase tracking-widest text-text-tertiary w-16">Subject:</span>
                <span className="text-[13px] font-bold text-text-primary">{isLoading ? "Drafting..." : subject}</span>
              </div>
            </div>

            <div className="p-8 text-[14px] font-medium leading-relaxed text-text-primary space-y-4 whitespace-pre-wrap">
               {isLoading ? "Generating email content..." : body}
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex flex-col gap-2">
               <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary">Tone Settings</span>
               <div className="flex items-center gap-2 p-1 bg-background-secondary rounded-full border border-border-tertiary self-start">
                  <Button variant="ghost" size="sm" className={`h-7 px-4 text-[11px] font-bold uppercase tracking-widest rounded-full ${tone === 'professional' ? 'bg-white shadow-sm text-solo-blue' : 'text-text-secondary hover:text-text-primary'}`}>
                    Professional {tone==='professional' && '✓'}
                  </Button>
                  <Button variant="ghost" size="sm" className={`h-7 px-4 text-[11px] font-bold uppercase tracking-widest rounded-full ${tone === 'friendly' ? 'bg-white shadow-sm text-solo-blue' : 'text-text-secondary hover:text-text-primary'}`}>
                    Friendly {tone==='friendly' && '✓'}
                  </Button>
                  <Button variant="ghost" size="sm" className={`h-7 px-4 text-[11px] font-bold uppercase tracking-widest rounded-full ${tone === 'firm' ? 'bg-white shadow-sm text-solo-blue' : 'text-text-secondary hover:text-text-primary'}`}>
                    Firm {tone==='firm' && '✓'}
                  </Button>
                </div>
             </div>

             <div className="flex items-center gap-3 w-full md:w-auto">
               <Button variant="ghost" className="flex-1 md:flex-none text-[12px] font-bold text-text-secondary" disabled={isLoading} onClick={fetchDraft}>
                 <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Regenerate
               </Button>
               <Button className="flex-1 md:flex-none bg-solo-blue hover:bg-solo-blue/90 text-white shadow-sm text-[12px] font-bold h-10 px-8" onClick={() => onOpenChange(false)}>
                 Looks good — use this
               </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
