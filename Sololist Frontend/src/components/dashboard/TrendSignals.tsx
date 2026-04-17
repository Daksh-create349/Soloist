"use client";

import { motion } from "framer-motion";
import { TrendingUp, Mail, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TrendSignals() {
  const trends = [
    {
      label: "AI Product Design",
      stat: "+41% in job posts this week",
      barPct: 85,
      barClass: "[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500",
      tag: "Matches your niche",
      tagColor: "bg-solo-blue/10 text-solo-blue"
    },
    {
      label: "Fintech UX — Mobile",
      stat: "+28% in job posts",
      barPct: 70,
      barClass: "[&>div]:bg-solo-teal",
      tag: "Matches your niche",
      tagColor: "bg-solo-blue/10 text-solo-blue"
    },
    {
      label: "Design Systems Consulting",
      stat: "+19% in job posts",
      barPct: 55,
      barClass: "[&>div]:bg-text-secondary",
      tag: "Adjacent skill",
      tagColor: "bg-background-secondary text-text-secondary border-border-tertiary border"
    },
    {
      label: "B2B SaaS Onboarding Design",
      stat: "+17% in job posts",
      barPct: 50,
      barClass: "[&>div]:bg-text-secondary",
      tag: "Adjacent skill",
      tagColor: "bg-background-secondary text-text-secondary border-border-tertiary border"
    },
    {
      label: "AI Tool Interface Design",
      stat: "+33% in job posts",
      barPct: 76,
      barClass: "[&>div]:bg-solo-teal",
      tag: "High opportunity",
      tagColor: "bg-solo-teal/10 text-solo-teal"
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-[16px] border border-border-tertiary p-6 shadow-sm">
        <h3 className="font-serif text-[20px] font-bold text-text-primary mb-1 tracking-tight flex items-center gap-2">
           <TrendingUp className="w-5 h-5 text-solo-amber" /> Trend Signals
        </h3>
        <p className="text-[13px] font-medium text-text-secondary mb-6">
          Emerging niches this week
        </p>

        <div className="space-y-6">
          {trends.map((trend, idx) => (
             <motion.div 
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4, delay: idx * 0.1 }}
               key={idx} 
               className="flex flex-col gap-2"
             >
               <div className="flex justify-between items-end mb-1">
                 <div>
                   <h4 className="text-[13px] font-bold text-text-primary tracking-tight">{trend.label}</h4>
                   <p className="text-[11px] font-semibold text-text-tertiary">{trend.stat}</p>
                 </div>
                 <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold border-transparent ${trend.tagColor}`}>
                   {trend.tag}
                 </Badge>
               </div>
               <Progress value={trend.barPct} className={`h-1.5 bg-background-secondary ${trend.barClass}`} />
             </motion.div>
          ))}
        </div>

        <div className="mt-8 bg-solo-teal/[0.03] border border-solo-teal/20 rounded-[12px] p-4">
          <p className="text-[12px] font-medium text-text-primary leading-[1.6] flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-solo-teal shrink-0 mt-0.5" />
            <span>
              <span className="font-bold">Tip:</span> AI Product Design is trending up 41%. Consider updating your niche profile to include it.
            </span>
          </p>
          <button className="mt-2 text-solo-teal text-[12px] font-bold hover:underline">
            Update profile →
          </button>
        </div>
      </div>

      {/* WEEKLY DIGEST */}
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.5 }}
         className="bg-white rounded-[16px] border border-border-tertiary p-6 shadow-sm relative overflow-hidden group"
      >
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-solo-amber" />
        <div className="pl-2">
           <h3 className="font-serif text-[18px] font-bold text-text-primary mb-1 tracking-tight flex items-center gap-2">
              <Mail className="w-4 h-4 text-solo-amber" /> Monday Digest — Ready
           </h3>
           <p className="text-[12px] font-medium text-text-secondary mb-4">
             Your weekly ranked summary is ready.
           </p>

           <ul className="text-[13px] font-medium text-text-secondary space-y-2 mb-6">
             <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-border-tertiary" /> 10 best-matched gigs</li>
             <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-border-tertiary" /> 5 collab opportunities</li>
             <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-border-tertiary" /> 3 trend signals</li>
           </ul>

           <Button variant="outline" className="w-full border-solo-amber/30 text-solo-amber hover:bg-solo-amber/5 font-bold text-[13px] h-9 transition-colors">
             View Full Digest
           </Button>
        </div>
      </motion.div>
    </div>
  );
}
