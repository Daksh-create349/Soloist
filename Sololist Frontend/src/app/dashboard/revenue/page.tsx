"use client";

import { RevenueMetrics } from "@/components/dashboard/RevenueMetrics";
import { CapacityPlanner } from "@/components/dashboard/CapacityPlanner";
import { ClientProfitability } from "@/components/dashboard/ClientProfitability";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RevenuePage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-8 flex flex-col min-h-screen pt-[32px]">
      <div className="flex-1 flex flex-col gap-12">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-[28px] font-bold text-text-primary uppercase tracking-tight">
              Revenue Intelligence
            </h1>
            <p className="text-[14px] font-medium text-text-secondary">
              Real-time business health and capacity forecasting.
            </p>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => {
              const loadingToast = toast.loading("Generating revenue report...");
              setTimeout(() => {
                toast.success("Revenue report generated", { id: loadingToast });
                // Simulate a file download
                const link = document.createElement("a");
                link.href = "data:text/plain;charset=utf-8," + encodeURIComponent("Soloist Revenue Report - Apr 2026\nMRR: $12,400\nPipeline: $38,000");
                link.download = "soloist_report_apr.txt";
                link.click();
              }, 1500);
            }}
            className="border-border-tertiary bg-white hover:bg-background-secondary text-text-primary shadow-sm font-bold text-[13px] h-11 px-6 rounded-full flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Download className="w-4 h-4" /> Download Report
          </Button>
        </header>

        {/* METRICS ROW */}
        <RevenueMetrics />

        {/* MAIN REVENUE TOOLS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column (Capacity) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <CapacityPlanner />
          </div>

          {/* Right Column (Profitability) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <ClientProfitability />
          </div>
        </div>
      </div>
    </div>
  );
}
