"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, CheckCircle2, Handshake, Sparkles, Receipt, Loader2, X } from "lucide-react";
import { ClientResponse, getIntelligence, draftEmail } from "@/lib/api";
import { toast } from "sonner";
import { ChatInterface } from "./ChatInterface";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NewInvoiceDrawer } from "./NewInvoiceDrawer";

interface ClientDetailProps {
  client: ClientResponse;
}

export function ClientDetail({ client }: ClientDetailProps) {
  const [intelligence, setIntelligence] = useState<any>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDraftingUpsell, setIsDraftingUpsell] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      try {
        setIsLoadingIntelligence(true);
        const data = await getIntelligence(client.name, client.project, client.healthScore);
        setIntelligence(data);
      } catch (error) {
        console.error("Failed to fetch intelligence", error);
      } finally {
        setIsLoadingIntelligence(false);
      }
    }
    fetchInsights();
  }, [client.id]);

  const handleDraftUpsell = async () => {
    if (!intelligence) return;
    setIsDraftingUpsell(true);
    try {
      const response = await draftEmail({
        recipient_name: client.name,
        company_name: client.company,
        tone: "professional",
        context: `Upsell opportunities for ${client.project} based on account signal: ${intelligence.upsell.signal}`
      });
      toast.success("AI Upsell draft generated in Chat Center");
      setIsChatOpen(true);
    } catch (e) {
      toast.error("Failed to generate upsell draft");
    } finally {
      setIsDraftingUpsell(false);
    }
  };

  return (
    <div key={client.id} data-lenis-prevent className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar relative z-10 px-8 py-10 md:px-12 md:py-12 bg-white">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-10"
      >
        <div className="flex items-start gap-6">
          <div className="relative pt-1">
            <Avatar className={`w-20 h-20 border-[3px] border-white shadow-sm ${client.avatarBg}`}>
              <AvatarFallback className="text-white text-[24px] font-bold tracking-widest bg-transparent">
                {client.initials}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${client.healthColor} border-2 border-white shadow-sm flex items-center justify-center`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <h1 className="font-serif text-[36px] font-bold text-text-primary leading-tight tracking-[-0.02em] mb-1">
              {client.name}
            </h1>
            <p className="text-[13px] font-bold tracking-widest text-text-secondary uppercase mb-4">
              {client.company}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`bg-background-secondary text-text-tertiary border border-border-tertiary text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-md flex items-center gap-1.5`}>
                <div className={`w-1.5 h-1.5 rounded-full ${client.healthColor}`} />
                {client.status}
              </span>
              <span className="bg-background-secondary text-text-tertiary border border-border-tertiary text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">
                {client.project}
              </span>
              <span className="bg-background-secondary text-text-tertiary border border-border-tertiary text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">
                Since {client.startDate}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => setIsChatOpen(true)}
                className="bg-solo-blue hover:bg-solo-blue/90 text-white rounded-[6px] h-9 px-5 text-[12px] font-bold shadow-sm transition-all hover:-translate-y-px active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Message
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleAction("New invoice generation")}
                className="bg-white border border-border-tertiary hover:bg-background-secondary text-text-primary rounded-[6px] h-9 px-5 text-[12px] font-bold shadow-sm transition-all active:scale-95"
              >
                <NewInvoiceIcon className="w-3.5 h-3.5 mr-2" /> New Invoice
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[16px] border border-border-tertiary shadow-sm shrink-0 min-w-[240px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
              Health Score
            </span>
            <div className={`w-2 h-2 rounded-full ${client.healthColor}`} />
          </div>
          <div className="font-serif text-[48px] font-bold text-text-primary leading-none tracking-tight mb-2 flex items-baseline gap-1">
            {client.healthScore} <span className="text-[16px] text-text-tertiary font-sans font-semibold">/100</span>
          </div>
          <div className="text-[12px] font-medium text-text-secondary leading-[1.6]">
            {client.healthScore > 80 ? "Engagement highly active.\nInvoices paid avg 2 days early." : client.healthScore > 50 ? "Stable metrics.\nRegular check-ins recommended." : "High churn risk detected.\nImmediate follow-up required."}
          </div>
        </div>
      </motion.div>

      {/* TABS SECTION */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col relative z-20">
        <TabsList className="bg-transparent border-b border-border-tertiary w-full justify-start h-auto rounded-none p-0 mb-8 gap-8">
          <TabsTrigger value="overview" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-solo-blue text-text-tertiary rounded-none border-b-2 border-transparent data-[state=active]:border-solo-blue px-0 pb-3 text-[13px] font-bold uppercase tracking-widest transition-all">
            Overview
          </TabsTrigger>
          <TabsTrigger value="communications" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-solo-blue text-text-tertiary rounded-none border-b-2 border-transparent data-[state=active]:border-solo-blue px-0 pb-3 text-[13px] font-bold uppercase tracking-widest transition-all">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="finances" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-solo-blue text-text-tertiary rounded-none border-b-2 border-transparent data-[state=active]:border-solo-blue px-0 pb-3 text-[13px] font-bold uppercase tracking-widest transition-all">
            Finances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 mt-0 outline-none">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* COLUMN 1: Project Pulse */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="bg-white p-6 rounded-[16px] border border-border-tertiary shadow-sm flex flex-col gap-6"
            >
              <h3 className="font-serif text-[20px] font-bold text-text-primary tracking-tight">
                Project Pulse
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-black/5 pb-3">
                  <span className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">Focus</span>
                  <span className="text-[13px] font-semibold text-text-primary">{client.project}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-3">
                  <span className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">Status</span>
                  <span className="bg-solo-blue/10 text-solo-blue text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                    Executing
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-3">
                  <span className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">Timeline</span>
                  <span className="text-[13px] font-semibold text-text-primary">Jan 15 → Apr 30</span>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Progress</span>
                  <span className="text-[12px] font-bold text-solo-blue">{client.progress}%</span>
                </div>
                <Progress value={client.progress} className="h-1.5 bg-background-secondary [&>div]:bg-solo-blue" />
              </div>

              <div className="bg-background-secondary rounded-[12px] p-5 mt-auto space-y-3">
                 <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-text-secondary">Gross Worth</span>
                  <span className="text-[15px] font-serif font-bold text-text-primary">{client.grossWorth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-text-secondary">Collected</span>
                  <span className="text-[15px] font-serif font-bold text-text-primary flex items-center gap-1.5">
                    {client.collected} <span className="bg-solo-teal/10 text-solo-teal px-1.5 py-0.5 rounded-sm font-sans font-bold text-[10px] uppercase tracking-wider">{client.collectedPercent}%</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* COLUMN 2: Latest Signals */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="bg-white p-6 rounded-[16px] border border-border-tertiary shadow-sm flex flex-col gap-6"
            >
              <h3 className="font-serif text-[20px] font-bold text-text-primary tracking-tight">
                Latest Signals
              </h3>
              
              <div className="relative pl-6 space-y-7 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[2px] before:bg-border-tertiary">
                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[calc(-29px-0.5rem)] w-5 h-5 rounded-full bg-white border-[2px] border-solo-teal flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-solo-teal" />
                  </div>
                  <div className="-mt-1">
                    <h4 className="text-[13px] font-bold text-text-primary mb-1">Invoice #004 Paid — <span className="text-solo-teal">$2,800</span></h4>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">48 Hours Ago</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[calc(-29px-0.5rem)] w-5 h-5 rounded-full bg-white border-[2px] border-solo-blue flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-solo-blue" />
                  </div>
                  <div className="-mt-1">
                    <h4 className="text-[13px] font-bold text-text-primary mb-1">Proposal v3 Sent</h4>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">5 Days Ago</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[calc(-29px-0.5rem)] w-5 h-5 rounded-full bg-white border-[2px] border-text-tertiary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                  </div>
                  <div className="-mt-1">
                    <h4 className="text-[13px] font-bold text-text-primary mb-1">Discovery Call Logged</h4>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">Jan 28</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[calc(-29px-0.5rem)] w-5 h-5 rounded-full bg-solo-teal border-[2px] border-solo-teal flex items-center justify-center">
                    <Handshake className="w-2 h-2 text-white" />
                  </div>
                  <div className="-mt-1">
                    <h4 className="text-[13px] font-bold text-text-primary mb-1">Contract Signed</h4>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">Jan 15</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* COLUMN 3: AI Intelligence */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="bg-solo-teal/5 p-6 rounded-[16px] border border-solo-teal/20 flex flex-col gap-5 relative overflow-hidden"
            >
              <h3 className="font-serif text-[20px] font-bold text-solo-teal tracking-tight flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" /> Intelligence
              </h3>
              
              {isLoadingIntelligence ? (
                <div className="flex-1 flex flex-col items-center justify-center text-solo-teal/60 py-12">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-[12px] font-bold uppercase tracking-widest">Analyzing Signals...</span>
                </div>
              ) : intelligence ? (
                <div className="flex flex-col gap-3">
                  <div className="bg-white p-4 rounded-[12px] border border-border-tertiary shadow-sm flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-solo-teal shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-1">Optimal Contact</h4>
                      <p className="text-[12px] font-medium text-text-primary leading-[1.5]">
                        {intelligence.optimal_contact.note}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-[12px] border border-border-tertiary shadow-sm">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-2 flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${intelligence.upsell.risk_level === 'High' ? 'bg-solo-coral' : intelligence.upsell.risk_level === 'Medium' ? 'bg-solo-amber' : 'bg-solo-teal'}`} />
                      Account Status: {intelligence.upsell.risk_level} Risk
                    </h4>
                    <p className="text-[12px] font-medium text-text-primary leading-[1.5]">
                      {intelligence.upsell.signal}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-tertiary text-[12px]">
                  No intelligence signals detected yet.
                </div>
              )}

              <div className="mt-auto pt-4">
                <Button 
                  onClick={handleDraftUpsell}
                  disabled={!intelligence || isDraftingUpsell}
                  className="w-full bg-solo-teal hover:bg-solo-teal/90 text-white rounded-[8px] h-10 text-[13px] font-bold shadow-sm transition-all active:scale-95"
                >
                  {isDraftingUpsell ? <Loader2 className="w-4 h-4 animate-spin" /> : "Draft Upsell →"}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Quick Invoice Action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-6 bg-white p-5 rounded-[16px] border border-border-tertiary shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-solo-blue/10 flex items-center justify-center border border-solo-blue/20 shrink-0">
                <Receipt className="w-5 h-5 text-solo-blue" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-text-primary mb-0.5 tracking-tight">
                  Next Milestone: <span className="text-solo-blue">${intelligence?.next_milestone?.amount?.toLocaleString() || '3,600'}</span>
                </h4>
                <p className="text-[12px] font-medium text-text-secondary">
                  {intelligence?.next_milestone?.note || 'AI will auto-fill from contract terms.'}
                </p>
              </div>
            </div>
            
            <NewInvoiceDrawer 
              client={client}
              trigger={
                <Button 
                  className="bg-solo-blue hover:bg-solo-blue/90 text-white rounded-[8px] h-10 px-6 text-[12px] font-bold uppercase tracking-widest shadow-sm shrink-0 active:scale-95"
                >
                  Generate Draft
                </Button>
              }
            />
          </motion.div>
        </TabsContent>
        <TabsContent value="communications" className="flex-1 mt-0 outline-none h-[500px]">
          <ChatInterface clientId={client.id} clientName={client.name} />
        </TabsContent>
        <TabsContent value="finances" className="text-text-secondary p-8 text-center text-[14px]">
           Financial records for {client.company} coming soon.
        </TabsContent>
      </Tabs>
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[500px] p-0 border-l border-border-tertiary bg-background-primary flex flex-col h-full right-0" data-lenis-prevent>
          <div className="flex-1 overflow-hidden">
            <ChatInterface clientId={client.id} clientName={client.name} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NewInvoiceIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10" />
      <path d="M7 12h10" />
      <path d="M7 16h6" />
    </svg>
  );
}
