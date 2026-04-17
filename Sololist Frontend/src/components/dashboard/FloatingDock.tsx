"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  Radar, 
  CircleDollarSign, 
  Settings, 
  HelpCircle 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Client Hub", href: "/dashboard/clients" },
  { icon: Zap, label: "Ops Autopilot", href: "/dashboard/ops" },
  { icon: Radar, label: "Opportunity Radar", href: "/dashboard/radar" },
  { icon: CircleDollarSign, label: "Revenue", href: "/dashboard/revenue" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function FloatingDock() {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center py-6 px-3.5 bg-white/40 backdrop-blur-3xl rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] gap-8"
    >
      <Tooltip>
        <TooltipTrigger>
          <div className="relative">
            <Avatar className="w-10 h-10 border-[1.5px] border-solo-blue/20 ring-2 ring-transparent transition-all hover:ring-solo-blue/50">
              <AvatarImage src="https://i.pravatar.cc/150?u=alex" alt="Alex Rivera" />
              <AvatarFallback className="bg-solo-blue text-white text-[12px] font-bold">AR</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-solo-teal rounded-full border-2 border-background-primary" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-4 bg-text-primary text-white text-[12px] font-medium border-none shadow-xl">
          <p>Alex Rivera</p>
          <p className="text-solo-blue font-bold text-[10px] uppercase tracking-widest mt-1">Solo Pro</p>
        </TooltipContent>
      </Tooltip>

      <div className="flex flex-col gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger render={<Link href={item.href} className={`relative flex items-center justify-center w-10 h-10 rounded-[12px] transition-all duration-300 ${isActive ? "bg-solo-blue text-white shadow-lg shadow-solo-blue/30" : "text-text-tertiary hover:bg-background-secondary/80 hover:text-text-primary"}`}><item.icon className={`w-5 h-5 ${isActive ? "opacity-100" : "opacity-80"}`} /></Link>} />
              <TooltipContent side="right" className="ml-4 bg-background-secondary text-text-primary text-[12px] font-semibold border-border-tertiary shadow-xl">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-border-tertiary/50">
        <Tooltip>
          <TooltipTrigger render={<button className="flex items-center justify-center w-10 h-10 rounded-[12px] text-text-tertiary hover:bg-background-secondary/80 hover:text-text-primary transition-all duration-300"><HelpCircle className="w-5 h-5 opacity-80" /></button>} />
          <TooltipContent side="right" className="ml-4 bg-background-secondary text-text-primary text-[12px] font-semibold border-border-tertiary shadow-xl">
            Help & Resources
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.aside>
  );
}
