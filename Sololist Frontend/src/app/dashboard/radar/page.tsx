import { RadarHeader } from "@/components/dashboard/RadarHeader";
import { RadarStats } from "@/components/dashboard/RadarStats";
import { OpportunityFeed } from "@/components/dashboard/OpportunityFeed";
import { TrendSignals } from "@/components/dashboard/TrendSignals";

export default function RadarPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-8 flex flex-col min-h-screen">
      <RadarHeader />
      <RadarStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left Column (70%) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <OpportunityFeed />
        </div>

        {/* Right Column (30%) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <TrendSignals />
        </div>
      </div>
    </div>
  );
}
