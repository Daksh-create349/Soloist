"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import { getProfitability, ProfitabilityResponse } from "@/lib/api";

export function ClientProfitability() {
  const [data, setData] = useState<ProfitabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfit() {
      try {
         const resp = await getProfitability();
         setData(resp);
      } catch (e) {
         console.error(e);
      } finally {
         setIsLoading(false);
      }
    }
    fetchProfit();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="bg-white border border-border-tertiary rounded-[24px] p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-text-tertiary">Loading profitability data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-border-tertiary rounded-[24px] p-8 shadow-sm flex flex-col gap-8 h-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-serif text-[22px] font-bold text-text-primary tracking-tight">Income Breakdown</h3>
          <p className="text-[13px] font-medium text-text-secondary">Where your time delivers the highest ROI.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-background-secondary border border-border-tertiary flex items-center justify-center text-text-tertiary group">
           <PieChart className="w-5 h-5 group-hover:text-solo-blue transition-colors" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {data.sectors.map((sector, idx) => (
          <div key={sector.name} className="flex flex-col gap-3 group">
            <div className="flex justify-between items-center px-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-bold text-text-primary">{sector.name}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">{sector.status}</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[14px] font-serif font-bold text-text-primary">{sector.income}</span>
                <span className="text-[11px] font-bold text-solo-teal uppercase tracking-widest">{sector.hourly}</span>
              </div>
            </div>
            
            <div className="relative h-2.5 bg-background-secondary rounded-full overflow-hidden border border-border-tertiary/30">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${sector.share}%` }}
                 transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                 className={`absolute inset-y-0 left-0 ${idx === 0 ? "bg-solo-blue" : idx === 1 ? "bg-solo-teal" : "bg-solo-amber"} group-hover:brightness-110 transition-all`}
               />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border-tertiary pt-6 mt-4 grid grid-cols-2 gap-4">
         <div className="bg-background-secondary rounded-[16px] p-4 border border-border-tertiary/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary block mb-1">Avg Margin</span>
            <div className="text-[18px] font-serif font-bold text-text-primary leading-tight">{data.avg_margin}</div>
         </div>
         <div className="bg-background-secondary rounded-[16px] p-4 border border-border-tertiary/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary block mb-1">LTV / CAC</span>
            <div className="text-[18px] font-serif font-bold text-text-primary leading-tight">{data.ltv_cac}</div>
         </div>
      </div>
    </motion.div>
  );
}
