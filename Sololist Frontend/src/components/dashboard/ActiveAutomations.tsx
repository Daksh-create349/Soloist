"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  Settings2, 
  Trash2, 
  Zap, 
  Search,
  Filter,
  ChevronRight,
  Activity,
  Mail,
  Table,
  Calendar,
  TriangleAlert,
  GitBranch,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAutomations, toggleAutomation, deleteAutomation as apiDeleteAutomation, executeAutomation, AutomationResponse } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { IntegrationHubDrawer } from "./IntegrationHubDrawer";

export function ActiveAutomations() {
  const [automations, setAutomations] = useState<AutomationResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [executingId, setExecutingId] = useState<number | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [filter, setFilter] = useState<"All" | "Active" | "Paused">("All");

  const fetchAutomations = async () => {
    try {
      const data = await getAutomations();
      setAutomations(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch automations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const filteredAutomations = useMemo(() => {
    return automations.filter(a => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.trigger.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === "All" || a.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [automations, searchQuery, filter]);

  const toggleStatus = async (id: number) => {
    try {
      const updated = await toggleAutomation(id);
      setAutomations(prev => prev.map(a => a.id === id ? updated : a));
      toast.info(`Automation "${updated.name}" is now ${updated.status.toLowerCase()}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to toggle automation status");
    }
  };

  const deleteAutomation = async (id: number) => {
    const name = automations.find(a => a.id === id)?.name;
    try {
      await apiDeleteAutomation(id);
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast.error(`Automation "${name}" deleted`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete automation");
    }
  };

  const getTriggerIcon = (trigger: string, type: string | null) => {
    const t = (trigger + (type || "")).toLowerCase();
    if (t.includes("email") || t.includes("mail")) return <Mail className="w-4 h-4 text-solo-blue" />;
    if (t.includes("notion") || t.includes("table")) return <Table className="w-4 h-4 text-solo-teal" />;
    if (t.includes("calendar") || t.includes("meet")) return <Calendar className="w-4 h-4 text-solo-amber" />;
    if (t.includes("jira") || t.includes("bug") || t.includes("fail")) return <TriangleAlert className="w-4 h-4 text-solo-coral" />;
    if (t.includes("github") || t.includes("pr")) return <GitBranch className="w-4 h-4 text-text-primary" />;
    return <Zap className="w-4 h-4 text-text-tertiary" />;
  };

  const getActionDetails = (action: string, type: string | null) => {
    const a = (action + (type || "")).toLowerCase();
    if (a.includes("email")) return { label: "Email", icon: <Mail className="w-3.5 h-3.5" />, color: "bg-solo-blue", text: "text-solo-blue" };
    if (a.includes("notion")) return { label: "Notion", icon: <Table className="w-3.5 h-3.5" />, color: "bg-solo-teal", text: "text-solo-teal" };
    if (a.includes("calendar")) return { label: "Calendar", icon: <Calendar className="w-3.5 h-3.5" />, color: "bg-solo-amber", text: "text-solo-amber" };
    if (a.includes("jira")) return { label: "JIRA", icon: <TriangleAlert className="w-3.5 h-3.5" />, color: "bg-solo-coral", text: "text-solo-coral" };
    return { label: "Action", icon: <Zap className="w-3.5 h-3.5" />, color: "bg-text-tertiary", text: "text-text-tertiary" };
  };

  const handleTestRun = async (id: number) => {
    setExecutingId(id);
    const toastId = toast.loading("Executing automation engine...");
    try {
      const res = await executeAutomation(id);
      toast.dismiss(toastId);
      
      if (res.success) {
        if (res.simulated) {
          toast.info("Automation Triggered (Simulation Mode)", {
            description: "No verified API keys found. Logic executed & logged.",
            duration: 4000,
          });
        } else {
          toast.success("Automation Success", {
             description: res.message || "Action dispatched successfully.",
             duration: 4000,
          });
        }
      } else {
        toast.error("Execution failure", {
          description: res.message || "Remote server rejected the request.",
          duration: 5000,
        });
      }
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error("Bridge Error", {
        description: "Failed to reach the automation controller.",
      });
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search triggers or actions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-white/60 backdrop-blur-xl rounded-full pl-12 pr-6 text-[15px] font-medium text-text-primary placeholder:text-text-tertiary border border-border-tertiary focus:outline-none focus:border-solo-blue focus:ring-4 focus:ring-solo-blue/10 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-background-secondary/50 backdrop-blur-xl border border-border-tertiary rounded-full p-1.5 h-12 shadow-sm">
            {["All", "Active", "Paused"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2 rounded-full text-[12px] font-extrabold tracking-widest uppercase transition-all ${filter === f ? "bg-white text-solo-blue shadow-md" : "text-text-tertiary hover:text-text-primary"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button 
            onClick={() => setIsConfigOpen(true)}
            variant="outline" 
            className="h-12 px-6 rounded-full text-[13px] font-bold border-border-tertiary bg-white/60 backdrop-blur-xl text-text-secondary flex items-center gap-2 hover:bg-white transition-all"
          >
            <Settings2 className="w-4 h-4" /> Config
          </Button>
        </div>
      </div>

      <div className="glass bg-background-primary/40 rounded-[24px] border border-border-tertiary overflow-hidden shadow-xl overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-white/40 border-b border-border-tertiary">
              <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-tertiary">Automation Instance</th>
              <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-tertiary">Trigger Condition</th>
              <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-tertiary">Strategic Action</th>
              <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-tertiary">State</th>
              <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-tertiary text-right">Last Sync</th>
              <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-tertiary text-right">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-tertiary/30">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-border-tertiary/10">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-11 h-11 rounded-[14px]" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-8 py-6"><Skeleton className="h-8 w-24 rounded-xl" /></td>
                  <td className="px-8 py-6"><Skeleton className="h-7 w-20 rounded-full" /></td>
                  <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-28 ml-auto" /></td>
                  <td className="px-8 py-6 text-right"><Skeleton className="h-10 w-32 rounded-full ml-auto" /></td>
                </tr>
              ))
            ) : (
             <AnimatePresence mode="popLayout">
              {filteredAutomations.map((item) => (
                <motion.tr 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hover:bg-white/40 transition-all group"
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all ${item.status === 'Active' ? 'bg-solo-blue/10 text-solo-blue shadow-inner' : 'bg-text-tertiary/10 text-text-tertiary'}`}>
                        <Zap className={`w-5 h-5 ${item.status === 'Active' ? 'fill-current' : ''}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-text-primary tracking-tight leading-none mb-1">{item.name}</span>
                        <span className="text-[11px] font-bold text-text-tertiary/60 uppercase tracking-widest">ID: {item.id}00X</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3 text-[14px] font-bold text-text-secondary">
                      <div className="w-9 h-9 rounded-full bg-background-secondary border border-border-tertiary flex items-center justify-center shadow-sm">
                        {getTriggerIcon(item.trigger, item.trigger_type)}
                      </div>
                      <span className="tracking-tight">{item.trigger}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {(() => {
                      const details = getActionDetails(item.action, item.action_type);
                      return (
                        <div className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border ${details.color}/10 ${details.text} border-${details.color}/20 bg-white/40 shadow-sm`}>
                          <div className={`p-1 rounded-md ${details.color}/10`}>
                             {details.icon}
                          </div>
                          <span className="text-[12px] font-black uppercase tracking-widest">{details.label}</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-1.5 border transition-all",
                      item.status === 'Active' 
                        ? 'bg-solo-teal/5 text-solo-teal border-solo-teal/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]' 
                        : 'bg-text-tertiary/5 text-text-tertiary border-text-tertiary/20'
                    )}>
                       <span className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         item.status === 'Active' ? 'bg-solo-teal animate-pulse shadow-[0_0_8px_rgba(20,184,166,1)]' : 'bg-text-tertiary'
                       )} />
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-0.5">{item.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-text-primary">
                        <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                        {item.lastRun}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Sync Verified</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 transition-all">
                       <Button 
                         variant="default" 
                         size="sm" 
                         disabled={executingId === item.id}
                         onClick={() => handleTestRun(item.id)}
                         className={cn(
                           "relative overflow-hidden h-10 px-6 rounded-full text-[12px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95",
                           executingId === item.id 
                             ? "bg-text-tertiary cursor-wait" 
                             : "bg-solo-blue hover:bg-solo-blue/90 text-white shadow-solo-blue/20"
                         )}
                       >
                         {executingId === item.id ? (
                           <Loader2 className="w-4 h-4 animate-spin" />
                         ) : (
                           <span className="flex items-center gap-2">
                             <Play className="w-3.5 h-3.5 fill-current" /> Execute
                           </span>
                         )}
                       </Button>
                       
                       <div className="flex items-center gap-1.5 p-1 bg-background-secondary rounded-full border border-border-tertiary shadow-inner">
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => toggleStatus(item.id)}
                           className={cn(
                             "w-8 h-8 rounded-full transition-all active:scale-90",
                             item.status === 'Active' ? 'text-solo-amber hover:bg-solo-amber/10' : 'text-solo-teal hover:bg-solo-teal/10'
                           )}
                         >
                           {item.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => deleteAutomation(id)}
                           className="w-8 h-8 rounded-full text-text-tertiary hover:text-solo-coral hover:bg-solo-coral/10 transition-all active:scale-95"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                       </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
             </AnimatePresence>
            )}
          </tbody>
        </table>
        {!isLoading && filteredAutomations.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <Search className="w-10 h-10 text-text-tertiary/30" />
            <span className="text-[14px] font-bold text-text-tertiary uppercase tracking-widest">No matching automations active</span>
          </div>
        )}
        {/* Integration Hub */}
      <IntegrationHubDrawer 
        isOpen={isConfigOpen} 
        onOpenChange={setIsConfigOpen} 
      />
    </div>
    </div>
  );
}
