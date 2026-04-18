"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailPreviewModal } from "./EmailPreviewModal";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { createAutomation } from "@/lib/api";

interface AutomationBuilderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAutomationAdded?: () => void;
}

export function AutomationBuilder({ isOpen, onOpenChange, onAutomationAdded }: AutomationBuilderProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "Invoice Reminder — 3 Day",
    trigger_type: "invoice_unpaid",
    action_type: "email",
    delay_days: 3,
    tone: "professional",
    conditions: ["client_active"]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCondition = (val: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(val) 
        ? prev.conditions.filter(c => c !== val)
        : [...prev.conditions, val]
    }));
  };

  const handleSave = async (activate: boolean) => {
    try {
       setIsSubmitting(true);
       const triggerName = formData.trigger_type.replace(/_/g, ' ');
       const actionName = formData.action_type.replace(/_/g, ' ');
       
       const conditionsObj = formData.conditions.reduce((acc, curr) => {
         acc[curr] = true;
         return acc;
       }, {} as Record<string, boolean>);

       await createAutomation({
         name: formData.name + (activate ? "" : " (Draft)"),
         trigger: triggerName,
         action: actionName,
         trigger_type: formData.trigger_type,
         action_type: formData.action_type,
         delay_days: formData.delay_days,
         tone: formData.tone,
         conditions: conditionsObj,
       });
       toast.success(activate ? "Automation saved and activated!" : "Automation saved as draft");
       onOpenChange(false);
       if (onAutomationAdded) onAutomationAdded();
    } catch (e) {
       console.error(e);
       toast.error("Failed to save automation");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[500px] p-0 border-l border-border-tertiary bg-background-primary flex flex-col h-screen right-0" data-lenis-prevent>
          <SheetHeader className="p-8 pb-4 border-b border-border-tertiary bg-white sticky top-0 z-10 shrink-0 shadow-sm">
            <SheetTitle className="font-serif text-[26px] font-bold text-text-primary tracking-tight">
              Build New Automation
            </SheetTitle>
            <SheetDescription className="text-[13px] font-medium text-text-secondary leading-relaxed pt-1">
              Describe a rule. Soloist will run it automatically.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto no-scrollbar" data-lenis-prevent>
            <div className="p-8 flex flex-col gap-10">
              {/* STEP 1: TRIGGER */}
              <div className="flex flex-col gap-5 relative">
                <div className="absolute -left-8 top-0 bottom-0 w-[4px] bg-solo-blue rounded-r-full" />
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-solo-blue">
                    Step 1 — Trigger
                  </span>
                  <h4 className="text-[14px] font-bold text-text-primary">WHEN THIS HAPPENS...</h4>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-white border border-border-tertiary rounded-[12px] p-4 shadow-sm">
                    <select 
                      value={formData.trigger_type}
                      onChange={(e) => setFormData({...formData, trigger_type: e.target.value})}
                      className="w-full bg-transparent text-[13px] font-semibold text-text-primary focus:outline-none cursor-pointer"
                    >
                      <option value="invoice_unpaid">Invoice is unpaid after X days</option>
                      <option value="meeting_ended">Google Meet ends</option>
                      <option value="test_fails">GitHub Action / Cypress suite fails</option>
                      <option value="github_pr_merged">Client merges my PR</option>
                      <option value="new_client">New QA/Dev client added</option>
                      <option value="project_complete">Testing suite complete</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 pl-4 border-l-2 border-border-tertiary/30 py-1">
                    <span className="text-[13px] font-medium text-text-secondary">After</span>
                    <Input 
                      type="number" 
                      value={formData.delay_days}
                      onChange={(e) => setFormData({...formData, delay_days: parseInt(e.target.value) || 0})}
                      className="w-[80px] h-9 bg-white text-center font-bold" 
                    />
                    <span className="text-[13px] font-medium text-text-secondary">days</span>
                  </div>
                </div>
              </div>

              {/* STEP 2: ACTION */}
              <div className="flex flex-col gap-5 relative">
                <div className="absolute -left-8 top-0 bottom-0 w-[4px] bg-solo-teal rounded-r-full" />
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-solo-teal">
                    Step 2 — Action
                  </span>
                  <h4 className="text-[14px] font-bold text-text-primary">DO THIS...</h4>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-white border border-border-tertiary rounded-[12px] p-4 shadow-sm">
                    <select 
                      value={formData.action_type}
                      onChange={(e) => setFormData({...formData, action_type: e.target.value})}
                      className="w-full bg-transparent text-[13px] font-semibold text-text-primary focus:outline-none cursor-pointer"
                    >
                      <option value="email">Send email (AI-drafted)</option>
                      <option value="sync_notion">Transcribe Meet & Push to Notion</option>
                      <option value="add_calendar">Add Event to Google Calendar</option>
                      <option value="sync_jira">Sync Bug Report to JIRA & Slack</option>
                      <option value="generate_proposal">Draft customized QA Proposal</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-4 pl-4 border-l-2 border-border-tertiary/30">
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] font-medium text-text-secondary w-16">To:</span>
                      <select className="flex-1 bg-white border border-border-tertiary h-9 px-3 rounded-md text-[13px] font-semibold">
                        <option>[Client]</option>
                        <option>All Stakeholders</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] font-medium text-text-secondary w-16">Tone:</span>
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                        <button 
                          onClick={() => setFormData({...formData, tone: 'professional'})}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${formData.tone === 'professional' ? 'bg-solo-blue/10 border border-solo-blue/20 text-solo-blue' : 'bg-background-secondary border border-border-tertiary text-text-tertiary hover:text-text-primary'}`}
                        >
                          Professional
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, tone: 'friendly'})}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${formData.tone === 'friendly' ? 'bg-solo-blue/10 border border-solo-blue/20 text-solo-blue' : 'bg-background-secondary border border-border-tertiary text-text-tertiary hover:text-text-primary'}`}
                        >
                          Friendly
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, tone: 'firm'})}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${formData.tone === 'firm' ? 'bg-solo-blue/10 border border-solo-blue/20 text-solo-blue' : 'bg-background-secondary border border-border-tertiary text-text-tertiary hover:text-text-primary'}`}
                        >
                          Firm
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsPreviewOpen(true)}
                      className="flex items-center gap-2 text-solo-teal text-[12px] font-bold hover:underline self-start bg-solo-teal/5 px-2 py-1 rounded"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Preview AI-drafted email
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 3: CONDITIONS */}
              <div className="flex flex-col gap-5 relative group">
                <div className="absolute -left-8 top-0 bottom-0 w-[4px] bg-solo-amber rounded-r-full" />
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-solo-amber">
                    Step 3 — Conditions (Optional)
                  </span>
                  <h4 className="text-[14px] font-bold text-text-primary">ONLY IF...</h4>
                </div>

                <div className="flex flex-col gap-3 pl-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.conditions.includes('client_active')}
                      onChange={() => toggleCondition('client_active')}
                      className="w-4 h-4 rounded border-border-tertiary accent-solo-blue" 
                    />
                    <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">Client is Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.conditions.includes('amount_500')}
                      onChange={() => toggleCondition('amount_500')}
                      className="w-4 h-4 rounded border-border-tertiary accent-solo-blue" 
                    />
                    <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">Invoice amount &gt; $500</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.conditions.includes('first_rem')}
                      onChange={() => toggleCondition('first_rem')}
                      className="w-4 h-4 rounded border-border-tertiary accent-solo-blue" 
                    />
                    <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">First reminder only (don&apos;t repeat)</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Name this automation</label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-11 bg-white border-border-tertiary font-bold text-[15px] focus-visible:ring-solo-blue/20 focus-visible:border-solo-blue" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 mb-2">
                    <Button 
                      disabled={isSubmitting}
                      className="bg-solo-blue hover:bg-solo-blue/90 text-white font-bold h-11 shadow-sm transition-all active:scale-95" 
                      onClick={() => handleSave(true)}
                    >
                      Save & Activate
                    </Button>
                    <Button 
                      disabled={isSubmitting}
                      variant="ghost" 
                      className="border border-border-tertiary bg-white text-text-primary font-bold h-11 shadow-sm hover:bg-background-secondary transition-all active:scale-95"
                      onClick={() => handleSave(false)}
                    >
                      Save as Draft
                    </Button>
                </div>
                <button disabled={isSubmitting} onClick={() => onOpenChange(false)} className="text-[13px] font-bold text-text-tertiary hover:text-solo-coral transition-colors text-center pb-8 underline decoration-current underline-offset-4 disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        triggerType={formData.trigger_type}
        context={`Client has an unpaid invoice after ${formData.delay_days} days. Send a ${formData.tone} follow-up email to prompt payment.`}
        tone={formData.tone}
        recipientLabel="[Client Email]"
        clientName="[Client Name]"
        project="active project"
      />
    </>
  );
}
