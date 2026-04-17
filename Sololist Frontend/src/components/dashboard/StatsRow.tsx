"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getDashboardStats, DashboardStatsResponse } from "@/lib/api";

export function StatsRow() {
  const [statsData, setStatsData] = useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStatsData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = statsData?.stats || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {isLoading ? (
        [1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[140px] glass animate-pulse rounded-[24px]" />
        ))
      ) : (
        stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              href={stat.href}
              className="block h-full bg-white border border-border-tertiary rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-tertiary">
                  {stat.label}
                </span>
                <div className="text-[11px] font-bold text-solo-teal bg-solo-teal/5 px-2 py-1 rounded-full border border-solo-teal/10">
                  {stat.trend}
                </div>
              </div>

              <div className="font-serif text-[32px] font-bold text-text-primary mb-1 tracking-tight">
                {stat.value}
              </div>

              <div className="text-[13px] font-medium text-text-secondary flex items-center justify-between">
                {stat.subtext}
                <ArrowUpRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          </motion.div>
        ))
      )}
    </div>
  );
}
