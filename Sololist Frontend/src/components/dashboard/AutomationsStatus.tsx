"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, RefreshCw, Zap } from "lucide-react";
import { getAutomations, AutomationResponse } from "@/lib/api";

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
    if (action_type === 'email') return <CheckCircle2 className="w-4 h-4 text-solo-teal" />;
    if (action_type === 'draft_invoice') return <RefreshCw className="w-4 h-4 text-solo-blue" />;
    return <Clock className="w-4 h-4 text-solo-amber" />;
  };
  
  const getBg = (action_type: string) => {
    if (action_type === 'email') return "bg-solo-teal/10";
    if (action_type === 'draft_invoice') return "bg-solo-blue/10";
    return "bg-solo-amber/10";
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
           <div className="py-4 text-center text-text-tertiary">Loading automations...</div>
        ) : automations.slice(0, 3).map((item) => (
          <div key={item.id} className="group flex items-center gap-4 p-3 rounded-[10px] hover:bg-background-secondary/50 transition-colors border border-transparent hover:border-border-tertiary/50">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBg(item.action_type)}`}>
              {getIcon(item.action_type)}
            </div>
            <div className="flex-grow">
              <h4 className="text-[14px] font-bold text-text-primary leading-tight mb-1 group-hover:text-solo-blue transition-colors">
                {item.name}
              </h4>
              <p className="text-[12px] font-medium text-text-secondary opacity-80">
                {item.lastRun}
              </p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary bg-background-secondary px-2 py-1 rounded-md border border-border-tertiary/30 shrink-0">
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
