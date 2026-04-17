"use client";

import { motion } from "framer-motion";

export function RadarStats() {
  const stats = [
    {
      label: "New Today",
      value: "24",
      subtext: "across all sources",
      valueColor: "text-text-primary",
      borderColor: "border-border-tertiary"
    },
    {
      label: "High Match (80%+)",
      value: "7",
      subtext: "ready to apply",
      valueColor: "text-solo-teal",
      borderColor: "border-solo-teal/20",
      bgColor: "bg-solo-teal/[0.02]"
    },
    {
      label: "Applied This Week",
      value: "3",
      subtext: "2 awaiting reply",
      valueColor: "text-text-primary",
      borderColor: "border-border-tertiary"
    },
    {
      label: "Trend Signals",
      value: "5",
      subtext: "new this week",
      valueColor: "text-solo-amber",
      borderColor: "border-solo-amber/20",
      bgColor: "bg-solo-amber/[0.02]"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 w-full">
      {stats.map((stat, idx) => (
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            key={idx} 
            className={`bg-white border ${stat.borderColor} ${stat.bgColor || ""} rounded-[16px] p-6 shadow-sm flex flex-col justify-between h-[120px]`}
          >
            <span className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">
              {stat.label}
            </span>
            <div className="mt-auto">
              <div className={`font-serif text-[36px] font-bold leading-none mb-1 tracking-tight ${stat.valueColor}`}>
                {stat.value}
              </div>
              <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
                {stat.subtext}
              </div>
            </div>
         </motion.div>
      ))}
    </div>
  );
}
