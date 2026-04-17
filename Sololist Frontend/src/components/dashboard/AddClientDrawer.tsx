"use client";

import { useState } from "react";
import { Plus, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AddClientDrawerProps {
  onClientAdded?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement | null;
}

export function AddClientDrawer({
  onClientAdded,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: AddClientDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    project_type: "",
    budget: "",
    source: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.company.trim()) {
      toast.error("Client name and company are required");
      return;
    }
    try {
      setIsSubmitting(true);
      await createClient(formData);
      toast.success("Client onboarding initiated successfully!");
      setOpen(false);
      setFormData({ name: "", company: "", email: "", project_type: "", budget: "", source: "" });
      if (onClientAdded) onClientAdded();
    } catch (e) {
      toast.error("Failed to add client");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-solo-blue hover:bg-solo-blue/90 text-white rounded-full h-11 px-6 text-[14px] font-bold shadow-lg shadow-solo-blue/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
      <Plus className="w-4 h-4" /> Add Client
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && (
        <SheetTrigger render={trigger} />
      )}
      {!trigger && (trigger !== null) && (
        <SheetTrigger render={defaultTrigger} />
      )}
      <SheetContent className="sm:max-w-[540px] p-0 border-l border-white/20 bg-white/70 backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col no-scrollbar">
        {/* PROGRESS HEADER BAR */}
        <div className="h-1.5 w-full bg-background-secondary relative overflow-hidden">
          <motion.div 
            initial={{ width: "33%" }}
            animate={{ width: "33%" }}
            className="absolute top-0 left-0 h-full bg-solo-blue shadow-[0_0_10px_rgba(55,138,221,0.5)]"
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-10 pb-24">
          <SheetHeader className="mb-10 text-left">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SheetTitle className="font-serif text-[32px] font-bold text-text-primary mb-2 tracking-tight">
                Onboard New Client
              </SheetTitle>
              <SheetDescription className="text-[14px] font-medium text-text-secondary flex items-center gap-2">
                Phase 1: <span className="text-text-primary font-bold">Strategic Intake</span> 
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <span className="opacity-50">Scope Detail</span>
              </SheetDescription>
            </motion.div>
          </SheetHeader>

          <motion.div 
            className="flex flex-col gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {[
              { label: "Lead Name", field: "name", placeholder: "e.g. Viktor Volkov (Creative Director)", required: true },
              { label: "Studio / Agency", field: "company", placeholder: "e.g. Blur Studio", required: true },
              { label: "Direct Email", field: "email", placeholder: "viktor@blur.com", type: "email" },
            ].map((item) => (
              <motion.div 
                key={item.field}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col gap-2.5"
              >
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-tertiary">
                  {item.label} {item.required && <span className="text-solo-coral">*</span>}
                </label>
                <Input
                  value={(formData as any)[item.field]}
                  onChange={(e) => setFormData({ ...formData, [item.field]: e.target.value })}
                  placeholder={item.placeholder}
                  type={item.type}
                  className="h-12 bg-white/50 border-border-tertiary rounded-[12px] focus-visible:ring-solo-blue/20 focus-visible:border-solo-blue text-[15px] font-medium transition-all hover:bg-white"
                />
              </motion.div>
            ))}

            <motion.div 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-col gap-2.5"
            >
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-tertiary">Production Vertical</label>
              <Select
                value={formData.project_type}
                onValueChange={(val) => setFormData({ ...formData, project_type: val || "" })}
              >
                <SelectTrigger className="h-12 bg-white/50 border-border-tertiary rounded-[12px] focus:ring-solo-blue/20 text-[15px] font-medium transition-all hover:bg-white">
                  <SelectValue placeholder="Select vertical" />
                </SelectTrigger>
                <SelectContent className="rounded-[16px] border-border-tertiary p-2 shadow-2xl">
                  <SelectItem value="character" className="rounded-lg">Character Art / Sculpting</SelectItem>
                  <SelectItem value="vfx" className="rounded-lg">VFX / Simulation</SelectItem>
                  <SelectItem value="archviz" className="rounded-lg">ArchViz Rendering</SelectItem>
                  <SelectItem value="modeling" className="rounded-lg">Hard Surface Modeling</SelectItem>
                  <SelectItem value="lookdev" className="rounded-lg">LookDev / Environment</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-tertiary">Target Budget</label>
                <Input
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="$10,000 +"
                  className="h-12 bg-white/50 border-border-tertiary rounded-[12px] focus-visible:ring-solo-blue/20 text-[15px] font-medium"
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-tertiary">Acquisition Channel</label>
                <Select
                  value={formData.source}
                  onValueChange={(val) => setFormData({ ...formData, source: val || "" })}
                >
                  <SelectTrigger className="h-12 bg-white/50 border-border-tertiary rounded-[12px] focus:ring-solo-blue/20 text-[15px] font-medium">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[16px] border-border-tertiary p-2 shadow-2xl">
                    <SelectItem value="referral" className="rounded-lg">Direct Referral</SelectItem>
                    <SelectItem value="portfolio" className="rounded-lg">ArtStation / Portfolio</SelectItem>
                    <SelectItem value="linkedin" className="rounded-lg">LinkedIn Professional</SelectItem>
                    <SelectItem value="upwork" className="rounded-lg">Premium Upwork</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* FOOTER */}
        <div className="p-10 bg-white/40 border-t border-white/20 flex flex-col gap-4">
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full bg-solo-blue hover:bg-solo-blue/90 text-white rounded-full h-14 text-[16px] font-bold shadow-xl shadow-solo-blue/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? "Onboarding Lead..." : "Next: Production Setup"}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="w-full h-12 rounded-full text-[14px] font-bold text-text-tertiary hover:text-text-primary hover:bg-black/5"
          >
            Draft & Save for Later
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
