import { TopBar } from "@/components/dashboard/TopBar";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { OpportunityRadar } from "@/components/dashboard/OpportunityRadar";
import { ClientHealth } from "@/components/dashboard/ClientHealth";
import { AutomationsStatus } from "@/components/dashboard/AutomationsStatus";

export default function DashboardPage() {
  return (
    <div className="pt-8 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col">
      <TopBar />
      <StatsRow />
      <OpportunityRadar />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <ClientHealth />
        </div>
        <div>
          <AutomationsStatus />
        </div>
      </div>
    </div>
  );
}
