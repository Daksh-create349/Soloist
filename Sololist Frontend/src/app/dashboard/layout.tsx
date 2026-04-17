"use client";

import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-background-primary relative overflow-hidden mesh-gradient">
        {/* Soft Dashboard Background */}
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-solo-blue/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-solo-teal/5 blur-[120px] rounded-full pointer-events-none" />
        
        <DashboardNavbar />
        
        {/* Main Content Area */}
        <main className="pt-[72px] w-full min-h-screen relative z-10 transition-all duration-500">
          {children}
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
