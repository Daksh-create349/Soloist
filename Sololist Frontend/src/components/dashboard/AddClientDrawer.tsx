"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface AddClientDrawerProps {
  onClientAdded?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AddClientDrawer({ 
  onClientAdded, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen,
  trigger
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        trigger || (
          <SheetTrigger 
            render={
              <Button className="bg-solo-blue hover:bg-solo-blue/90 text-white rounded-[6px] h-9 px-4 text-[13px] font-bold shadow-lg shadow-solo-blue/20 transition-all">
                <Plus className="w-4 h-4 mr-2" />Add Client
              </Button>
            } 
          />
        )
      )}
      <SheetContent className="sm:max-w-[480px] bg-background-primary/95 glass border-l-border-tertiary">
        <SheetHeader className="mb-8">
          <SheetTitle className="font-serif text-[28px] font-bold text-text-primary tracking-tight">
            Add New Client
          </SheetTitle>
          <SheetDescription className="text-[14px]">
            Step 1 of 3 — <span className="font-bold text-text-primary">Basic Info</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-secondary">Client Name</label>
            <Input 
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Sarah Chen" className="h-11 bg-background-secondary rounded-[8px] border-border-tertiary focus-visible:ring-solo-blue text-[14px]" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-secondary">Company</label>
            <Input 
              value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})}
              placeholder="e.g. Stripe Inc." className="h-11 bg-background-secondary rounded-[8px] border-border-tertiary focus-visible:ring-solo-blue text-[14px]" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-secondary">Email</label>
            <Input 
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="sarah@stripe.com" type="email" className="h-11 bg-background-secondary rounded-[8px] border-border-tertiary focus-visible:ring-solo-blue text-[14px]" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-secondary">Project Type</label>
            <Select value={formData.project_type} onValueChange={(val) => setFormData({...formData, project_type: val})}>
              <SelectTrigger className="h-11 bg-background-secondary rounded-[8px] border-border-tertiary focus:ring-solo-blue text-[14px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-secondary">Estimated Budget</label>
            <Input 
              value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})}
              placeholder="$10,000" className="h-11 bg-background-secondary rounded-[8px] border-border-tertiary focus-visible:ring-solo-blue text-[14px]" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-secondary">How did they find you?</label>
            <Select value={formData.source} onValueChange={(val) => setFormData({...formData, source: val})}>
              <SelectTrigger className="h-11 bg-background-secondary rounded-[8px] border-border-tertiary focus:ring-solo-blue text-[14px]">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="website">Website / Portfolio</SelectItem>
                <SelectItem value="upwork">Upwork</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <Button 
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex-1 bg-solo-blue hover:bg-solo-blue/90 text-white rounded-[6px] h-12 text-[14px] font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95"
          >
            {isSubmitting ? "Saving..." : "Next: Project Details →"}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)} className="px-6 h-12 rounded-[6px] text-[14px] font-bold text-text-secondary hover:bg-background-secondary active:scale-95">
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

