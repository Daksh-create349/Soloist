"use client";

import { useEffect, useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createInvoice, ClientResponse } from "@/lib/api";

interface NewInvoiceDrawerProps {
  client: ClientResponse;
  onInvoiceCreated?: () => void;
  trigger?: React.ReactNode;
}

export function NewInvoiceDrawer({ client, onInvoiceCreated, trigger }: NewInvoiceDrawerProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "2500",
    invoice_number: `#${Math.floor(Math.random() * 900) + 100}`,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createInvoice({
        client_id: client.id,
        amount: parseFloat(formData.amount),
        invoice_number: formData.invoice_number,
        due_date: formData.due_date
      });
      
      toast.success(`Invoice ${formData.invoice_number} sent to ${client.name}`);
      setOpen(false);
      onInvoiceCreated?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        trigger || (
          <Button variant="outline" size="sm" className="h-9 px-4 text-[13px] font-bold border-border-tertiary">
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </Button>
        )
      } />
      
      <SheetContent className="sm:max-w-[480px] bg-background-primary/95 glass border-l-border-tertiary">
        <SheetHeader className="mb-8">
          <SheetTitle className="font-serif text-[28px] font-bold text-text-primary tracking-tight flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-solo-blue/10 flex items-center justify-center border border-solo-blue/20">
               <Receipt className="w-5 h-5 text-solo-blue" />
             </div>
             Draft Invoice
          </SheetTitle>
          <SheetDescription className="text-text-secondary text-[14px]">
            Generate a professional invoice for <span className="font-bold text-text-primary">{client.company}</span>.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
                Invoice Number
              </label>
              <Input 
                value={formData.invoice_number}
                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                required
                className="bg-white border-border-tertiary h-11 text-[14px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">$</span>
                <Input 
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  className="bg-white border-border-tertiary h-11 pl-8 text-[14px] font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
                Due Date
              </label>
              <Input 
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                required
                className="bg-white border-border-tertiary h-11 text-[14px]"
              />
            </div>
          </div>

          <div className="bg-solo-blue/5 rounded-[16px] p-5 border border-solo-blue/10">
            <h4 className="flex items-center gap-2 text-[13px] font-bold text-solo-blue mb-2">
              <Sparkles className="w-4 h-4" /> AI Invoice Insight
            </h4>
            <p className="text-[12px] font-medium text-text-secondary leading-relaxed">
              This amount aligns with your {client.project} contract terms. AI suggests sending now to avoid weekend payment delays.
            </p>
          </div>

          <div className="pt-6 border-t border-border-tertiary flex gap-4">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="flex-1 text-text-secondary hover:text-text-primary text-[14px] font-bold"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-solo-blue hover:bg-solo-blue/90 text-white shadow-lg shadow-solo-blue/20 text-[14px] font-bold h-11"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate & Send"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
