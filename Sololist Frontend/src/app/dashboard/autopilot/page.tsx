"use client";

import { useState } from "react";
import { AutopilotHeader } from "@/components/dashboard/AutopilotHeader";
import { ActiveAutomations } from "@/components/dashboard/ActiveAutomations";
import { AutomationBuilder } from "@/components/dashboard/AutomationBuilder";

export default function AutopilotPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-8 flex flex-col min-h-screen pt-[32px]">
      <div className="flex-1 flex flex-col gap-12" data-lenis-prevent>
        {/* HEADER - Now includes the New Automation button in the flow */}
        <AutopilotHeader onNewAutomation={() => setIsBuilderOpen(true)} />
        
        {/* ACTIVE AUTOMATIONS LIST */}
        <section className="flex flex-col gap-6">
          <ActiveAutomations />
        </section>

        {/* GUIDED BUILDER SHEET */}
        <AutomationBuilder isOpen={isBuilderOpen} onOpenChange={setIsBuilderOpen} />
      </div>
    </div>
  );
}
