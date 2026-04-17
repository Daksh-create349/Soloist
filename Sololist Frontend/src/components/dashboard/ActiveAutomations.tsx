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
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getAutomations, toggleAutomation, deleteAutomation as apiDeleteAutomation, AutomationResponse } from "@/lib/api";

export function ActiveAutomations() {
  const [automations, setAutomations] = useState<AutomationResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    return automations.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.trigger.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [automations, searchQuery]);

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

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search automations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-white rounded-[10px] pl-10 pr-4 text-[14px] font-medium text-text-primary placeholder:text-text-tertiary border border-border-tertiary focus:outline-none focus:border-solo-blue focus:ring-1 focus:ring-solo-blue transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-border-tertiary rounded-lg p-1 h-10">
            {["All", "Active", "Paused"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${filter === f ? "bg-solo-blue text-white shadow-sm" : "text-text-tertiary hover:text-text-primary"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline" className="h-10 px-4 text-[13px] font-bold border-border-tertiary bg-white text-text-secondary flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Bulk Actions
          </Button>
        </div>
      </div>

      <div className="bg-white border border-border-tertiary rounded-[16px] overflow-hidden shadow-sm overflow-x-auto no-scrollbar" data-lenis-prevent>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-background-secondary/50 border-b border-border-tertiary">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-text-tertiary">Automation Name</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-text-tertiary">Trigger Event</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-text-tertiary">Resulting Action</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-text-tertiary">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-text-tertiary text-right">Last Run</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-text-tertiary text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-tertiary/50">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[14px] font-medium text-text-tertiary">
                  Loading automations...
                </td>
              </tr>
            ) : (
             <AnimatePresence mode="popLayout">
              {filteredAutomations.map((item) => (
                <motion.tr 
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hover:bg-background-secondary/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.status === 'Active' ? 'bg-solo-blue/10 text-solo-blue' : 'bg-text-tertiary/10 text-text-tertiary'}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-[14px] font-bold text-text-primary tracking-tight">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-text-secondary">{item.trigger}</td>
                  <td className="px-6 py-4 text-[13px] font-medium text-text-secondary truncate max-w-[200px]">{item.action}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`rounded-full text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 border-transparent ${item.status === 'Active' ? 'bg-solo-teal/10 text-solo-teal' : 'bg-text-tertiary/10 text-text-tertiary'}`}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-[12px] font-bold text-text-tertiary">{item.lastRun}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => toggleStatus(item.id)}
                         className={`w-8 h-8 rounded-md transition-all active:scale-95 ${item.status === 'Active' ? 'text-solo-amber hover:text-solo-amber hover:bg-solo-amber/10' : 'text-solo-teal hover:text-solo-teal hover:bg-solo-teal/10'}`}
                       >
                         {item.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => deleteAutomation(item.id)}
                         className="w-8 h-8 rounded-md text-text-tertiary hover:text-solo-coral hover:bg-solo-coral/10 transition-all active:scale-95"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary transition-all active:scale-95">
                         <MoreHorizontal className="w-4 h-4" />
                       </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
             </AnimatePresence>
            )}
          </tbody>
        </table>
        {!isLoading && filteredAutomations.length === 0 && (
          <div className="p-12 text-center text-[14px] font-medium text-text-tertiary">
            No automations found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
