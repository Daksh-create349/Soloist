"use client";

import { motion } from "framer-motion";

const problems = [
  {
    id: "01",
    title: "Tool fragmentation",
    description: "12-17 tools per month, nothing connects.",
  },
  {
    id: "02",
    title: "Reactive opportunity discovery",
    description: "Leads are gone by the time you see them.",
  },
  {
    id: "03",
    title: "No unified business intelligence",
    description: "Can't see which clients earn most.",
  },
  {
    id: "04",
    title: "Still doing ops manually",
    description: "Follow-ups, invoices, onboarding.",
  },
  {
    id: "05",
    title: "Scaling hits a wall",
    description: "Progress slows at $8–15K/mo without an invisible team.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="py-32 bg-background-secondary border-b border-border-tertiary/50 relative overflow-hidden">
      {/* Subtle background detail */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-solo-coral/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-content relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="font-serif text-[36px] md:text-[48px] font-bold text-text-primary mb-6 leading-[1.1] tracking-[-0.02em]">
            You&apos;re running a business alone. <br /> Your tools aren&apos;t helping.
          </h2>
          <p className="text-text-secondary text-[16px] max-w-[500px] leading-[1.6]">
            Most software is built for teams. Soloists need intelligence, not just more dashboards.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
          {problems.map((problem, index) => (
            <motion.div 
              key={problem.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="group flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[13px] font-bold text-solo-blue opacity-50 tracking-[0.2em]">
                  {problem.id}
                </span>
                <div className="h-[0.5px] flex-grow bg-border-tertiary group-hover:bg-solo-blue/30 transition-colors" />
              </div>
              
              <div className="space-y-3">
                <h3 className="font-serif text-[22px] font-bold text-text-primary leading-tight">
                  {problem.title}
                </h3>
                <p className="text-text-secondary text-[14px] leading-[1.6] opacity-80">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
