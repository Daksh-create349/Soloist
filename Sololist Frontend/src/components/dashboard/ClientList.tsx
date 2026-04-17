"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { AddClientDrawer } from "./AddClientDrawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClientResponse } from "@/lib/api";

interface ClientListProps {
  clients: ClientResponse[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onClientAdded?: () => void;
}

export function ClientList({ clients, activeId, onSelect, onClientAdded }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Risk">("All");

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           client.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === "All" || 
                           (filter === "Active" && client.status === "Active") ||
                           (filter === "Risk" && client.status === "At risk");
      
      return matchesSearch && matchesFilter;
    });
  }, [clients, searchQuery, filter]);

  return (
    <div data-lenis-prevent className="w-[320px] h-full flex flex-col border-r border-border-tertiary bg-background-primary shrink-0 overflow-hidden relative z-20">
      <div className="p-6 pb-4 border-b border-border-tertiary bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-[22px] font-bold text-text-primary tracking-tight">
            Clients
          </h2>
          <AddClientDrawer onClientAdded={onClientAdded} />
        </div>
        
        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-background-secondary rounded-[6px] pl-9 pr-4 text-[13px] font-medium text-text-primary placeholder:text-text-tertiary border border-border-tertiary focus:outline-none focus:border-solo-blue focus:ring-1 focus:ring-solo-blue transition-all"
          />
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 text-[12px] font-bold uppercase tracking-widest text-text-secondary">
          <button 
            onClick={() => setFilter("All")}
            className={`pb-2 shrink-0 transition-all ${filter === "All" ? "text-solo-blue border-b-2 border-solo-blue" : "hover:text-text-primary border-b-2 border-transparent"}`}
          >
            All ({clients.length})
          </button>
          <button 
            onClick={() => setFilter("Active")}
            className={`pb-2 shrink-0 transition-all ${filter === "Active" ? "text-solo-blue border-b-2 border-solo-blue" : "hover:text-text-primary border-b-2 border-transparent"}`}
          >
            Active ({clients.filter(c => c.status === "Active").length})
          </button>
          <button 
            onClick={() => setFilter("Risk")}
            className={`pb-2 shrink-0 transition-all ${filter === "Risk" ? "text-solo-blue border-b-2 border-solo-blue" : "hover:text-text-primary border-b-2 border-transparent"}`}
          >
            Risk ({clients.filter(c => c.status === "At risk").length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div 
              key={client.id}
              onClick={() => onSelect(client.id)}
              className={`flex items-center gap-4 px-6 py-4 border-b border-border-tertiary/50 cursor-pointer transition-colors ${
                activeId === client.id 
                  ? "bg-solo-blue/[0.03] border-l-2 border-l-solo-blue" 
                  : "border-l-2 border-l-transparent hover:bg-background-secondary/50"
              }`}
            >
              <div className="relative">
                <Avatar className={`w-10 h-10 border border-border-tertiary ${client.avatarBg}`}>
                  <AvatarFallback className="text-white text-[12px] font-bold tracking-wider bg-transparent">
                    {client.initials}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${client.healthColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className={`text-[14px] font-bold truncate tracking-tight ${activeId === client.id ? "text-solo-blue" : "text-text-primary"}`}>
                    {client.name}
                  </h4>
                  <span className="text-[10px] font-semibold text-text-tertiary shrink-0 ml-2">
                    {client.lastActive}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="font-semibold text-text-secondary truncate">{client.company}</span>
                  <span className="text-text-tertiary text-[10px]">•</span>
                  <span className="text-text-tertiary font-medium truncate">{client.project}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-[13px] text-text-tertiary font-medium">
            No clients found.
          </div>
        )}
      </div>
    </div>
  );
}
