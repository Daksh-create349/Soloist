"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AutopilotHeader({ onNewAutomation }: { onNewAutomation: () => void }) {
  const stats = [
    {
      label: "Automations Running",
      value: "7",
      subtext: "across all clients",
    },
    {
      label: "Actions Taken This Month",
      value: "143",
      subtext: "+22 vs last month",
      trend: "text-solo-teal",
    },
    {
      label: "Hours Saved (Est.)",
      value: "31 hrs",
      subtext: "this month",
    },
    {
      label: "Emails Sent by AI",
      value: "28",
      subtext: "0 bounces",
    },
  ];

  return (
    <header className="flex flex-col gap-8 mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[28px] font-bold text-text-primary uppercase tracking-tight">
            Ops Autopilot
          </h1>
          <p className="text-[14px] font-medium text-text-secondary">
            Set your rules once. Let Soloist handle the rest.
          </p>
        </div>
        
        <Button 
          onClick={onNewAutomation}
          className="bg-solo-blue hover:bg-solo-blue/90 text-white shadow-sm font-bold text-[13px] h-11 px-8 rounded-full flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> New Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            key={stat.label}
            className="bg-background-secondary border border-border-tertiary rounded-[12px] p-6 shadow-sm hover:shadow-md transition-shadow cursor-default"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary mb-3 block">
              {stat.label}
            </span>
            <div className="font-serif text-[32px] font-bold text-text-primary mb-1 tracking-tight">
              {stat.value}
            </div>
            <div className={`text-[12px] font-bold uppercase tracking-widest ${stat.trend || "text-text-tertiary opacity-80"}`}>
              {stat.subtext}
            </div>
          </motion.div>
        ))}
      </div>
    </header>
  );
}
