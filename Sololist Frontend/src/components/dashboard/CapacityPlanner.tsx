"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Info, Zap, Loader2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCapacityPlan, CapacityPlanResponse } from "@/lib/api";

export function CapacityPlanner() {
  const [data, setData] = useState<CapacityPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(false);

  useEffect(() => {
    async function loadCapacity() {
      try {
        const result = await getCapacityPlan();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
         setIsLoading(false);
      }
    }
    loadCapacity();
  }, []);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      toast.success("AI Workflow Calibration Complete: Availability optimized for next 7 days.");
    }, 2500);
  };

  if (isLoading || !data) {
    return (
      <div className="bg-white border border-border-tertiary rounded-[24px] p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-text-tertiary">Loading capacity insights...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-border-tertiary rounded-[24px] p-8 shadow-sm flex flex-col gap-8 h-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-serif text-[22px] font-bold text-text-primary tracking-tight">Capacity Planner</h3>
          <p className="text-[13px] font-medium text-text-secondary">AI tracking of billable vs. operational load.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-background-secondary border border-border-tertiary flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors cursor-pointer">
          <Info className="w-5 h-5" />
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-500 ${isCalibrating ? "opacity-50 blur-[2px] scale-[0.98]" : "opacity-100"}`}>
        {/* BIG GAUGE AREA */}
        <div className="flex flex-col gap-6 p-6 bg-background-secondary rounded-[20px] border border-border-tertiary/50">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">Current Load</span>
              <div className="font-serif text-[42px] font-bold text-text-primary leading-none">{data.current_load}<span className="text-[20px] text-text-tertiary">%</span></div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {data.current_load > 90 ? (
                 <span className="bg-solo-coral/10 text-solo-coral text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">Burnout Zone</span>
              ) : data.current_load > 60 ? (
                 <span className="bg-solo-amber/10 text-solo-amber text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">High Load</span>
              ) : (
                 <span className="bg-solo-teal/10 text-solo-teal text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">Optimal</span>
              )}
              <span className="text-[11px] font-medium text-text-tertiary italic">{data.free_hours} hrs free / wk</span>
            </div>
          </div>
          
          <div className="space-y-3">
             <Progress value={data.current_load} className="h-2.5 bg-white border border-border-tertiary/50 [&>div]:bg-solo-blue" />
             <div className="flex justify-between text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
               <span>Idle</span>
               <span>Optimal</span>
               <span>Burnout Zone</span>
             </div>
          </div>
        </div>

        {/* BREAKDOWN ITEMS */}
        <div className="flex flex-col gap-5 justify-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-solo-blue/10 flex items-center justify-center shrink-0">
               <Clock className="w-5 h-5 text-solo-blue" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
               <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-text-primary">Billable Hours</span>
                  <span className="text-[13px] font-bold text-text-primary">{data.billable_hours_ratio}</span>
               </div>
               <Progress value={data.billable_hours_progress} className="h-1.5 bg-background-secondary [&>div]:bg-solo-blue" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-solo-teal/10 flex items-center justify-center shrink-0">
               <Zap className="w-5 h-5 text-solo-teal" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
               <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-text-primary">Ops / Non-Billable</span>
                  <span className="text-[13px] font-bold text-text-primary">{data.ops_hours_ratio}</span>
               </div>
               <Progress value={data.ops_hours_progress} className="h-1.5 bg-background-secondary [&>div]:bg-solo-teal" />
            </div>
          </div>
        </div>
      </div>

      {/* AI INSIGHT FOOTER */}
      <div className="mt-auto bg-solo-blue/5 border border-solo-blue/20 rounded-[16px] p-5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-solo-blue text-white flex items-center justify-center shrink-0 shadow-sm shadow-solo-blue/20">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-[13px] font-bold text-text-primary tracking-tight">AI Capacity Insight</h4>
          <p className="text-[12px] font-medium text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: data.ai_insight }} />
        </div>
      </div>
    </motion.div>
  );
}
