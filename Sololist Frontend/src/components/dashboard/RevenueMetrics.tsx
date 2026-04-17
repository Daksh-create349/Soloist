"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, Target, Briefcase } from "lucide-react";
import { getRevenueMetrics, RevenueMetricsResponse } from "@/lib/api";

export function RevenueMetrics() {
  const [metricsData, setMetricsData] = useState<RevenueMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getRevenueMetrics();
        setMetricsData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const metrics = metricsData ? [
    {
      label: "Monthly Recurring (MRR)",
      value: metricsData.mrr,
      trend: metricsData.mrr_trend,
      trendDir: "up",
      icon: TrendingUp,
      color: "text-solo-blue",
      bg: "bg-solo-blue/10",
    },
    {
      label: "Pipeline Value",
      value: metricsData.pipeline,
      trend: metricsData.pipeline_trend,
      trendDir: "up",
      icon: Target,
      color: "text-solo-teal",
      bg: "bg-solo-teal/10",
    },
    {
      label: "Avg. Project Value",
      value: metricsData.avg_project,
      trend: metricsData.avg_project_trend,
      trendDir: "up",
      icon: Briefcase,
      color: "text-solo-amber",
      bg: "bg-solo-amber/10",
    },
  ] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {isLoading ? (
        <div className="md:col-span-3 p-12 text-center text-[14px] text-text-tertiary">
           Loading metrics...
        </div>
      ) : metrics.map((metric, idx) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="bg-white border border-border-tertiary rounded-[20px] p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
        >
          {/* Decorative subtle gradient */}
          <div className={`absolute top-0 right-0 w-32 h-32 ${metric.bg} blur-[50px] -mr-16 -mt-16 rounded-full opacity-50 transition-opacity group-hover:opacity-80`} />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 ${metric.bg} ${metric.color} rounded-[14px] flex items-center justify-center`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 bg-background-secondary px-3 py-1.5 rounded-full border border-border-tertiary">
                <ArrowUpRight className="w-3.5 h-3.5 text-solo-teal" />
                <span className="text-[11px] font-bold text-solo-teal uppercase tracking-widest">{metric.trend}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-tertiary">
                {metric.label}
              </span>
              <div className="font-serif text-[36px] font-bold text-text-primary tracking-tight">
                {metric.value}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border-tertiary/50">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-tertiary font-medium italic">Projected</span>
                <span className="text-text-primary font-bold">In-API tracking</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
