"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MoreHorizontal, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getClients, ClientResponse } from "@/lib/api";

export function ClientHealth() {
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error("Failed to fetch clients", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadClients();
  }, []);

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-[20px] font-bold text-text-primary flex items-center gap-3">
          <Users className="w-6 h-6 text-solo-blue" /> Client Health
        </h2>
        <button className="text-[13px] font-bold uppercase tracking-widest text-text-tertiary hover:text-solo-blue transition-colors flex items-center gap-1 group">
          View all 
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        className="glass bg-background-primary/40 rounded-[16px] border border-border-tertiary overflow-hidden shadow-sm"
      >
        <Table>
          <TableHeader className="bg-background-secondary/50 border-b border-border-tertiary">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-text-secondary h-12 px-6">Client Name</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-text-secondary h-12">Project</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-text-secondary h-12 hidden md:table-cell">Status</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-text-secondary h-12">Health Score</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-text-secondary h-12 hidden md:table-cell">Last Contact</TableHead>
              <TableHead className="text-right h-12 px-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                 <TableCell colSpan={6} className="text-center py-8 text-text-tertiary">Loading clients...</TableCell>
              </TableRow>
            ) : clients.slice(0, 4).map((client) => (
              <TableRow key={client.id} className="group border-b border-border-tertiary/50 hover:bg-background-secondary/30 transition-colors">
                <TableCell className="font-serif font-bold text-[16px] text-text-primary px-6 py-4">
                  {client.name}
                </TableCell>
                <TableCell className="text-[13px] font-medium text-text-secondary">
                  {client.project}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary bg-background-secondary px-2 py-1 rounded-md border border-border-tertiary/50">
                    {client.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full border-[2px] ${client.healthColor} ${client.healthColor.replace('border-', 'bg-')} shadow-sm`} />
                    <span className="text-[14px] font-bold text-text-primary group-hover:text-solo-blue transition-colors">
                      {client.healthScore}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-text-tertiary hidden md:table-cell">
                  {client.lastActive}
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="hidden sm:flex h-8 px-3 text-[12px] font-semibold text-text-secondary hover:text-solo-blue hover:bg-solo-blue/5 rounded-[6px] border border-transparent hover:border-solo-blue/20 transition-all">
                      {"Message"}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-text-tertiary hover:text-text-primary">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
