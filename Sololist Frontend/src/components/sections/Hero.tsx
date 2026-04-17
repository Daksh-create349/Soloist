"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Hero() {
  const router = useRouter();
  return (
    <section className="relative pt-32 pb-24 border-b-[0.5px] border-border-tertiary overflow-hidden mesh-gradient">
      {/* Decorative element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-solo-blue/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-content relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-wrap gap-2 mb-10"
        >
          <span className="bg-solo-blue/10 text-solo-blue text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-solo-blue/20">
            v1.0 is now live
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="font-serif text-[42px] md:text-[64px] font-bold leading-[1.05] text-text-primary mb-8 tracking-[-0.03em]"
        >
          The AI operating system <br className="hidden md:block" /> for one-person agencies.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-serif italic text-[18px] md:text-[21px] font-light text-text-secondary leading-[1.5] max-w-[620px] mb-12 opacity-90"
        >
          Manage clients, automate operations, and surface the right opportunities — before your competition does.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-wrap gap-4 mb-20"
        >
          <Button 
            onClick={() => router.push('/onboarding')}
            className="bg-solo-blue hover:bg-solo-blue/90 text-white rounded-[6px] px-10 h-12 text-[15px] shadow-lg shadow-solo-blue/20 transition-all hover:scale-[1.02]"
          >
            Start Free
          </Button>
          <Button variant="ghost" className="border border-border-secondary glass rounded-[6px] px-10 h-12 text-[15px] hover:bg-white/50 transition-all">
            See how it works
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 pt-10 border-t border-border-tertiary/50"
        >
          {[
            { label: "Sector", value: "B2B SaaS / AI Tooling" },
            { label: "Stage", value: "Pre-seed / MVP" },
            { label: "Target ARR Y1", value: "$600K" },
            { label: "Model", value: "Subscription + Marketplace" },
          ].map((item, i) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="flex flex-col gap-1.5"
            >
              <span className="text-text-secondary text-[12px] font-bold uppercase tracking-widest opacity-60">{item.label}</span>
              <span className="text-text-primary text-[14px] font-medium">{item.value}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap gap-4 mt-16"
        >
          {[
            { label: "73M+ freelancers", color: "bg-solo-blue" },
            { label: "28hrs/week saved", color: "bg-solo-teal" },
            { label: "$600K ARR target Y1", color: "bg-solo-amber" },
          ].map((pill, i) => (
            <div key={pill.label} className="glass border border-border-tertiary rounded-full px-5 py-2 text-[12px] font-semibold flex items-center gap-2.5 shadow-sm hover:border-border-secondary transition-colors cursor-default">
              <span className={`w-2 h-2 rounded-full ${pill.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
              {pill.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
