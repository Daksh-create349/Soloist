"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For the hobbyist or brand new soloist.",
    features: [
      "3 active clients",
      "Basic CRM access",
      "5 automations / mo",
      "Weekly email digest",
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Solo Pro",
    price: "$29",
    period: "/mo",
    description: "The complete OS for professional freelancers.",
    features: [
      "Unlimited clients",
      "Full Ops Autopilot",
      "Real-time Opportunity Radar",
      "AI-powered proposals",
    ],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Solo Elite",
    price: "$79",
    period: "/mo",
    description: "Advanced intelligence for high-scale agencies.",
    features: [
      "Everything in Pro",
      "Advanced AI profiling",
      "White-label client portals",
      "Priority strategy support",
    ],
    cta: "Get Elite",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-background-secondary border-b border-border-tertiary/50 relative overflow-hidden">
      {/* Background detail */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-solo-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-content relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-[36px] md:text-[48px] font-bold text-text-primary mb-6 leading-[1.1] tracking-[-0.02em]">
            Pricing as simple as <br /> your business.
          </h2>
          <p className="text-text-secondary text-[16px] max-w-[500px] mx-auto leading-[1.6]">
            Transparent pricing for solo operators. Scale your revenue, not your overhead.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative flex flex-col p-10 rounded-[12px] border transition-all duration-500 overflow-hidden ${
                plan.featured 
                  ? "bg-background-primary border-solo-blue/50 shadow-2xl scale-105 z-10 py-14" 
                  : "bg-background-primary/50 glass border-border-tertiary hover:border-border-secondary"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0">
                  <div className="bg-solo-blue text-white text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2 rotate-45 translate-x-[25px] translate-y-[10px] shadow-sm">
                    Popular
                  </div>
                </div>
              )}

              <div className="mb-10">
                <h3 className="font-serif text-[22px] font-bold text-text-primary mb-3 tracking-[-0.01em]">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[42px] font-bold text-text-primary tracking-tight">{plan.price}</span>
                  <span className="text-text-tertiary text-[14px] font-medium opacity-60">{plan.period}</span>
                </div>
                <p className="text-text-secondary text-[14px] mt-6 leading-[1.7] min-h-[50px] opacity-80">
                  {plan.description}
                </p>
              </div>

              <div className="flex-grow flex flex-col gap-5 mb-12">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-solo-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-solo-teal" />
                    </div>
                    <span className="text-text-secondary text-[14px] font-medium opacity-90">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className={`w-full h-12 rounded-[6px] text-[15px] font-bold tracking-tight transition-all duration-300 ${
                  plan.featured 
                    ? "bg-solo-blue hover:bg-solo-blue/90 text-white shadow-lg shadow-solo-blue/20 hover:scale-[1.02]" 
                    : "bg-background-secondary hover:bg-border-tertiary text-text-primary border border-border-tertiary hover:scale-[1.02]"
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
