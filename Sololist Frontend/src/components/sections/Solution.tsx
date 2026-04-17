"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const solutions = [
  {
    title: "Client Hub",
    accent: "bg-solo-blue",
    description: "Full CRM, contracts, invoicing, and automated AI onboarding for every new project.",
  },
  {
    title: "Ops Autopilot",
    accent: "bg-solo-teal",
    description: "Automates your follow-ups, reports, and administrative reminders while you focus on deep work.",
  },
  {
    title: "Opportunity Radar",
    accent: "bg-solo-amber",
    description: "Monitors job boards and niche communities for leads ranked specifically for your skills.",
  },
];

export function Solution() {
  return (
    <section id="features" className="py-32 border-b border-border-tertiary relative">
      <div className="max-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h2 className="font-serif text-[36px] md:text-[48px] font-bold text-text-primary mb-6 leading-[1.1] tracking-[-0.02em]">
            One platform. Three superpowers.
          </h2>
          <p className="text-text-secondary text-[16px] max-w-[500px] mx-auto leading-[1.6]">
            Every tool you need to run, scale, and optimize your one-person agency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            >
              <Card className="group relative overflow-hidden bg-background-primary border-border-tertiary hover:border-border-secondary transition-all duration-500 rounded-[12px] h-full flex flex-col">
                <div className={`h-[4px] w-full ${solution.accent} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="p-10 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full ${solution.accent} opacity-10 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`} />
                  <CardTitle className="font-serif text-[24px] font-bold text-text-primary mb-4 tracking-[-0.01em]">
                    {solution.title}
                  </CardTitle>
                  <p className="text-text-secondary text-[15px] leading-[1.8] opacity-80">
                    {solution.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
