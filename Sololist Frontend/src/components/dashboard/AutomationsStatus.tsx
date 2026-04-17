"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, RefreshCw, Zap, FileText, Calendar, AlertCircle, Play } from "lucide-react";
import { getAutomations, executeAutomation, AutomationResponse } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function AutomationsStatus() {
  const [automations, setAutomations] = useState<AutomationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAuths() {
      try {
        const data = await getAutomations();
        setAutomations(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAuths();
  }, []);

  const getIcon = (action_type: string) => {
    switch(action_type) {
      case 'sync_notion': return <FileText className="w-4 h-4 text-solo-teal" />;
      case 'add_calendar': return <Calendar className="w-4 h-4 text-solo-blue" />;
      case 'sync_jira': return <AlertCircle className="w-4 h-4 text-solo-coral" />;
      case 'generate_proposal': return <FileText className="w-4 h-4 text-solo-teal" />;
      case 'send_email': return <CheckCircle2 className="w-4 h-4 text-solo-blue" />;
      default: return <Clock className="w-4 h-4 text-solo-amber" />;
    }
  };
  
  const getBg = (action_type: string) => {
    switch(action_type) {
      case 'sync_notion': return 'bg-solo-teal/10';
      case 'add_calendar': return 'bg-solo-blue/10';
      case 'sync_jira': return 'bg-solo-coral/10';
      case 'generate_proposal': return 'bg-solo-teal/10';
      case 'send_email': return 'bg-solo-blue/10';
      default: return "bg-solo-amber/10";
    }
  };

  const handleExecute = async (id: number) => {
    const toastId = toast.loading("Executing automation...");
    try {
      const res = await executeAutomation(id);
      toast.dismiss(toastId);
      
      if (res.success) {
        if (res.simulated) {
          toast.info("Automation Executed (Simulation Mode)", {
            description: "No API keys found. Action was logged successfully.",
            duration: 4000,
          });
        } else {
          toast.success("Automation Triggered Successfully", {
             description: res.message || "Action completed.",
             duration: 4000,
          });
        }
      } else {
        toast.error("Execution failed", {
          description: res.message || "Check your integration settings.",
          duration: 5000,
        });
      }
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error("Network Error", {
        description: "Please check your server connection.",
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
      className="glass bg-background-primary/40 rounded-[16px] p-6 border border-border-tertiary shadow-sm"
    >
      <h2 className="font-serif text-[20px] font-bold text-text-primary mb-6 flex items-center gap-3">
        <Zap className="w-5 h-5 text-solo-blue" /> Automations Running
      </h2>

      <div className="flex flex-col gap-4">
        {isLoading ? (
           <div className="flex flex-col gap-4">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex items-center gap-4 p-3 border border-transparent">
                 <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                 <div className="flex-grow space-y-2">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-3 w-20" />
                 </div>
                 <Skeleton className="w-16 h-8 rounded-md" />
               </div>
             ))}
           </div>
        ) : automations.slice(0, 3).map((item) => (
          <div key={item.id} className="group flex items-center gap-4 p-3 rounded-[10px] hover:bg-background-secondary/50 transition-colors border border-transparent hover:border-border-tertiary/50">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBg(item.action_type || "")}`}>
              {getIcon(item.action_type || "")}
            </div>
            <div className="flex-grow">
              <h4 className="text-[14px] font-bold text-text-primary leading-tight mb-1 group-hover:text-solo-blue transition-colors">
                {item.name}
              </h4>
              <p className="text-[12px] font-medium text-text-secondary opacity-80">
                {item.lastRun}
              </p>
            </div>
            <button 
              onClick={() => handleExecute(item.id)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-solo-blue hover:bg-solo-blue/10 bg-background-secondary px-2.5 py-1.5 rounded-md border border-border-tertiary/30 shrink-0 transition-colors"
            >
              <Play className="w-3 h-3" /> Test Run
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
