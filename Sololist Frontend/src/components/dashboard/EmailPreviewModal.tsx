"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, RefreshCcw, Copy, Check, Loader2 } from "lucide-react";
import { draftEmail, getProfile, UserConfigResponse } from "@/lib/api";
import { toast } from "sonner";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Label for what triggered this email, e.g. "invoice_unpaid" */
  triggerType?: string;
  /** Human-readable context sentence, e.g. "Client has an unpaid invoice after 3 days" */
  context?: string;
  /** Initial tone — can be changed inside the modal */
  tone?: string;
  /** Recipient label shown in the To: field */
  recipientLabel?: string;
  /** The actual client name to personalise the email */
  clientName?: string;
  /** Project name passed to the AI */
  project?: string;
}

const TONES = ["professional", "friendly", "firm"] as const;
type Tone = typeof TONES[number];

export function EmailPreviewModal({
  isOpen,
  onOpenChange,
  context = "",
  triggerType = "",
  tone: initialTone = "professional",
  recipientLabel = "[Client]",
  clientName = "Client",
  project = "current project",
}: EmailPreviewModalProps) {
  const [activeTone, setActiveTone] = useState<Tone>(initialTone as Tone);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const fetchDraft = async (tone: Tone = activeTone) => {
    try {
      setIsLoading(true);
      setBody("");
      setSubject("");

      // Build a rich context string so the AI knows what this email is about
      const richContext = [
        context,
        triggerType ? `Trigger: ${triggerType.replace(/_/g, " ")}` : "",
        `Tone: ${tone}`,
      ].filter(Boolean).join(". ");

      const data = await draftEmail({
        client_name: clientName,
        client_email: recipientLabel,
        project,
        tone,
        context: richContext,
      });

      setSubject(data.subject);
      setBody(data.body);
    } catch (e) {
      console.error(e);
      toast.error("Failed to draft email");

      const firstName = profile?.name?.split(" ")[0] || "there";
      const niche = profile?.niche || "specialist";
      setSubject(`Quick update on our ${project}`);
      setBody(
        `Hi ${clientName.split(" ")[0] || "there"},\n\nI hope your week is going well! I wanted to reach out regarding "${project}".\n\n${context}\n\nPlease let me know if you have any questions.\n\nBest,\n${firstName}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTone(initialTone as Tone);
      fetchDraft(initialTone as Tone);
    }
  }, [isOpen]);

  // Re-fetch whenever tone changes inside the modal
  const handleToneChange = (tone: Tone) => {
    setActiveTone(tone);
    fetchDraft(tone);
  };

  const handleCopy = async () => {
    const full = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px] p-0 overflow-hidden border-border-tertiary bg-white shadow-2xl rounded-[24px]">
        {/* HEADER */}
        <DialogHeader className="px-8 pt-8 pb-5 border-b border-border-tertiary bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-solo-blue font-serif text-[22px] font-bold tracking-tight">
              <Sparkles className="w-5 h-5" />
              AI-Drafted Email Preview
            </div>
            {!isLoading && body && (
              <button
                onClick={() => fetchDraft()}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-text-tertiary hover:text-solo-blue transition-colors"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            )}
          </div>
          <DialogDescription className="text-[13px] font-medium text-text-secondary mt-1">
            Based on your automation settings — edit freely before using.
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="px-8 py-6 flex flex-col gap-5 bg-background-secondary/20 max-h-[70vh] overflow-y-auto">

          {/* EMAIL CARD */}
          <div className="bg-white rounded-[16px] border border-border-tertiary shadow-sm overflow-hidden">

            {/* HEADER ROW */}
            <div className="px-6 py-4 border-b border-border-tertiary bg-background-secondary/30 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-text-tertiary w-16 shrink-0">To:</span>
                <span className="text-[13px] font-bold text-text-primary truncate">{recipientLabel}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-text-tertiary w-16 shrink-0">Subject:</span>
                {isLoading ? (
                  <div className="h-4 w-48 bg-border-tertiary rounded animate-pulse" />
                ) : (
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 text-[13px] font-bold text-text-primary bg-transparent border-none outline-none focus:ring-0 placeholder:text-text-tertiary"
                    placeholder="Subject line..."
                  />
                )}
              </div>
            </div>

            {/* BODY */}
            <div className="p-6 min-h-[180px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-solo-blue" />
                  <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-text-tertiary animate-pulse">
                    Drafting with AI...
                  </span>
                </div>
              ) : (
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="resize-none w-full min-h-[160px] bg-transparent border-none shadow-none outline-none focus-visible:ring-0 text-[14px] font-medium leading-relaxed text-text-primary p-0 placeholder:text-text-tertiary"
                  placeholder="Email body will appear here..."
                />
              )}
            </div>
          </div>

          {/* TONE + ACTIONS ROW */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-tertiary">Tone</span>
              <div className="flex items-center gap-1 p-1 bg-white rounded-full border border-border-tertiary shadow-sm">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleToneChange(t)}
                    disabled={isLoading}
                    className={`h-7 px-4 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50 ${
                      activeTone === t
                        ? "bg-solo-blue text-white shadow-md"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {t} {activeTone === t && "✓"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={isLoading || !body}
                className="flex-1 sm:flex-none border-border-tertiary text-text-primary bg-white text-[12px] font-bold h-10 px-5 rounded-full"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-solo-teal" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-solo-blue hover:bg-solo-blue/90 text-white text-[12px] font-bold h-10 px-6 rounded-full shadow-sm"
              >
                Use This Draft
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
