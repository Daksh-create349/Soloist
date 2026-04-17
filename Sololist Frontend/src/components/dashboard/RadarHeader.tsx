"use client";

import { motion } from "framer-motion";
import { RotateCw, Target, CircleDollarSign, Building2, MapPin, Clock, Link as LinkIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RadarHeader() {
  return (
    <div className="flex flex-col gap-6 mb-10 mt-6 max-w-[1200px] w-full mx-auto">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-[28px] font-bold text-text-primary mb-2">
            Opportunity Radar
          </h1>
          <p className="text-[14px] font-medium text-text-secondary max-w-xl">
            Ranked leads, gigs, and trends — matched to your exact niche. Updated every 2 hours.
          </p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-text-tertiary uppercase tracking-widest bg-background-secondary px-3 py-1.5 rounded-full">
            <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
            Last synced 14 mins ago
          </div>
          <Button variant="ghost" className="text-[13px] font-bold border border-border-tertiary bg-white hover:bg-background-secondary shadow-sm h-9">
            Edit Niche Profile
          </Button>
        </div>
      </div>

      {/* Niche Profile Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-solo-blue/5 border border-solo-blue/20 rounded-[12px] p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-solo-blue shrink-0">
            Your Niche Profile
          </span>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-solo-blue/10 rounded-full px-3 py-1 shadow-sm">
              <Target className="w-3.5 h-3.5 text-solo-blue" />
              <span className="text-[12px] font-bold text-text-primary">UX / Product Design</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-white border border-solo-blue/10 rounded-full px-3 py-1 shadow-sm">
              <CircleDollarSign className="w-3.5 h-3.5 text-solo-teal" />
              <span className="text-[12px] font-bold text-text-primary">$75–95/hr</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-solo-blue/10 rounded-full px-3 py-1 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-[12px] font-bold text-text-primary">Fintech · SaaS · B2B</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-solo-blue/10 rounded-full px-3 py-1 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-solo-amber" />
              <span className="text-[12px] font-bold text-text-primary">Remote only</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-solo-blue/10 rounded-full px-3 py-1 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-solo-coral" />
              <span className="text-[12px] font-bold text-text-primary">12 hrs/week</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-solo-blue/10 rounded-full px-3 py-1 shadow-sm">
              <LinkIcon className="w-3.5 h-3.5 text-text-secondary" />
              <span className="text-[12px] font-bold text-text-primary">Upwork · LinkedIn · Reddit · Indie Hackers</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-solo-teal shrink-0">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest">
            AI is scoring opportunities against this profile
          </span>
        </div>
      </motion.div>
    </div>
  );
}
